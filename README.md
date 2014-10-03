psychic-octo-robot
==================

About Docker:

	Docker is an OS agnostic way to create an identical development environment for every member on a software team. The following steps will get you set up:

1. Download Docker:

(ubuntu)

$ curl -sSL https://get.docker.io/ubuntu/ | sudo sh

2. Use Docker:

(ubuntu)

$ cd /psycho-octo-robot
$ sudo docker build -t="psycho-octo-robot" .
$ sudo docker run -i -t psycho-octo-robot

or to run in the background:

$ sudo docker run -d psycho-octo-robot

	Docker is now running in the terminal and files can be executed within the container to have access to all packages needed. Further documentation: https://docs.docker.com/userguide/
