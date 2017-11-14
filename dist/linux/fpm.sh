#!/bin/bash
# https://www.digitalocean.com/community/tutorials/how-to-use-fpm-to-easily-create-packages-in-multiple-formats
# http://standards.freedesktop.org/desktop-entry-spec/latest/ar01s09.html
# http://unix.stackexchange.com/questions/55214/how-to-override-the-gnome-3-ssh-handler/100736#100736
# deb64
export VERSION=0.5.3
export NAME='myapp'
export VENDOR='Montage SDK Dekstop'
export DESCRIPTION=''
export URL='https://www.montagestudio.com'
export LICENCE='Kaazing Corp, all rights reserved.'
export MAINTENER='Harold Thetiot <harold.thetiot@kaazing.com>'
export APP_PATH='/Users/hthetiot/projects/Montage/platforms/montage-sdk-desktop'
# start
rm -fr tmp
#deb64
mkdir tmp
cp -r distro/* tmp/
cp -r $APP_PATH/build/binaries/$VERSION/linux64/* tmp/usr/share/myapp/
fpm --epoch 0 -a amd64 -s dir -t deb -n "${NAME}" -v "${VERSION}" --vendor "${VENDOR}" --description "${DESCRIPTION}" --url "${URL}"  --license "${LICENCE}" --maintainer "${MAINTENER}" -p "${APP_PATH}/build/releases/${NAME}-${VERSION}.x86_64.deb" -C "${APP_PATH}/dist/linux/tmp" usr/share usr/bin
# rpm64
rm -fr tmp
mkdir tmp
cp -r distro/* tmp/
cp -r $APP_PATH/build/binaries/$VERSION/linux64/* tmp/usr/share/myapp/
fpm --epoch 0 -a amd64 -s dir -t rpm -n "${NAME}" -v "${VERSION}" --vendor "${VENDOR}" --description "${DESCRIPTION}" --url "${URL}"  --license "${LICENCE}" --maintainer "${MAINTENER}" -p "${APP_PATH}/build/releases/${NAME}-${VERSION}.x86_64.rpm" -C "${APP_PATH}/dist/linux/tmp" usr/share usr/bin
# end
rm -fr tmp