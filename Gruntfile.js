module.exports = function(grunt) {
    var buildPlatforms = parseBuildPlatforms(grunt.option('platforms'));

    grunt.initConfig({
        
        pkg: grunt.file.readJSON('package.json'),

        nwjs: {
            options: {
                appName: '<%= pkg.window.title %>',
                appVersion: '<%= pkg.version %>',
                version: '0.14.6',
                cacheDir: './build/cache',
                buildDir: './build/binaries', // Where the build version of my node-webkit app is saved
                macIcns: './app/img/icon.icns', // Path to the Mac icon file
                mac64: buildPlatforms.mac,
                win64: buildPlatforms.win,
                linux64: buildPlatforms.linux64,
                macPlist: "dist/osx/Info.plist",
                //winIco: "./app/img/icon.ico",
                zip: false,
                macCredits: false,
                buildType: function () {
                    return this.appVersion;
                }
            },
            src: [
                './package.json',
                './app/**/*',
                './node_modules/**',
                '!./node_modules/grunt*/**',
                '!./README.md'
            ]
        },

        appdmg: {
            options: {
                title: '<%= pkg.window.title %>',
                icon: './app/img/icon.icns',
                "icon-size": 128,
                background: './dist/osx/dmg-background.png',
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

    grunt.registerTask('package', ['appdmg']);
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
        win: /win/.test(inputPlatforms) || buildAll,
        linux32: /linux32/.test(inputPlatforms) || buildAll,
        linux64: /linux64/.test(inputPlatforms) || buildAll
    };

    return buildPlatforms;
}
