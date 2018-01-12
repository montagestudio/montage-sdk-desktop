#!/bin/bash
# https://www.digitalocean.com/community/tutorials/how-to-use-fpm-to-easily-create-packages-in-multiple-formats
# http://standards.freedesktop.org/desktop-entry-spec/latest/ar01s09.html
# http://unix.stackexchange.com/questions/55214/how-to-override-the-gnome-3-ssh-handler/100736#100736
# deb64
export VERSION=0.0.1
export NAME='Popcorn'
export VENDOR='Kaazing Corp'
export DESCRIPTION='Montage Popcorn'
export URL='https://montagejs.github.io/popcorn/'
export LICENCE='Kaazing Corp'
export MAINTENER='Harold Thetiot <harold.thetiot@kaazing.com>'
# TODO dynamic path
BASEDIR=$(dirname "$0")
export APP_PATH="$BASEDIR/../.."
export BUILD_PATH="$APP_PATH/build"
export TMP_PATH="$BASEDIR/tmp"
export WORKDIR_PATH="$APP_PATH/tmp"
#clean
rm -fr $BUILD_PATH/releases/*.deb
rm -fr $BUILD_PATH/releases/*.rpm
# start
rm -fr $TMP_PATH
#deb64
mkdir -p $TMP_PATH/usr/share/$DIRNAME
cp -r $BASEDIR/distro/* $TMP_PATH/
cp -r $APP_PATH/build/binaries/$VERSION/linux64/* $TMP_PATH/usr/share/$NAME/
fpm --verbose --epoch 0 -a amd64 -s dir -t deb -n "${NAME}" -v "${VERSION}" --vendor "${VENDOR}" --description "${DESCRIPTION}" --url "${URL}"  --license "${LICENCE}" --maintainer "${MAINTENER}" -p "${APP_PATH}/build/releases/${NAME}-${VERSION}.x86_64.deb" -C "${TMP_PATH}" usr/share usr/bin
# rpm64
rm -fr $TMP_PATH
mkdir $TMP_PATH
cp -r $BASEDIR/distro/* $TMP_PATH/
cp -r $APP_PATH/build/binaries/$VERSION/linux64/* $TMP_PATH/usr/share/$NAME/
# workdir
rm -fr  $WORKDIR_PATH
mkdir $WORKDIR_PATH
fpm --verbose --workdir $WORKDIR_PATH --epoch 0 -a amd64 -s dir -t rpm -n "${NAME}" -v "${VERSION}" --vendor "${VENDOR}" --description "${DESCRIPTION}" --url "${URL}"  --license "${LICENCE}" --maintainer "${MAINTENER}" -p "${APP_PATH}/build/releases/${NAME}-${VERSION}.x86_64.rpm" -C "${TMP_PATH}" usr/share usr/bin
# end
rm -fr $TMP_PATH
rm -fr $WORKDIR_PATH