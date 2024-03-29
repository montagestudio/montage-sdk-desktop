// Load native UI library
var gui = require('nw.gui');
var win = gui.Window.get(); 
var manifest = gui.App.manifest;

var winState;
var currWinMode;
var resizeTimeout;
var isMaximizationEvent = false;
// extra height added in linux x64 gnome-shell env, use it as workaround
var deltaHeight = gui.App.manifest.window.frame ? 0 : 'disabled';

//Make sure that the window is displayed somewhere on a screen that is connected to the PC. 
//Imagine you run the program on a secondary screen connected to a laptop - and then the next time you start the 
//program the screen is not connected...
gui.Screen.Init();

function asyncCall(func) {
	return setTimeout(func, 500);
}

function isTabletMode (callback) {

	// Only window
	if (['win32', 'win64'].indexOf(process.platform) === -1) {
		callback(new Error('NotWindow'), false);
		return;
	}

	// HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\ImmersiveShell
	// TabletMode DWORD
	//
	// 0 = Off
	// 1 = On

	var Registry = require('winreg'),  	
		regKey = new Registry({ // new operator is optional 
	      hive: Registry.HKCU, // open registry hive HKEY_CURRENT_USER                                       			  
	      key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\ImmersiveShell' // key containing ui-state
	});

	// list autostart programs 
	regKey.values(function (err, items /* array of RegistryItem */) {
	  	if (err) {
	    	callback(err);
	  	} else {
		    for (var i=0; i<items.length; i++) {
		      callback(null, items[i].value === '0x1');
		    }
	    }
	});
}

// Fix copy paste
function enableCopyPaste(app) {

	var menu = new gui.Menu({
		type: 'menubar'
	});

	if (process.platform === 'darwin') {
		menu.createMacBuiltin(manifest.window.title, {
			hideEdit: false,
	    	hideWindow: true
		});	
	} else {

		// Create sub-menu
		var menuItems = new gui.Menu({ type: 'menubar' });

		// Create 'Quit' menu item
		menuItems.append(new gui.MenuItem({ 
			type: 'normal',
			label: 'Quit',
			key: 'q',
			modifiers: "Command",
			click: function() { 
				gui.App.quit();
			}
		}));

		menu.append(new gui.MenuItem({
	        label: 'File',
	        submenu: menuItems
	    }));
	}

	// Create sub-menu
	var windowMenuItems = new gui.Menu();

	windowMenuItems.append(new gui.MenuItem({ 
		label: 'Maximize Window',
		key: 'm',
		modifiers: "Command",
		click: function() { 
    		win.leaveFullscreen();
			asyncCall(function () {
				win.show();
				win.restore(); 
				asyncCall(function () {
					win.maximize();
				});
			});	
		} 
	}));

	windowMenuItems.append(new gui.MenuItem({ 
		label: 'Minimize Window',
		click: function() {
    		win.leaveFullscreen(); 
			asyncCall(function () {
				win.minimize();
			}); 
		} 
	}));	

	windowMenuItems.append(new gui.MenuItem({
		type: 'separator'
	}));

	var visibleWindow = true;
	windowMenuItems.append(new nw.MenuItem({ 
		label: 'Hide/Show Window',
		click: function() { 

			visibleWindow = !visibleWindow;
    		if (visibleWindow) {
    			win.show();
				win.restore(); 
    		} else {
    			win.hide();
    		}
		}
	}));

	windowMenuItems.append(new gui.MenuItem({ 
		label: 'Reset Window',
		click: function() {
			win.leaveFullscreen();
			asyncCall(function () {
        		win.show();
				win.restore(); 
				asyncCall(function () {
					win.resizeTo(manifest.window.width, manifest.window.height);
					win.setPosition(manifest.window.position);
				});
			});
		} 
	}));

	windowMenuItems.append(new gui.MenuItem({
		type: 'separator'
	}));

	windowMenuItems.append(new gui.MenuItem({ 
		label: 'Toggle Full Screen',
		key: 'f',
		modifiers: "Command",
		click: function() {
			asyncCall(function () {
				win.show();
				win.toggleFullscreen();
			});
		} 
	}));

    menu.append(new gui.MenuItem({
        label: 'Window',
        submenu: windowMenuItems // menu elements from menuItems object
    }));
	
	// Create sub-menu
	var menuItems = new gui.Menu();
		
	if (manifest.docUrl) {
		menuItems.append(new gui.MenuItem({ 
			label: 'Documentation',
			click: function() { 
				gui.Shell.openExternal(manifest.docUrl);
			} 
		}));	
	}
	
	if (manifest.supportUrl) {
		menuItems.append(new gui.MenuItem({ 
			label: 'Support',
			click: function() { 
				gui.Shell.openExternal(manifest.supportUrl);
			} 
		}));	
	}

	if (manifest.supportUrl || manifest.docUrl) {
		menuItems.append(new gui.MenuItem({
			type: 'separator'
		}));
	}

	// Create 'Check for update' menu item
	if (manifest.updateUrl) {
		menuItems.append(new gui.MenuItem({ 
			type: 'normal',
			label: 'Check for update',
			click: function () {
				checkForUpdate(app);
			} 
		}));
	}

	menuItems.append(new gui.MenuItem({ 
		label: 'Reset Local Cache',
		click: function() { 
			gui.App.clearCache();
			localStorage['windowState'] = 'reset';
		} 
	}));

	menuItems.append(new gui.MenuItem({
		type: 'separator'
	}));

	// Create 'Open' menu item
	menuItems.append(new gui.MenuItem({ 
		type: 'normal',
		label: 'Open URL',
		key: 'q',
		modifiers: "Command",
		click: function() {
			var appUrl = window.prompt('Enter URL:');
			if (appUrl && app.onOpen(appUrl) === false) {
				alert('Invalid URL');
			}
		}
	}));

	// Create 'Console' menu item
	var showToolbar = false;
	var iframeEl = document.getElementById('iframe');
	menuItems.append(new gui.MenuItem({ 
		type: 'normal',
		label: 'Show/Hide Dev Tools',
		key: 'i',
		modifiers: "alt+Command",
		click: function () {
			if (!showToolbar) {
				win.showDevTools(iframeEl);
			} else {
				win.closeDevTools();
			}
			showToolbar = !showToolbar;
		} 
	}));
	
	menu.append(new gui.MenuItem({
        label: 'Help',
        submenu: menuItems // menu elements from menuItems object
    }));

	gui.Window.get().menu = menu;	
}

// Enable Screen-share
function enableScreenShare(app) {

	// this object is used to make sure our extension isn't conflicted with irrelevant messages!
	var rtcmulticonnectionMessages = {
	    'are-you-there': true,
	    'get-sourceId':  true,
	    'is-tablet-mode': true
	};

	var session = [
	    'screen', 
	    'window',
	    //'tab' // tab capture not yet supported on Linux
	];

	var pending = false;

	// this event handler watches for messages sent from the webpage
	// it receives those messages and forwards to background script
	window.addEventListener('message', function (event) {

		var iframeEl = document.getElementById('iframe');

	    // if invalid source
	    if (
	        event.source !== iframeEl.contentWindow	&&
	        	event.source.parent !== iframeEl.contentWindow
	    ) {
	        return;
	    }
	        
	    // it is 3rd party message
	    if(event.data && rtcmulticonnectionMessages.hasOwnProperty(event.data))  {
	      
	    	if (event.data === 'is-tablet-mode') {
				isTabletMode(function (err, isTabletMode) {
					if (isTabletMode) {
						event.source.postMessage('is-tablet-mode', '*');
					}
				});

	        // if browser is asking whether extension is available
	        } else if(event.data == 'are-you-there') {
	            event.source.postMessage('extension-loaded', '*');
	        
	        // if it is something that need to be shared with background script
	        } else if(pending === false && event.data == 'get-sourceId') {
	        	
	        	pending = true;

				gui.Screen.chooseDesktopMedia(session, 
				  function(streamId) {
				    	
			    	pending = false;
				    
				    // if "cancel" button is clicked
				    if(!streamId || !streamId.length) {
				        return event.source.postMessage('PermissionDeniedError', '*');
				    }
				    
				    // "ok" button is clicked; share "sourceId" with the
				    // content-script which will forward it to the webpage
				    event.source.postMessage({
				        chromeMediaSourceId: streamId
				    }, '*');
				  }
				);
	        }
	    }  
	});
}

function getParentNodeByTagName(el, tagName) {
    if(el.tagName === tagName) return el;
    if(el.parentNode) return getParentNodeByTagName(el.parentNode, tagName); // a parent
    return false; // not the element nor its parents
}

function externalLinker(e) {
    var link = getParentNodeByTagName(e.target, 'A'),
        rel, // declared now, defined later
        target = link.target,
        href = link.href;

    // TODO allready prevented
    // abort link hijack if crucial variables are not defined or if user sets link to target='_self'
    if (!link || !link.getAttribute || !href || !target || target === '_self') {
      return;
    }

    // defined now that we know that link.getAttribute is not undefined
    rel = link.getAttribute('rel');

    // hijack the link and open in a new window under these conditions
    if (rel === 'external' || target === '_blank' || target === '_top' || href.substr(0, 4) === 'http') {
      e.preventDefault();
      gui.Shell.openExternal(href);
    }
  }

function versionCompare(v1, v2, options) {
	var lexicographical = options && options.lexicographical,
		zeroExtend = options && options.zeroExtend,
		v1parts = v1.split('.'),
		v2parts = v2.split('.');

	function isValidPart(x) {
		return (lexicographical ? /^\d+[A-Za-z]*$/ : /^\d+$/).test(x);
	}

	if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
		return NaN;
	}

	if (zeroExtend) {
		while (v1parts.length < v2parts.length) v1parts.push("0");
		while (v2parts.length < v1parts.length) v2parts.push("0");
	}

	if (!lexicographical) {
		v1parts = v1parts.map(Number);
		v2parts = v2parts.map(Number);
	}

	for (var i = 0; i < v1parts.length; ++i) {
		if (v2parts.length == i) {
			return 1;
		}

		if (v1parts[i] == v2parts[i]) {
			continue;
		}
		else if (v1parts[i] > v2parts[i]) {
			return 1;
		}
		else {
			return -1;
		}
	}

	if (v1parts.length != v2parts.length) {
		return -1;
	}

	return 0;
}
var checkForUpdateTimer; 
function checkForUpdate (app) {		

	clearTimeout(checkForUpdateTimer);

	// Load online app after 1 sec anyway
	function reqTimeout () {
		app.onStatus("Checking for update... Oups!");
		app.onOpen(appUrl);
	}	

	// Check version
	function reqListener () {

		if (this.responseText) {
			try {

				var currentManifest = JSON.parse(this.responseText),
					currentVersion = currentManifest.version;

				console.info("Installed Version " + manifest.version + " vs " + "Current " + currentVersion);

				if (versionCompare(manifest.version, currentVersion) < 0) {

					gui.App.clearCache();
				
					app.onStatus("New version available for download.");

					// Propose new version via download page
					var userWantUpdate = window.confirm(
						'A New version of "' + manifest.window.title + '" is available, would you like to download it now?'
					);

					if (userWantUpdate) {
						gui.Shell.openExternal(manifest.downloadUrl);

						checkForUpdateTimer = setTimeout(function () {
							app.onStatus("");
						}, 30000);
					} else {
						app.onStatus("");
					}


				} else {
					app.onStatus("");
				}
			} catch (err) {
				console.error(err);
				app.onStatus("Unable to check for update. Try again later.");
				checkForUpdateTimer = setTimeout(function () {
					app.onStatus("");
				}, 5000);
			}
		}
	}		

	var oReq = new XMLHttpRequest(),
		oReqTimer;

	oReqTimer = setTimeout (function () {
		oReq.timeout = 5000;
		oReq.onload = reqListener;
		oReq.ontimeout = reqTimeout;
		oReq.open("get", manifest.updateUrl + "?t=" + Date.now(), true);
		oReq.send();
		app.onStatus("Checking for update...");	
	});

	console.info("Checking for update...");

	return {
		request: oReq,
		cancel: function cancel () {
			oReq.abort();
			clearTimeout(oReqTimer);
		}
	};
}

function checkForOpen(app, argv) {

	var scheme = manifest.appScheme + ':/',
		openParam = typeof argv === 'string' ? argv : argv.join(' ') || "",
		schemeIndex = openParam ? openParam.indexOf(scheme) : -1,
		hasScheme = schemeIndex > -1;
	
	if (hasScheme) {
		app.onOpen(openParam.substring(schemeIndex + scheme.length, openParam.length));	
	}
	
	return hasScheme;
}


function initWindowState(app) {
    // Don't resize the window when using LiveReload.
    // There seems to be no way to check whether a window was reopened, so let's
    // check for dev tools - they can't be open on the app start, so if
    // dev tools are open, LiveReload was used.
    if (!win.isDevToolsOpen || !win.isDevToolsOpen()) {
        winState = JSON.parse(localStorage.windowState || 'null');

        if (winState) {
            currWinMode = winState.mode;
            if (currWinMode === 'maximized') {
                win.maximize();
            } else {
                restoreWindowState();
            }
        } else {
            currWinMode = 'normal';
            dumpWindowState();
        }

        win.show();
    }
}

function dumpWindowState(app) {
    if (!winState) {
        winState = {};
    }

    // we don't want to save minimized state, only maximized or normal
    if (currWinMode === 'maximized') {
        winState.mode = 'maximized';
    } else {
        winState.mode = 'normal';
    }

    // when window is maximized you want to preserve normal
    // window dimensions to restore them later (even between sessions)
    if (currWinMode === 'normal') {
        winState.x = win.x;
        winState.y = win.y;
        winState.width = win.width;
        winState.height = win.height;

        // save delta only of it is not zero
        if (deltaHeight !== 'disabled' && deltaHeight !== 0 && currWinMode !== 'maximized') {
            winState.deltaHeight = deltaHeight;
        }
    }
}

function restoreWindowState(app) {
    // deltaHeight already saved, so just restore it and adjust window height
    if (deltaHeight !== 'disabled' && typeof winState.deltaHeight !== 'undefined') {
        deltaHeight = winState.deltaHeight
        winState.height = winState.height - deltaHeight
    }

    var screens = gui.Screen.screens;
    var locationIsOnAScreen = false;
    for (var i = 0; i < screens.length; i++) {
        var screen = screens[i];
        if (winState.x > screen.bounds.x && winState.x < screen.bounds.x + screen.bounds.width) {
            if (winState.y > screen.bounds.y && winState.y < screen.bounds.y + screen.bounds.height) {
                //console.debug("Location of window (" + winState.x + "," + winState.y + ") is on screen " + JSON.stringify(screen));
                locationIsOnAScreen = true;
            }
        }
    }

    if (!locationIsOnAScreen) {
        //console.debug("Last saved position of windows is not usable on current monitor setup. Moving window to center!");
        win.setPosition("center");
    }
    else {
        win.resizeTo(winState.width, winState.height);
        win.moveTo(winState.x, winState.y);
    }
}

function saveWindowState(app) {

    dumpWindowState(app);

    if (localStorage['windowState'] === 'reset') {
        localStorage['windowState'] = '';
    } else {
        localStorage['windowState'] = JSON.stringify(winState);   
    }
}

function isValidNavigation(app, newUrl) {

	var newUrlParser = document.createElement('a'),
		allowedUrlParser = document.createElement('a');

	function validateAppUrl(allowedUrl, newUrl) {
		newUrlParser.href = newUrl;
		allowedUrlParser.href = allowedUrl;
		return newUrlParser.protocol && newUrlParser.hostname && (
				newUrlParser.hostname === allowedUrlParser.hostname ||
					newUrlParser.hostname.indexOf("." + allowedUrlParser.hostname) > 0 ||
						allowedUrlParser.hostname.indexOf(allowedUrlParser.hostname.replace("*.", ".")) > 0
			);
	}

	return validateAppUrl(manifest.appUrl, newUrl) || 
			manifest.allowNavigation.filter(function (allowedUrl) {
				return validateAppUrl(allowedUrl, newUrl)
			}).length > 0;
}

var app = {

	url: null,

    // Application Constructor
    initialize: function() {


		enableCopyPaste(app);
		enableScreenShare(app);
		initWindowState(app);

        app.bindEvents();
    },

    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
		
		app.update = checkForUpdate(app);
		
		app.open = checkForOpen(app, gui.App.argv);
		
		if (app.open === false) {
			app.onOpen(manifest.appUrl);
		}

		gui.App.on('open', function (cmdline) {
			app.open = checkForOpen(app, cmdline); 
		});

		win.on('maximize', function () {
		    isMaximizationEvent = true;
		    currWinMode = 'maximized';
		});

		win.on('unmaximize', function () {
		    currWinMode = 'normal';
		    restoreWindowState();
		});

		win.on('minimize', function () {
		    currWinMode = 'minimized';
		});

		win.on('restore', function () {
		    currWinMode = 'normal';
		});

		win.window.addEventListener('resize', function () {
		    // resize event is fired many times on one resize action,
		    // this hack with setTiemout forces it to fire only once
		    clearTimeout(resizeTimeout);
		    resizeTimeout = setTimeout(function () {

		        // on MacOS you can resize maximized window, so it's no longer maximized
		        if (isMaximizationEvent) {
		            // first resize after maximization event should be ignored
		            isMaximizationEvent = false;
		        } else {
		            if (currWinMode === 'maximized') {
		                currWinMode = 'normal';
		            }
		        }

		        // there is no deltaHeight yet, calculate it and adjust window size
		        if (deltaHeight !== 'disabled' && deltaHeight === false) {
		            deltaHeight = win.height - winState.height;

		            // set correct size
		            if (deltaHeight !== 0) {
		                win.resizeTo(winState.width, win.height - deltaHeight);
		            }
		        }

		        dumpWindowState();

		    }, 500);
		}, false);

		win.on('close', function () {
		    dumpWindowState();
		        
		    try {
		        saveWindowState();
		    } catch(err) {
		        console.error("winstateError: " + err);
		    }
		    win.close(true);
		});
    },

    // onopen Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onOpen: function(newSrc) {

    	//console.log('onOpen', newSrc);
	
		var iframeEl = document.getElementById('iframe'),
			iframeSrc = iframeEl.src;
		
		// package url should be the root of new location
		if (isValidNavigation(app, newSrc) === false) {

			// Ingore externals
			if (iframeSrc === 'about:blank') {
				window.close();
				return false;
			
			} else if (newSrc === 'reset-cache') {
				gui.App.clearCache();

				// Continue

			// Open a new window.
			} else if (newSrc === 'new') {
	  			gui.Window.open(manifest.appUrl, { 
	  				new_instance: true,
	  				transparent: false,
	  				frame: true
	  			});
				return true;
			} else {
				return false;
			}

		} else {
			window.focus();
		}
		
		// compare with iframe current location to avoid loop	
		// and exclude all sub state/path change 
		if (iframeSrc.indexOf(newSrc) === 0) {
			return newSrc;
		}

		clearTimeout(app.onOpenTimer);
		
		app.onStatus("Loading " + newSrc);
			
		app.onOpenTimer = setTimeout(function() {
			
			// Add nodewebkit scheme if missing
			if (newSrc.indexOf('nodewebkit') === -1) {
				newSrc += ((newSrc.indexOf('?') > -1) ? '&' : '?') + 'nodewebkit';
			}
			
			iframeEl.src = newSrc;
			app.showFrameLoader(true);
			
			if (iframeEl.contentWindow && iframeEl.contentWindow.window) {
	    		setTimeout(function () {
				app.showLoader(false);
					iframeEl.contentWindow.window.removeEventListener('click', externalLinker, false);
			    	iframeEl.contentWindow.window.addEventListener('click', externalLinker, false);	
	    		}, 250);
			}
			
			iframeEl.onload = function () {
				app.showFrameLoader(false);
				app.onStatus("");

				// inform browser that you're available!
				iframeEl.contentWindow.postMessage('extension-loaded', '*');
				//console.info("iframeEl.onload", newSrc);
			};
			
			iframeEl.onerror = function (err) {
				app.showFrameLoader(false);
				app.onStatus("Error: " + err.message);
				//console.error("iframeEl.onerror", newSr, err);
			};

		}, 250);

		return newSrc;
    },

    showLoader: function (show) {

		var loaderEl = document.getElementById('loader');
		loaderEl.style.display = show ? 'block' : 'none';
    },

    showFrameLoader: function (show) {

		var loaderEl = document.getElementById('iframeLoader');
		loaderEl.style.display = show ? 'block' : 'none';
    },
	
	onStatus: function (statusText) {
	
		var statusEl = document.getElementById('status');
		statusEl.innerHTML = statusText;	
		statusEl.style.display = statusText.length ? 'block' : 'none';
	}
};

app.initialize();