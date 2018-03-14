#!/bin/bash
# https://www.digitalocean.com/community/tutorials/how-to-use-fpm-to-easily-create-packages-in-multiple-formats
# http://standards.freedesktop.org/desktop-entry-spec/latest/ar01s09.html
# http://unix.stackexchange.com/questions/55214/how-to-override-the-gnome-3-ssh-handler/100736#100736
# deb64
export VERSION=0.0.2
export NAME='Montage-Popcorn'
export VENDOR='Kaazing Corp'
export DESCRIPTION='Montage PopCorn'
export URL='https://montagejs.github.io/popcorn/'
export LICENCE='Kaazing Corp'
export MAINTENER='Harold Thetiot <harold.thetiot@kaazing.com>'
# Paths
export BASEDIR="$( cd "$(dirname "$0")" ; pwd -P )"
export APP_PATH="$BASEDIR/../.."
export BUILD_PATH="$APP_PATH/build"
export TMP_PATH="$BASEDIR/tmp"
export RPM_PATH="$BASEDIR/rpm"
#clean
rm -fr $BUILD_PATH/releases/*.deb
rm -fr $BUILD_PATH/releases/*.rpm
# start
rm -fr $TMP_PATH
#deb64
mkdir $TMP_PATH
cp -r distro/* $TMP_PATH/
cp -r $APP_PATH/build/binaries/$VERSION/linux64/* $TMP_PATH/usr/share/$NAME/
fpm --deb-no-default-config-files --verbose --epoch 0 -a amd64 -s dir -t deb -n "${NAME}" -v "${VERSION}" --vendor "${VENDOR}" --description "${DESCRIPTION}" --url "${URL}"  --license "${LICENCE}" --maintainer "${MAINTENER}" -p "${APP_PATH}/build/releases/${NAME}-${VERSION}.x86_64.deb" -C "${TMP_PATH}" usr/share usr/bin
# start
rm -fr $TMP_PATH
#deb32
mkdir $TMP_PATH
cp -r distro/* $TMP_PATH/
cp -r $APP_PATH/build/binaries/$VERSION/linux32/* $TMP_PATH/usr/share/$NAME/
fpm --deb-no-default-config-files --verbose --epoch 0 -a i386 -s dir -t deb -n "${NAME}" -v "${VERSION}" --vendor "${VENDOR}" --description "${DESCRIPTION}" --url "${URL}"  --license "${LICENCE}" --maintainer "${MAINTENER}" -p "${APP_PATH}/build/releases/${NAME}-${VERSION}.i386.deb" -C "${TMP_PATH}" usr/share usr/bin
# start
rm -fr $TMP_PATH
rm -fr $RPM_PATH
# rpm64
mkdir $TMP_PATH
mkdir $RPM_PATH
cp -r distro/* $TMP_PATH/
cp -r $APP_PATH/build/binaries/$VERSION/linux64/* $TMP_PATH/usr/share/$NAME/
fpm --verbose --workdir "${RPM_PATH}" --epoch 0 -a amd64 -s dir -t rpm -n "${NAME}" -v "${VERSION}" --vendor "${VENDOR}" --description "${DESCRIPTION}" --url "${URL}"  --license "${LICENCE}" --maintainer "${MAINTENER}" -p "${APP_PATH}/build/releases/${NAME}-${VERSION}.x86_64.rpm" -C "${TMP_PATH}" usr/share usr/bin
# start
rm -fr $TMP_PATH
rm -fr $RPM_PATH
# rpm32
mkdir $TMP_PATH
mkdir $RPM_PATH
cp -r distro/* $TMP_PATH/
cp -r $APP_PATH/build/binaries/$VERSION/linux32/* $TMP_PATH/usr/share/$NAME/
fpm --verbose --workdir "${RPM_PATH}" --epoch 0 -a i386 -s dir -t rpm -n "${NAME}" -v "${VERSION}" --vendor "${VENDOR}" --description "${DESCRIPTION}" --url "${URL}"  --license "${LICENCE}" --maintainer "${MAINTENER}" -p "${APP_PATH}/build/releases/${NAME}-${VERSION}.i386.rpm" -C "${TMP_PATH}" usr/share usr/bin
# end
rm -fr $TMP_PATH
rm -fr $RPM_PATH