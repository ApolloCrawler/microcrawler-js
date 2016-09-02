#!/bin/bash

if [[ $TRAVIS_OS_NAME == 'osx' ]]; then
  brew update # get list of latest packages
  brew install libcouchbase
else
  # sudo apt-get -qq update
  # sudo apt-get -qq -y upgrade

  # Only needed during first-time setup:
  wget http://packages.couchbase.com/releases/couchbase-release/couchbase-release-1.0-2-amd64.deb
  sudo dpkg -i couchbase-release-1.0-2-amd64.deb

  # Will install or upgrade packages
  sudo apt-get update
  sudo apt-get install libcouchbase-dev libcouchbase2-bin build-essential libstdc++6 libc6 g++ llvm clang runit wget python-httplib2

  ## wget http://packages.couchbase.com/releases/4.1.0/couchbase-server-community_4.1.0-ubuntu14.04_amd64.deb
  ## sudo dpkg -i couchbase-server-community_4.1.0-ubuntu14.04_amd64.deb

  ## sudo service couchbase-server restart
  ## /opt/couchbase/bin/couchbase-cli cluster-init -c 127.0.0.1:8091 --cluster-username=Administrator --cluster-password=Administrator --cluster-ramsize=512
fi