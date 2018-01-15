# montage-sdk-desktop

A re-usable montage wrapper for native desktop app.

## Supported Platform
* **Microsoft Windows** - From XP to 10 version (32 and 64bit)
* **Linux** - Deb/Rpm/Bin (x86_64 and i368)
* **Apple OSX** - 10.1+ version (required)

## NodeWebkit

This SDK is built arround NodeWebkit aka "nw.js". NodeWebkit allow developing Custom Native Destkop Browser and native app using Chromium and NodeJS combined.

More info about NodeWebkit:
- http://nwjs.io/

Note: We are currently using nw.js version 0.26.5 for stability reason and are preparing migration toward next 0.13.x stable version.  

## Quick start

Several quick start options are available:

- Clone the repo: `git clone git@github.com:montagestudio/montage-sdk-desktop.git`.
- Download Zip: ` curl --remote-name https://github.com/montagestudio/montage-sdk-desktop/archive/master.zip`

## Building montage-sdk-desktop

### Packages Prerequisites
* Node.js - Download and Install [Node.js](http://www.nodejs.org/download/). You can also follow [this gist](https://gist.github.com/isaacs/579814) for a quick and easy way to install Node.js and npm

OSX:

```
$ brew install nodejs npm
```

Debian/Ubuntu:

```
$ apt-get install nodejs npm
```

### Tools Prerequisites
* NPM - Node.js package manager, should be installed when you install node.js.
* Grunt - Download and Install [Grunt](http://gruntjs.com).

[Nodejs](http://nodejs.org/) must be installed before you can use npm or grunt.

```
$ npm install -g grunt-cli 
$ npm install -g nw@0.26.5 --nwjs_build_type=sdk
```

Run `npm install` in root dir to install grunt and it's dependencies.

### Building, Running and debugging

#### Running and debugging 

Run node-webkit from the root directory with --debug to enable debugging mode like so

    $ nw . --debug

Open Help > Show/Hide Dev Tool to reload and debug the app.

#### Build

Build with:

    $ grunt build

By default it will build for your current platform however you can control that
by specifying a comma separated list of platforms in the `platforms` option to
grunt:

    $ grunt build --platforms=linux32,linux64,mac,win

You can also build for all platforms with:

    $ grunt build --platforms=all

## Troubleshooting

### Full build Packages Prerequisites

TODO

Note: Windows signing certificates for ~$178/year
- https://docs.microsoft.com/en-us/windows-hardware/drivers/dashboard/get-a-code-signing-certificate
- https://www.digicert.com/code-signing/digicert-certificate-utility-to-sign-code.htm

### What are package.json chromium-args possible values?
- http://peter.sh/experiments/chromium-command-line-switches/

### Error about missing libudev.so.0:
Search for `libudev.0` on your distribution. Most of the time it can be easily fixed by creating a symbolic link from `libudev.so` to `libudev.so.0`

### Error "Gtk-WARNING **: cannot open display":
Try running `export DISPLAY=:0.0`

### Error "The video format is not supported":
See: https://github.com/rogerwang/node-webkit/wiki/Support-mp3-and-h264-in-video-and-audio-tag

### Enable Montage custom scheme on OSX:
```
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>montage</string>
    </array>
  </dict>
</array>
```

## To clone this git repository, Github require from you to deploy an ssh-key for authentication:
- https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/\
- https://developer.github.com/guides/managing-deploy-keys/#deploy-keys

## Credits

Harold Thetiot
Sylaps Inc

## License

Kaazing Corp, all rights reserved.
