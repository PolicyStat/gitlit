************
Using Gitlit
************

Getting started
===============

There are two possible use cases for gitlit:

1. Using the tool for its purpose of structured document management.
2. Using the tool to ensure it is working when developing for it.

In the former case, currently, the means of installing it
would be through NPM. If NPM is installed on they system,
simply run: ::

    npm install -g gitlit

To run any of the commands discussed here, simply use: ::

    gitlit <command info>

If contributing to the project, then inside the GitHub
project folder, at the root (where the package.json file
is), simply run: ::

    node ./cli/gitlit.js <command info>

Alternatively:
    ./cli/gitlit.js <command info>

.. note::

    For all of the sections following this, the information
    given will be what is meant to go into <command info>.
    So, if you were using the tool for it's purpose, and you
    wanted to initialize a repository, the command might be
    given as: ::

        init source-file . outputRepo

    but note that this is prefixed by the necessary command
    to run the tool based on why you are trying to run it.

Creating a repository
=====================
The command for creating a repository given an HTML document
is: ::

    init <file> <location for repo to be made> <repo name>

So an example command might look like: ::

    gitlit init test.html /usr/root/docs first-repo

Take note that the 2nd argument needs to be a location that
already exists, as what actually happens is a directory
is made at that location with the name <repo name>

So, if the above command was run, the directory
`/usr/root/docs/first-repo` would then be made.

If it existed before, an error will be thrown stating as such.

.. note::

    If there are missing tags in the HTML document, such as a
    missing opening tag, the parser used by gitlit
    will take it's best guess as to what was intended. Since
    there are most likely many possibilities, the possibility
    chosen may not be what the user meant. If you want to be
    certain this doesn't happen, ensure that the HTML is valid,
    preferably through
    `The W3C Validator <http://validator.w3.org/#validate_by_input+with_options>`_.

Generating HTML from a repository
=================================
To generate a file from a repository, simply run: ::

    write <path to repository directory> <path of output file>

An example command might look like: ::

    gitlit write /usr/root/docs/first-repo ./test.html

Which would generate an HTML file called "test.html" in the current
directory, with its source being the repository "first-repo"
at `/user/root/docs`.

If the output file existed before, its contents will be overwritten
so take caution.

.. note::

    The contents of the HTML file will be pretty-printed as
    reasonably as possible. Due to the complex nature of HTML
    and the fact that gitlit wants to make `only`
    meaningful notes about differences between different versions
    of a document, some quantity of formatting (i.e. whitespace)
    is lost, and as such, the formatting is not kept `exactly`
    the same. That being said, the formatting is still decent,
    and is quite readable.

.. note::

    After generating the file, you likely noticed the **attributes
    that got added to many of the tags called "por-id"**.
    These attributes are tracking ID's used to aid in recognition
    of sections even if the subsections or text is changed. As
    such, **don't alter or remove the por-id's unless the document
    is completely finished being developed**, as this will cause
    gitlit to give very unhelpful diffs when
    comparing different versions of a document.


Making a commit
===============
Once a repository is created, a new revision can be tracked in the
repository through making a new commit. Just like git, and
differences will be stored into a new commit and the repository
will be at this new revision, with the history stored in the
commit history.

Since gitlit works on a document as a whole, commits
are made by providing a new document. This removes the need for
users to edit the files split by the tool, and makes it easier
to view the document as a whole will editing.

To make a commit, just run: ::

    commit <file for new revision> <path to repo directory> <commit message>

An example command would look like: ::

    gitlit commit ./test.html /usr/root/docs/first-repo "Changed page title"

After this command is made, the Git repository that is the basis
for that gitlit repository will have a new commit, and
the whole directory structure will be in a state the reflects the
new revision.

If a write command is run on this repository now, the outputted
document will look nearly identical to the input document given
in the above command. (Nearly identical because of some likely
formatting of the document, and perhaps por-id's added for new
sections).
