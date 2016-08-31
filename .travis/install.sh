#!/bin/bash

if [[ $TRAVIS_OS_NAME == 'osx' ]]; then
  brew update # get list of latest packages
  brew install libcouchbase
else
  # Only needed during first-time setup:
  wget http://packages.couchbase.com/releases/couchbase-release/couchbase-release-1.0-2-amd64.deb
  sudo dpkg -i couchbase-release-1.0-2-amd64.deb

  # Will install or upgrade packages
  sudo apt-get update
  sudo apt-get install libcouchbase-dev libcouchbase2-bin build-essential

  wget http://packages.couchbase.com/releases/4.1.0/couchbase-server-community_4.1.0-ubuntu14.04_amd64.deb
  sudo dpkg -i couchbase-server-community_4.1.0-ubuntu14.04_amd64.deb
fi