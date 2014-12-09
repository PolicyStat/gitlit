FROM ubuntu

# install node.js
RUN apt-get update
RUN apt-get install -y nodejs
#RUN node setupVerification/exampleNodeServer.js
#RUN echo "Nodejs install successful"


# install sphinx
RUN apt-get install -y python-setuptools
RUN easy_install -U Sphinx

#install browserify
RUN apt-get install -y npm
RUN npm install -g browserify
#RUN node setupVerification/browserifyExample.js
#RUN "Browserify install successful"

#install commander
RUN npm install -y -g commander

#install html
RUN npm install -g html

#install deasync
RUN npm install -g deasync

#install parse5
RUN npm install -g parse4

#install unit.js & mocha to run tests
RUN npm install -g unit.js
RUN npm install -g mocha


#stuff for later maybe
#RUN mkdir /var/www
#ADD app.js /var/www/app.js
#CMD ["/usr/bin/node", "/var/www/app.js"] 
