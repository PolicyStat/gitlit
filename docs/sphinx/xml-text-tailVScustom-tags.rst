#######################
Text Node Name-Tracking
#######################

When psychic-octo-robot is tracking
a document, there will be files that 
are generated that are purely made of
text, and contain the actual written
content of the document. 

However, there is an issue that can 
arise with regards of how to keep track
of the differences between each section.
Given that we have chosen to keep track
of document order via a table, we need
a way to consistently generate names
so that if a section is left in the
document (changed or not), we recognize
it, and name the file accordingly so
that doing file diffs are done 
appropriately. 

For HTML elements, this
is easy, since we can just add some
arbitrary attribute to each tag that
only we will look at. For text nodes,
this becomes more difficult. Given
something like this:

.. code-block:: html
    <span>
        First Text
        <div>
            div Text
        </div>
        Second Text
    </span>
    
The obvious thing to do for tags is
to add an attribute that will keep
track of *what* the element is for
easier diffing.

.. code-block:: html
    <span por-id="40E36DB5C0AD13957351">
        First Text
        <div por-id="76F7BEE8A2001AC7144D">
            div Text
        </div>
        Second Text
    </span>
    
Now, we are well aware of when the
sections get moved or are changed.
However, if we generate a filename
for the text nodes, we would have
no way to map a new commit of this
document to the files without doing
a text comparison (which we would
like to avoid). Thus, we either
need a consistent way to name the
files (e.g. first file is named 1.txt,
second file 2.txt, etc.) or a way
to store the filename/id when we
generate the document for users to
re-commit to us.

If we did a consistent naming format,
that would somewhat defeat the
purpose of a table, additionally,
if there was ever an insert of a new
element that had a text node near it,
there could be problems with 
misidentification with old sections.

This leaves us with trying to store
the id of the text node somehow so
that in future commits we can identify
the name the new files should be.

There are 2 main ways we are considering
doing this:
    * XML-style Text & Tail
    * Custom HTML tags with id information.
    
The rest of this page will be exploring
how each would be done, working through
example cases that would need to be handled
and deciding on which method gives the 
best coverage.

.. note::

    Almost all of these
    would make great test cases.

******************
Method explanation
******************


Custom HTML Tags with id Info
=============================
The first method we thought of to solve
the id issue was to create our own HTML
tag and use that with our metadata file
to keep track of the id of each text
node. 

For example, the input:

.. code-block:: html
    <span por-id="40E36DB5C0AD13957351">
        First Text
        <div por-id="76F7BEE8A2001AC7144D">
            div Text
        </div>
        Second Text
    </span>
    
Would become something like:

.. code-block:: html
    <span por-id="40E36DB5C0AD13957351">
        <por por-id="39E1D62AADCF588B873C ">First Text</por>
        <div por-id="76F7BEE8A2001AC7144D">
            <por por-id="56ADFDCAACEB1FDBCEA1">div Text</por>
        </div>
        <por por-id="3CED92A56695A78653ED">Second Text</por>
    </span>

    
This works because HTML just ignores
any tags that it doesn't recognize, so,
this should be fine to do.

Pros
----
* Very Easy to do

    * Both HTML generation and Repo
      generation becomes straightforward
      
* High Consistency

    * Very clear mapping
    * If the id existed before, just
      compare against the old.
      
* Easy to understand
* Only needs to be done once

    * Still needs to be read each time

Cons
----
* Standards are weird

    * HTML might misbehave if we 
    inject our own tags
    
* Fragile
    
    * If a user deletes the tag, it will look
    like an insert.
    
* Gives the User responsibility

    * The user has to keep track
    of the new tags
    * More work for the user
    
    
XML-style Text & Tail
=====================
The next method of storing the 
ids for text nodes took some 
inspiration from XML. In XML,
each tag has a ```text``` attribute
and a ```tail``` attribute.
The ```text``` attribute just
has the first text of the node
that isn't a child's tail.
The ```tail``` attribute has any
text that falls after the current
node and before the next tag.

For example, the input:

.. code-block:: html
    <span por-id="40E36DB5C0AD13957351">
        First Text
        <div por-id="76F7BEE8A2001AC7144D">
            div Text
        </div>
        Second Text
    </span>
    
Would have a mapping of something like this:

.. code-block:: json
    {
        por-id: "40E36DB5C0AD13957351",
        text: "First Text",
        children: {
                    por-id: "76F7BEE8A2001AC7144D",
                    text: "div Text",
                    tail: "Second Text"
                   },
        tail: ""
    }
    
Alternatively, instead of keeping
track of the actual text, it could
just note the por-id of the object:

.. code-block:: json
    {
        por-id: "40E36DB5C0AD13957351",
        text: "39E1D62AADCF588B873C",
        children: {
                    por-id: "76F7BEE8A2001AC7144D",
                    text: "56ADFDCAACEB1FDBCEA1",
                    tail: "3CED92A56695A78653ED"
                   },
        tail: ""
    }

    
This would provide a good mapping of
text nodes to ids while avoiding 
placing any extra tags around text.

Pros
----
* Easy to do
* High Consistency

    * Very clear mapping
    * If the id existed before, just
      compare against the old.
      
* Only new attributes added to nodes
* Consistent with XML, another markup language
* More robust
    * No tags to move around

Cons
----
* Still fairly fragile
    * If the user moves the text
    and not the id in the text or tail
    attribute, then no point.
    

***************************
Case 1: Editing A Text Node
***************************

****************************
Case 2: Deleting A Text Node
****************************

*****************************
Case 3: Inserting A Text Node
*****************************

**************************
Case 4: Moving A Text Node
**************************

*****************************
Case 5: Inserting A Text Node
*****************************



***************
Design Decision
***************
