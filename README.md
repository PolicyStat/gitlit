psychic-octo-robot
==================

	This project is a collection of modules that brings the power of git to 
	structured documents by students Ian Hallam Devon Timaeus and Sydney 
	Satchwill at Rose-Hulman Institute of Technology under the leadership of
	Associate Professor Sriram Mohan in addition to Wes Winham and Kyle Gibson
	of PolicyStat.
	 
	Currently HTML is the target language for development, with the posibility
	of later including XML, DOCX, and other structure document formats.

## Usage: psychic-octo-robot [options] [command]

### First, create a por local repo

    init <file> <outputPath> <repoName>  Initialize a Repository for the given file

### And change it back into html

    write <directory> <outputFile>       Convert a Repository into an HTML file
    
### Make a new revision of the local repo given a new document
    commit <file to make the new revision> <path to repo> <commit message>

## Options

	-h, --help         output usage information
    -V, --version      output the version number
    -v, --versionFull  Print out all the version info for the CLI
    -l, --libraries    Print out the versions of the libraries used

## Upcoming Features

	- commit
	- pretty printing for HTML output
	
## Version History
* 0.0.1
    * Basic command line tool to accept inputs
    * Help info for usage
    * Added libraries
* 0.0.2
    * Parsing of HTML files into DOM-like structure
    * Filtering of information needed for creating directory structure
    * Adding custom IDs to keep track of tags for tracking changes in sections
* 0.1.0
    * `init` feature: Creation of file directory structure mean to represent a structured document
    * Naming for each file/directory from random byte array for uniqueness
* 0.1.1
    * Parsing of File structure back into Javascript object format
    * Unit tests for `init` feature
* 0.1.2
    * Generation of HTML through reconstruction using Javascript object
    * Command-line command for this feature
* 0.2.0
    * `write` feature: Create an HTML file from the directory structure with IDs inserted into HTML
    * Unit tests for `write` feature
* 0.2.1
    * Pre tag whitespace preservation
    * Transition away from js-git to Git shell
    * Setup & teardown for directory during `commit`
* 0.2.2
    * Make Git repository commit during `commit`
    * Edge cases for `write` & `init` feature
* 0.3.0
    * `commit` feature: Given new file and a path to a repository directory, 
    create a new version of the document with a commit message
* 0.3.1
    * IN PROGRESS
    

## Disclaimers:
- Tags will contain por-id attributes for tracking purposes.
- Modifying por-ids can result in unexpected behavior
- Some formatting may not be preserved. With each milestone we are working to minimize this.
- If the html is missing starting or ending tags when used in any operations then there are no guarantee that the interpretation of the HTML will be what the author intended.
- To minimize this effect, be sure to include closing tags for each open tag, and vice versa.

## Libraries Used
* parse5
* html
* commander.js
* mocha
* deasync

## Development environment
About Docker:

	Docker is an OS agnostic way to create an identical development environment for every member 
	on a software team. The following steps will get you set up:

### 1. Download Docker:

(in ubuntu)

    ```curl -sSL https://get.docker.io/ubuntu/ | sudo sh```

### 2. Use Docker:

(in ubuntu)

```
cd /psycho-octo-robot
sudo docker build -t="psycho-octo-robot" .
sudo docker run -i -t psycho-octo-robot
```

or to run in the background:

```sudo docker run -d psycho-octo-robot```

Docker is now running in the terminal and files can be executed within the container to have 
access to all packages needed. Further documentation can be found [here](https://docs.docker.com/userguide/)
