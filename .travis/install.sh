#!/bin/bash

if [[ $TRAVIS_OS_NAME == 'osx' ]]; then
  # Only needed during first-time setup:
  wget http://packages.couchbase.com/releases/couchbase-release/couchbase-release-1.0-2-amd64.deb
  sudo dpkg -i couchbase-release-1.0-2-amd64.deb

  # Will install or upgrade packages
  sudo apt-get update
  sudo apt-get install libcouchbase-dev libcouchbase2-bin build-essential
else
  brew update # get list of latest packages
  brew install libcouchbase
fi