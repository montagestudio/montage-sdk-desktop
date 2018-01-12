#!/bin/bash
# https://www.digitalocean.com/community/tutorials/how-to-use-fpm-to-easily-create-packages-in-multiple-formats
# http://standards.freedesktop.org/desktop-entry-spec/latest/ar01s09.html
# http://unix.stackexchange.com/questions/55214/how-to-override-the-gnome-3-ssh-handler/100736#100736
# deb64
export VERSION=0..1
export NAME='popcorn'
export VENDOR='Kaazing Corp'
export DESCRIPTION='Montage PopCorn'
export URL='https://montagejs.github.io/popcorn/'
export LICENCE='Kaazing Corp'
export MAINTENER='Harold Thetiot <harold.thetiot@kaazing.com>'
# TODO dynamic path
BASEDIR=$(dirname "$0")
export APP_PATH="$BASEDIR/../../"
# start
rm -fr tmp
#deb64
mkdir -p tmp/usr/share/$NAME
cp -r distro/* tmp/
cp -r $APP_PATH/build/binaries/$VERSION/linux64/* tmp/usr/share/$NAME/
fpm --verbose --epoch 0 -a amd64 -s dir -t deb -n "${NAME}" -v "${VERSION}" --vendor "${VENDOR}" --description "${DESCRIPTION}" --url "${URL}"  --license "${LICENCE}" --maintainer "${MAINTENER}" -p "${APP_PATH}/build/releases/${NAME}-${VERSION}.x86_64.deb" -C "${APP_PATH}/dist/linux/tmp" usr/share usr/bin
# rpm64
rm -fr tmp
mkdir tmp
cp -r distro/* tmp/
cp -r $APP_PATH/build/binaries/$VERSION/linux64/* tmp/usr/share/$NAME/
# workdir
rm -fr  $APP_PATH/tmp
mkdir $APP_PATH/tmp
fpm --verbose --workdir $APP_PATH/tmp --epoch 0 -a amd64 -s dir -t rpm -n "${NAME}" -v "${VERSION}" --vendor "${VENDOR}" --description "${DESCRIPTION}" --url "${URL}"  --license "${LICENCE}" --maintainer "${MAINTENER}" -p "${APP_PATH}/build/releases/${NAME}-${VERSION}.x86_64.rpm" -C "${APP_PATH}/dist/linux/tmp" usr/share usr/bin
# end
rm -fr tmp