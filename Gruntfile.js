module.exports = function(grunt) {
    var buildPlatforms = parseBuildPlatforms(grunt.option('platforms'));

    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),

        nwjs: {
            options: {
                appName: '<%= pkg.window.title %>',
                appVersion: '<%= pkg.version %>',
                version: '<%= pkg.nwjsVersion %>',
                flavor: 'sdk',
                cacheDir: './build/cache',
                buildDir: './build/binaries', // Where the build version of my node-webkit app is saved
                macIcns: './app/img/icon.icns', // Path to the Mac icon file
                mac64: buildPlatforms.mac,
                win64: buildPlatforms.win64,
                win32: buildPlatforms.win32,
                linux64: buildPlatforms.linux64,    
                linux32: buildPlatforms.linux32,
                macPlist: "./platforms/osx/Info.plist",
                winIco: "./app/img/icon.ico",
                zip: false,
                macCredits: false,
                buildType: function () {
                    return this.appVersion;
                }
            },
            src: [
                './package.json',
                './app/**/*',
                './node_modules/winreg/**/*',
                '!./node_modules/**',
                '!./README.md'
            ]
        },

        rcedit: {
            exes: {
                files: [{
                    expand: true,
                    cwd: './build/binaries/',
                    src: ['**/<%= pkg.window.title %>.exe']
                }],
                options: {
                    'icon': './app/img/icon.ico',
                    'file-version': '<%= pkg.version %>',
                    'product-version': '<%= pkg.version %>',
                    'version-string': {
                        'ProductName': '<%= pkg.window.title %>',
                        'FileDescription': '<%= pkg.window.title %>',
                        'CompanyName': '<%= pkg.author %>',
                        'LegalCopyright': '<%= pkg.license %>'
                    }
                }
            }
        },

        exec: {

            win64: {
              command: "wine ~/.wine/drive_c/Program\\ Files\\ \\(x86\\)/Inno\\ Setup\\ 5/ISCC.exe /cc platforms/windows/windows-installer-x64.iss",
                stdout: true,
                stderr: true
            },

            win32: {
              command: "wine ~/.wine/drive_c/Program\\ Files\\ \\(x86\\)/Inno\\ Setup\\ 5/ISCC.exe /cc platforms/windows/windows-installer-x86.iss",
                stdout: true,
                stderr: true
            },
            linux: {
              command: "cd platforms/linux && sh fpm.sh",
                stdout: true,
                stderr: true
            },
        },

        appdmg: {
            options: {
                title: '<%= pkg.window.title %>',
                icon: './app/img/icon.icns',
                "icon-size": 128,
                background: './platforms/osx/dmg-background.png',
                contents: [
                    {x: 410, y: 220, type: 'link', path: '/Applications'},
                    {x: 130, y: 220, type: 'file', path: "./build/binaries/<%= pkg.version %>/osx64/<%= pkg.window.title %>.app"},
                ]
            },
            target: {
                dest: './build/releases/<%= pkg.window.title %>-Setup-<%= pkg.version %>.dmg'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-nw-builder');
    grunt.loadNpmTasks('grunt-appdmg');
    grunt.loadNpmTasks('grunt-debian-package');
    grunt.loadNpmTasks('grunt-rcedit');
    grunt.loadNpmTasks('grunt-exec');

    grunt.registerTask('package:linux', ['exec:linux']);
    grunt.registerTask('package:mac', ['appdmg']);
    grunt.registerTask('package:win', ['rcedit', 'exec:win32', 'exec:win64']);
    grunt.registerTask('package:win32', ['rcedit', 'exec:win32']);
    grunt.registerTask('package:win64', ['rcedit', 'exec:win64']);
    grunt.registerTask('package', ['package:win', 'package:mac']);
    grunt.registerTask('build', ['nwjs']);

};

var parseBuildPlatforms = function(argumentPlatform) {
    // this will make it build no platform when the platform option is specified
    // without a value which makes argumentPlatform into a boolean
    var inputPlatforms = argumentPlatform || process.platform + ";" + process.arch;

    // Do some scrubbing to make it easier to match in the regexes bellow
    inputPlatforms = inputPlatforms.replace("darwin", "mac");
    inputPlatforms = inputPlatforms.replace(/;ia|;x|;arm/, "");

    var buildAll = /^all$/.test(inputPlatforms);

    var buildPlatforms = {
        mac: /mac/.test(inputPlatforms) || buildAll,
        win64: /win64/.test(inputPlatforms) || buildAll,
        win32: /win32/.test(inputPlatforms) || buildAll,
        linux32: /linux32/.test(inputPlatforms) || buildAll,
        linux64: /linux64/.test(inputPlatforms) || buildAll
    };

    return buildPlatforms;
}
