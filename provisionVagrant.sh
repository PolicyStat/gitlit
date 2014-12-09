#!/bin/bash

#install git
apt-get install git

# install node.js
apt-get update
apt-get install -y nodejs

# install sphinx
apt-get install -y python-setuptools
easy_install -U Sphinx

#install npm
apt-get install -y npm

#install browserify
npm install -g browserify

#install commander
npm install -y -g commander

#install html
npm install -g html

#install deasync
npm install -g deasync

#install parse5
npm install -g parse4

#install unit.js & mocha to run tests
npm install -g unit.js
npm install -g mocha