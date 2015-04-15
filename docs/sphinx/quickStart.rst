==================
Quick Start Guide
==================

Installing the package
--------------------
Use an npm install to download and globally install the package::

    npm install -g gitlit

Create a repository
--------------------
Create an initial repository off of an HTML page using::

    gitlit init <file> <outputPath> <repoName>

Commit a modified file
--------------------
Commit a modified version of the file to the initiallized repository using::

    gitlit commit <file> <pathToRepository> <commitMessage>

Diff the two previous commits
--------------------
To get the difference between the two previous commit for display or to merge, run the diff command in gitlit::

    gitlit diff <repoLocation> <outputLocation>

Now open the file that was saved by the diff step in a browser to use the visual diffing tool. Save the output in somewhere easily accessable for the merge step.

Merge the output of the diff
--------------------
Run the gitlit merge command to take the changes selected in the diff display and output a commit ready HTML file::

    gitlit merge <mergeFile> <outputLocation>

Restore an HTML file from a repo
--------------------
To get an HTML file from the repo run the gilit write command on the directory with the desired output name for the file::

    gitlit write <directory> <outputFile>