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

#install js-git
RUN npm install -g js-git


#stuff for later maybe
#RUN mkdir /var/www
#ADD app.js /var/www/app.js
#CMD ["/usr/bin/node", "/var/www/app.js"] 
