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

    * HTML might misbehave if we inject our own tags
    
* Fragile
    
    * If a user deletes the tag, it will look like an insert.
    
* Gives the User responsibility

    * The user has to keep track of the new tags
    * More work for the user
    
    
XML-style Text & Tail
=====================
The next method of storing the 
ids for text nodes took some 
inspiration from XML. In XML,
each tag has a ``text`` attribute
and a ``tail`` attribute.
The ``text`` attribute just
has the first text of the node
that isn't a child's tail.
The ``tail`` attribute has any
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

.. code-block:: javascript

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

.. code-block:: javascript

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
    * If the id existed before, just compare against the old.
      
* Only new attributes added to nodes
* Consistent with XML, another markup language
* More robust
    * No tags to move around


Cons
----
* Still fairly fragile
    * If the user moves the text and not the id in the text or tail attribute, then no point.



*****************************************
Do we even need tags to track text nodes?
*****************************************
The reason why we need tags to keep track
of which text nodes are which is so that
we can know which sections are which, and
know if they have been moved without having
to do a text comparison on the contents of
the text node.

This is important because if we were to
do a text comparison, we would have to
ask, "How accurate/sensitive is good enough?"
Because this is complex, if we can avoid
text comparison altogether that would be
preferable.

That being said, if we don't care about
differentiating between additions, deletions,
and moves, then we could just ignore tags
and do text-comparison. The reason this is
alright is because at some basic level
text comparison needs to happen for a diff,
but if we don't care about tracking moves,
then we don't need to keep track of moves
*and* changes, thus, if a section was both
moved *and* changed, we could just say it
was an addition and be done with it.

***************************
Case 1: Editing A Text Node
***************************
Consider the case of editing a pre-existing
text node. The document before the edit might
look like this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        First Text
        <div por-id="76F7BEE8A2001AC7144D">
            div Text
        </div>
        Second Text
    </span>

After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        First Text that has been altered
        <div por-id="76F7BEE8A2001AC7144D">
            div Text
        </div>
        Second Text
    </span>

Note that the first text section has been edited,
but not moved or had any other changes applied to
it.

In this case, the functionality we would like
is just saying that the first section was changed,
with no other perceived changes or moves.

Custom Tags
-----------
Assuming the repository already existed, if we made
the change with Custom tags, then there are 2 cases.

1. The text nodes already had custom tags around them
2. The text nodes didn't have any custom tags.

In the second case, the commit would just put custom
tags around anything that didn't, in which case, they
would be seen as new files if there was a diff (likely).

So, for this case, we really only care about if there were tags already.

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <por por-id="39E1D62AADCF588B873C ">First Text</por>
        <div por-id="76F7BEE8A2001AC7144D">
            <por por-id="56ADFDCAACEB1FDBCEA1">div Text</por>
        </div>
        <por por-id="3CED92A56695A78653ED">Second Text</por>
    </span>


After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <por por-id="39E1D62AADCF588B873C ">First Text that has been altered</por>
        <div por-id="76F7BEE8A2001AC7144D">
            <por por-id="56ADFDCAACEB1FDBCEA1">div Text</por>
        </div>
        <por por-id="3CED92A56695A78653ED">Second Text</por>
    </span>


In this situation, since the text was edited in the same
text node (which is defined by the custom tags), the new
text would just fall into a file that already exits:
39E1D62AADCF588B873C.txt (or something similar). Because
of this, Git would perceive this purely as a change in the
file/section, which is what we wanted. Even if we did diff
logic ourselves, it would be easy to see that the text was
edited, so it is just a text change.

XML text-tail
-------------
Assuming the repository already existed, if we made
the change with XML text-tail, then the relationships
of text & tail would already be stored in the HTML's
attributes, otherwise, there would be issues similar to
custom tags: the change would be perceived as completely
new text.

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351" text="39E1D62AADCF588B873C">
        First Text
        <div por-id="76F7BEE8A2001AC7144D" text="56ADFDCAACEB1FDBCEA1" tail="3CED92A56695A78653ED">
            div Text
        </div>
        Second Text
    </span>


After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351" text="39E1D62AADCF588B873C">
        First Text that has been altered
        <div por-id="76F7BEE8A2001AC7144D" text="56ADFDCAACEB1FDBCEA1" tail="3CED92A56695A78653ED">
            div Text
        </div>
        Second Text
    </span>


In this case, literally nothing **but** the text got changed.
This is as ideal as we can get, as the user then doesn't need
to navigate around more tags. Granted, there are attributes
to deal with, but this is likely to be seen as less of an
issue for users.

****************************
Case 2: Deleting A Text Node
****************************
Consider the case of deleting a pre-existing
text node. The document before the edit might
look like this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        First Text
        <div por-id="76F7BEE8A2001AC7144D">
            div Text
        </div>
        Second Text
    </span>

After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <div por-id="76F7BEE8A2001AC7144D">
            div Text
        </div>
        Second Text
    </span>

Note that the first text section has been deleted,
but not moved or had any other changes applied to
it.

In this case, the functionality we would like
is just saying that the first section was deleted,
with no other perceived changes or moves.

Custom Tags
-----------
For this case, we really only care about if there
already tags.

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <por por-id="39E1D62AADCF588B873C ">First Text</por>
        <div por-id="76F7BEE8A2001AC7144D">
            <por por-id="56ADFDCAACEB1FDBCEA1">div Text</por>
        </div>
        <por por-id="3CED92A56695A78653ED">Second Text</por>
    </span>


After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <por por-id="39E1D62AADCF588B873C "></por>
        <div por-id="76F7BEE8A2001AC7144D">
            <por por-id="56ADFDCAACEB1FDBCEA1">div Text</por>
        </div>
        <por por-id="3CED92A56695A78653ED">Second Text</por>
    </span>

**Or, it might look like this, depending on what the user did**

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <div por-id="76F7BEE8A2001AC7144D">
            <por por-id="56ADFDCAACEB1FDBCEA1">div Text</por>
        </div>
        <por por-id="3CED92A56695A78653ED">Second Text</por>
    </span>

In either situation, we could easily identify that there
is now no text for the object that was the first text node.
This would be identified by it either the node **not being
there** or the node containing no text. Both are reasonable
to have happen, but the fact that there could be either
case means there is a bit more decision making to be made
that for editing.

XML text-tail
-------------
Document before change

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351" text="39E1D62AADCF588B873C">
        First Text
        <div por-id="76F7BEE8A2001AC7144D" text="56ADFDCAACEB1FDBCEA1" tail="3CED92A56695A78653ED">
            div Text
        </div>
        Second Text
    </span>


After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351" text="39E1D62AADCF588B873C">
        <div por-id="76F7BEE8A2001AC7144D" text="56ADFDCAACEB1FDBCEA1" tail="3CED92A56695A78653ED">
            div Text
        </div>
        Second Text
    </span>

**The user could also get rid of the text attribute as well**

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <div por-id="76F7BEE8A2001AC7144D" text="56ADFDCAACEB1FDBCEA1" tail="3CED92A56695A78653ED">
            div Text
        </div>
        Second Text
    </span>


Similar to custom tags, we need to have checking to
see if the text actually exists if there is a text
attribute. If not, then the section was deleted,
if there isn't even a text attribute, then if there
isn't any text, it was deleted.

In the case of tails, the same idea would happen,
which creates 4 cases really:

1. Text

    1. Tag there but no text
    2. No text & no tag

2. Tail

    3. Tag there but no text
    4. No text & no tag

.. note::

    If there was no tag and then
    text, in both systems, the text
    would be recognized as an insertion.


*****************************
Case 3: Inserting A Text Node
*****************************
Consider the case of inserting a new text
node. The document before the edit might
look like this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <div por-id="76F7BEE8A2001AC7144D">
            div Text
        </div>
        Second Text
    </span>

After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        First Text
        <div por-id="76F7BEE8A2001AC7144D">
            div Text
        </div>
        Second Text
    </span>

Note that a text section was added at the beginning,
but that no other changes were made.

In this case, the functionality we would like
is just saying that the first section was deleted,
with no other perceived changes or moves.

.. note::

    If there was text added to a pre-existing section,
    it would not be recognized as a separate text node.
    It would just be an edit.


Custom Tags
-----------
Before the edit

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <div por-id="76F7BEE8A2001AC7144D">
            <por por-id="56ADFDCAACEB1FDBCEA1">div Text</por>
        </div>
        <por por-id="3CED92A56695A78653ED">Second Text</por>
    </span>


After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <por por-id="39E1D62AADCF588B873C ">First Text</por>
        <div por-id="76F7BEE8A2001AC7144D">
            <por por-id="56ADFDCAACEB1FDBCEA1">div Text</por>
        </div>
        <por por-id="3CED92A56695A78653ED">Second Text</por>
    </span>

Custom tags here behave exactly as we would want and expect.
Since there is completely new text where there wasn't a tag,
then a tag (and therefore a file) will be made, so it's
completely new.

One additionally "cool" thing that *could* be done, is
using custom tags for change tracking granularity. As
an example, if the insertion was instead after the
custom tag with "Second Text", it would be recognized
as a new text node, despite it normally not being so.
This *could* be useful or something users want, since
in further applications (for example, docx files)
insertions of new paragraphs might be nicely tracked
by allowing something like this.

XML text-tail
-------------
Document before change

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <div por-id="76F7BEE8A2001AC7144D" text="56ADFDCAACEB1FDBCEA1" tail="3CED92A56695A78653ED">
            div Text
        </div>
        Second Text
    </span>


After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351" text="39E1D62AADCF588B873C">
        First Text
        <div por-id="76F7BEE8A2001AC7144D" text="56ADFDCAACEB1FDBCEA1" tail="3CED92A56695A78653ED">
            div Text
        </div>
        Second Text
    </span>

**The user could also add the text after the div**

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <div por-id="76F7BEE8A2001AC7144D" text="56ADFDCAACEB1FDBCEA1" tail="3CED92A56695A78653ED">
            div Text
        </div>
        Second Text
        First Text
    </span>


In the first case, there would just now be a ``text``
attribute where there wasn't before, so it's easy
to see the insertion. This also applies to if it
ended up creating a ``tail`` attribute.

Unlike with custom tags, there would not be a way
to keep track of multiple text nodes in a row.
The second case would just be viewed as an edit
of that text node.


**************************
Case 4: Moving A Text Node
**************************
Consider the case of moving a pre-existing
text node. The document before the edit might
look like this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        First Text
        <div por-id="76F7BEE8A2001AC7144D">
            div Text
        </div>
        <div por-id="placeholder">
        </div>
        Second Text
    </span>

After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <div por-id="76F7BEE8A2001AC7144D">
            div Text
        </div>
        First Text
        <div por-id="placeholder">
        </div>
        Second Text
    </span>

Note that a text section was moved, without any
edits to the content of the text node being made.

In this case, the functionality we would like
is just saying that the first section was moved
to be after the first div.

.. note::

    Again if this was moved to be part
    of another pre-existing text node,
    it would just be noted as a change
    to the destination node and a deletion
    of the old node.

Custom Tags
-----------
Before the edit

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <por por-id="39E1D62AADCF588B873C ">First Text</por>
        <div por-id="76F7BEE8A2001AC7144D">
            <por por-id="56ADFDCAACEB1FDBCEA1">div Text</por>
        </div>
        <div por-id="placeholder">
        </div>
        <por por-id="3CED92A56695A78653ED">Second Text</por>
    </span>


After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351">
        <div por-id="76F7BEE8A2001AC7144D">
            <por por-id="56ADFDCAACEB1FDBCEA1">div Text</por>
        </div>
        <por por-id="39E1D62AADCF588B873C ">First Text</por>
        <div por-id="placeholder">
        </div>
        <por por-id="3CED92A56695A78653ED">Second Text</por>
    </span>

Custom tags handle this incredibly well, as the only thing to note
would be that the order of the nodes is different during the parsing,
so the only difference would be a change in the metadata file.

However, one thing to note, the user would need to also move the tag
that the text was in. Otherwise, the text node would be shown to be
new, and the old tag would say it was edited in some manner, or perhaps
deleted.

XML text-tail
-------------
Document before change

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351" text="39E1D62AADCF588B873C">
        First Text
        <div por-id="76F7BEE8A2001AC7144D" text="56ADFDCAACEB1FDBCEA1">
            div Text
        </div>
        <div por-id="placeholder" tail="3CED92A56695A78653ED">
        </div>
        Second Text
    </span>


After the edit, the document might look like
this:

.. code-block:: html

    <span por-id="40E36DB5C0AD13957351" >
        <div por-id="76F7BEE8A2001AC7144D" text="56ADFDCAACEB1FDBCEA1" tail="39E1D62AADCF588B873C">
            div Text
        </div>
        First Text
        <div por-id="placeholder" tail="3CED92A56695A78653ED">
        </div>
        Second Text
    </span>

Similar to custom tags, moves are adequately represented,
as the text and tails can be scene to be added or removed.
If the text or tail is missing or added, just look for if
they were missing elsewhere to match up.

The only downside, is that while in custom tags, users need
only move the whole tagged object, here, users need to move
the individual attributes. The hard part here, is that there
are possibly more things to move, and the users would need to
move them to the proper place, which is harder to make clear
for the user.

***************
Design Decision
***************
