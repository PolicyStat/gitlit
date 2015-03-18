Problem Statement
=================
The Gospel of Git & and Source Control
--------------------------------------
Software Developers the world over make use of Git, 
SVN, and other source control systems to keep track of their source code, 
merge in branches, and generally keep their projects well maintained.

Most source control systems offer many features that
 make project management a breeze, such as branching, 
reverting, committing code changes, and showing 
differences between revisions of the code. 
There are some idiosyncrasies between each different system, 
but the basic functionality mentioned just now is present in all of them. 
Having a system like this has almost become second nature to 
project management and development in the world of software development.

What Everyone else does
-----------------------
For the most part, source control systems are limited 
to strictly software development fields; 
it is rare for similar tools to be used by other groups. 
That being said, the largest innovation that is 
similar to source control systems and is widely used today
are tools like Google Drive, systems where users can edit 
documents at the same time, and keep one copy synced between 
the entire group.

Google Drive, and other similar applications, work very similarly 
to source control at a base level, by keeping one document synced 
in a group. Many even have the idea of revisions that are present
in source control systems, however, most lack the full depth of power 
that traditional source control systems have. This leaves most casual 
users with almost no features that are present in a source control system, 
only the basic functionally of simultaneous editing, viewing, and syncing.

Who Cares?
----------
Applications like Google Drive could benefit greatly from having more functionality 
that is present in tools like Git, since it would buy users powers like:
             * Showing differences between revisions of a document
             * Reverting a document to a different revision in case something goes wrong
             * Leaving a "paper" trail of who changed what, when
             * Branching to allow for changes that don't block other users

For the most part, people _could_ just use Git for their documents, 
even if they aren't code, but for many document types, Git is not suited 
to managing differences very well, as it just treats all documents as text files 
(HTML, Microsoft Formats, CSV files, etc.). 
Additionally, Git is a tool designed by software developers, for software developers,
and exists almost purely in a command-line form, or at least, to access most functionality, 
a command-line must be used. This makes the accessibility of Git to most organizations 
and people virtually nonexistent, as they would need to learn a tool that has a high 
burden of knowledge, and get used to using command-line tools, which is foreign to 
the average user.

Place your trust in the mighty Gitlit
-------------------------------------
Our tool is meant to solve some of the problems that crop up with casual users trying 
to use Git on non-source-code documents. 

Specifically, our goal is to make an application that will operate on structured documents, 
such as HTML and XML, offering all of the same operations and functionality that Git offers, 
but encapsulated in a way that any user familiar with programs as complex as Microsoft Word 
would be able to understand and use with proficiency.

Our application will not only create and manage Git repositories of structured documents 
(one document per repository) but will also provide a UI to allow for users to easily view 
diffs of revisions, manage merges, and view and manage change requests.

To accommodate the need for client-side Web UI scripting, interfacing with Git repositories, 
and server side repo-management, the application will be written in Javascript, making use 
of Node.js and js-git.
