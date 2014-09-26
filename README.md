psychic-octo-robot
==================

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


