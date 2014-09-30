##########################
HTML to File Serialization
##########################

In order to store meaningful changes in git,
PSO serialized HTML to a folder/file structure.
This makes change and move detection
behave similar to how git expects
and reduces the chances of merge conflicts.

.. note::

    Almost all of these
    would make great test cases.

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

    <p data-por-gui="GUID1">p1</p>
    <p data-por-gui="GUID2">p2</p>

Lexicographical Representation
------------------------------

.. code-block::

    * 1000-GUID1
      * content.txt
        * p1
    * 2000-GUID2
      * content.txt
        * p2

Table Representation
--------------------

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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

.. code-block::

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
