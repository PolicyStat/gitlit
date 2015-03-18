#!/bin/bash

# Necessary since vagrant is using Ubuntu, which has outdated node versions, so we have to purge those
apt-get install -y curl
apt-get purge nodejs npm
curl -sL https://deb.nodesource.com/setup | bash -

#install git
apt-get install -y git

# install node.js
apt-get update
apt-get install -y nodejs

# install sphinx
apt-get install -y python-setuptools
easy_install -U Sphinx

#install & setup npm
apt-get install -y npm

#install browserify
npm install -g browserify

#install commander
npm install -y -g commander

#install html
npm install -g html --no-bin-links

#install deasync
npm install -g deasync

#install parse5
npm install -g parse5

#install wrench
npm install -g wrench

#install unit.js & mocha to run tests
npm install -g unit.js
npm install -g mocha