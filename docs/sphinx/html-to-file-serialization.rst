################################
HTML to Repository Serialization
################################

In order to store meaningful changes in git,
PSO serializes HTML
to a folder/file structure.
This makes change and move detection
behave similar to how git expects
and reduces the chances of merge conflicts.

.. note::

    Almost all of these
    would make great test cases.

*************
Design Issues
*************


How do we represent text nodes?
===============================

For representing text nodes, just having a
text file for the information would
adequately store what was necessary, and
then filenames can be generated arbitrarily,
likely using any ``id`` attributes that already
exist.

So, if we had:

.. code-block:: html

    <p GUID=1>hello <span GUID=2>stuff</span> goodbye </p>


This would become something organized like this:

.. code-block:: html

    * GUID1
        * metadata.json
        * 1.txt
        * GUID2 (this is a dir)
            * 1.txt
        * 2.txt

There is the issue of:
    * What if "goodbye" was moved to
        be before the span?

But there isn't much that can be done here;
it is likely that the parser used for parsing
the HTML will result in one file for each of
"goodbye" and "hello" so long as the span
separates them.

Without the span, the text would be treated as
one file, thus, if it was moved, then it would
result in a removed file and another file being
modified.

To solve this, there would need to be a
decision of where to stop in parsing the HTML,
so that a file doesn't get removed, but this
would require quite a bit of extra information.

This isn't insurmountable, as the old version
could just be read, read the file, and keep
track of where it "ends" and then just parse
to that, or the first child node, and split
the files accordingly.

That being said, this could result in some file
directories that look very strange, but would
likely work better in diffs.

How do we represent ordering of text nodes mixed with other nodes?
==================================================================

This could just be done with naming in lexicographic
-based construction, and the table in the table
-based construction. Basically, just have the
names of directories and the files that hold
content be what we use to determine what is
what. That is, if a table says:

* GUID1
* GUID2
* GUID3

Regardless if any of those are directories,
just recursively build that directory into
a node, and then paste it in during construction.

For name based, same idea, but with names.


How do we store node type?
==========================

This could be done in the metadata file,
since there will be one one either way.

How do we store node attributes (``src``, ``href``, etc)?
=========================================================

Same as node type, metadata file would
work well for this.


*************************
Simple Paragraph Addition
*************************

Initial Content
===============

.. code-block:: html

    <p>p1</p>
    <p>p2</p>

After GUID-ization
------------------

The first pass adds GUIDs
to any nodes that don't have them.
Since this is initial,
they all get new GUIDs.
Further examples will ignore GUIDs.
Assume they're there.

.. code-block:: html

    <p data-por-guid="GUID1">p1</p>
    <p data-por-guid="GUID2">p2</p>

Lexicographical Representation
------------------------------

.. ::

    * 1000-GUID1
      * content.txt
        * p1
    * 2000-GUID2
      * content.txt
        * p2

Table Representation
--------------------

.. ::

    * GUID1
      * content.txt
        * p1
    * GUID2
      * content.txt
        * p2
    * metadata.json
        {
            order: [
                'GUID1',
                'GUID2'
            ],
        }

Edit 1: Additional 2nd Paragraph
================================

.. code-block:: html

    <p>p1</p>
    <p>p3</p>
    <p>p2</p>

Lexicographical Representation
------------------------------

Conflicts: No

.. ::

    * 1000-GUID1
      * content.txt
        * p1
    * 1500-GUID3
      * content.txt
        * p3
    * 2000-GUID2
      * content.txt
        * p2

Table Representation
--------------------

Conflicts: No

.. ::

    * GUID1
      * content.txt
        * p1
    * GUID3
      * content.txt
        * p3
    * GUID2
      * content.txt
        * p2
    * metadata.json
        {
            order: [
                'GUID1',
                'GUID3',
                'GUID2'
            ],
        }

Edit 2: Additional Last Paragraph
=================================

From the initial content,
we'll add a 4th paragraph.

.. code-block:: html

    <p>p1</p>
    <p>p2</p>
    <p>p4</p>

Lexicographical Representation
------------------------------

Conflicts: No

.. ::

    * 1000-GUID1
      * content.txt
        * p1
    * 2000-GUID2
      * content.txt
        * p2
    * 3000-GUID4
      * content.txt
        * p4

Table Representation
--------------------

Conflicts: No

.. ::

    * GUID1
      * content.txt
        * p1
    * GUID2
      * content.txt
        * p2
    * GUID4
      * content.txt
        * p4
    * metadata.json
        {
            order: [
                'GUID1',
                'GUID2',
                'GUID4',
            ],
        }

Merged Edit 1 and Edit 2
========================

Those two edits
should merge in without conflicts.

.. code-block:: html

    <p>p1</p>
    <p>p3</p>
    <p>p2</p>
    <p>p4</p>

Lexicographical Representation
------------------------------

Conflicts: No

.. ::

    * 1000-GUID1
      * content.txt
        * p1
    * 1500-GUID3
      * content.txt
        * p3
    * 2000-GUID2
      * content.txt
        * p2
    * 3000-GUID4
      * content.txt
        * p4

Table Representation
--------------------

Conflicts: Yes. In ``metadata.json``.

.. ::

    * GUID1
      * content.txt
        p1
    * GUID3
      * content.txt
        p3
    * GUID2
      * content.txt
        p2
    * GUID4
      * content.txt
        p4
    * metadata.json
        {
            order: [
                'GUID1',
                'GUID3',
                'GUID2',
                'GUID4'
            ]
        }

************
Nested Nodes
************

Initial Content
===============

.. code-block:: html

    <p>p1<span>s1</span>stillp1</p>
    <p>p2</p>

**********
Node Moves
**********

Initial Content
===============

.. code-block:: html

    <p>p1</p>
    <p>p2</p>
    <p>p3</p>
    <p>p4</p>

Lexicographical Representation
------------------------------

.. ::

    * 1000-GUID1
      * content.txt
        * p1
    * 2000-GUID2
      * content.txt
        * p2
    * 3000-GUID1
      * content.txt
        * p3
    * 4000-GUID4
      * content.txt
        * p4

Table Representation
--------------------

.. ::

    * GUID1
      * content.txt
        * p1
    * GUID2
      * content.txt
        * p2
    * GUID3
      * content.txt
        * p3
    * GUID4
      * content.txt
        * p4
    * metadata.json
        {
            order: [
                'GUID1',
                'GUID2',
                'GUID3',
                'GUID4'
            ],
        }

Edit 1: Last to First
=====================

.. code-block:: html

    <p>p4</p>
    <p>p1</p>
    <p>p2</p>
    <p>p3</p>

Lexicographical Representation
------------------------------

Conflicts: No

.. ::

    * 0500-GUID4
      * content.txt
        * p4
    * 1000-GUID1
      * content.txt
        * p1
    * 2000-GUID2
      * content.txt
        * p2
    * 3000-GUID1
      * content.txt
        * p3

Table Representation
--------------------

Conflicts: No

.. ::

    * GUID1
      * content.txt
        * p1
    * GUID2
      * content.txt
        * p2
    * GUID3
      * content.txt
        * p3
    * GUID4
      * content.txt
        * p4
    * metadata.json
        {
            order: [
                'GUID4',
                'GUID1',
                'GUID2',
                'GUID3'
            ],
        }

Edit 2: Last to First with content change
=========================================

.. code-block:: html

    <p>p4new</p>
    <p>p1</p>
    <p>p2</p>
    <p>p3</p>

Lexicographical Representation
------------------------------

Conflicts: No

.. ::

    * 0500-GUID4
      * content.txt
        * p4new
    * 1000-GUID1
      * content.txt
        * p1
    * 2000-GUID2
      * content.txt
        * p2
    * 3000-GUID1
      * content.txt
        * p3

Table Representation
--------------------

Conflicts: No

.. ::

    * GUID1
      * content.txt
        * p1
    * GUID2
      * content.txt
        * p2
    * GUID3
      * content.txt
        * p3
    * GUID4
      * content.txt
        * p4new
    * metadata.json
        {
            order: [
                'GUID4',
                'GUID1',
                'GUID2',
                'GUID3'
            ],
        }

Merged Edit 1 and Edit 2
========================

Those two edits
should merge in without conflicts.

.. code-block:: html

    <p>p4new</p>
    <p>p1</p>
    <p>p2</p>
    <p>p3</p>

Lexicographical Representation
------------------------------

Conflicts: No. Not if content and move
are separate commits.

.. ::

    * 0500-GUID4
      * content.txt
        * p4new
    * 1000-GUID1
      * content.txt
        * p1
    * 2000-GUID2
      * content.txt
        * p2
    * 3000-GUID1
      * content.txt
        * p3

Table Representation
--------------------

Conflicts: No

.. ::

    * GUID1
      * content.txt
        * p1
    * GUID2
      * content.txt
        * p2
    * GUID3
      * content.txt
        * p3
    * GUID4
      * content.txt
        * p4new
    * metadata.json
        {
            order: [
                'GUID4',
                'GUID1',
                'GUID2',
                'GUID3'
            ],
        }


***************
Design Decision
***************

Gitlit keeps track of the
order that the nodes should be constructed
via the table-method. This has the simplest
base case, and stays simple even when
complexity is added through commits.

For any in-depth discussion of why, see
`this git issue <https://github.com/PolicyStat/gitlit/issues/18>`_