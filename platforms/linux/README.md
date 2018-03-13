
# Debian
sudo apt-get update
apt-get install ruby ruby-dev rubygems build-essential
sudo gem install fpm

# Fedora
yum install ruby-devel gcc make rpm-build rubygems
gem install --no-ri --no-rdoc fpm

# OSX
$ brew install gnu-tar
$ brew install rpm
$ brew install rpmbuild