psychic-octo-robot
==================

	> This project is a collection of modules that brings the power of git to structured documents by students Ian Hallam, John Kulczak, Devon Timaeus and Sydney Satchwill at Rose-Hulman Institute of Technology under the leadership of Associate Professor Sriram Mohan in addition to Wes Winham and Kyle Gibson of PolicyStat. Currently HTML is the langugage being developed for, with the posibility of later including XML and DOCX as well.

## Usage: psychic-octo-robot [options] [command]

### First, create a por local repo

    init <file> <outputPath> <repoName>  Initialize a Repository for the given file

### And change it back into html

    write <directory> <outputFile>       Convert a Repository into an HTML file

## Options

	-h, --help         output usage information
    -V, --version      output the version number
    -v, --versionFull  Print out all the version info for the CLI
    -l, --libraries    Print out the versions of the libraries used

## Upcoming Features

	- commit
	- pretty printing for HTML output
	

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
