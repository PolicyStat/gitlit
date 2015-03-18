====================
Feature List
====================

Initialize/Create a repository with a structured document
----------------------------------------------------------------------
Description
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Users should be able to create a Git repository
with gitlit by giving it an HTML document,
and telling it to create the repository.
The user should also be able to configure which remote
(i.e. GitHub, vs. private Git repo) to create,
as well as whether it should be public or private.

Risks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
This could run into issues with private repos,
as users may have too many repos to have one document per repo,
especially if they are going to be made private.

**Risk Level:** Medium 
(Large problem, not likely to happen as we are going to address it beforehand)

Priority
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
1st

This feature is necessary for any of the other features to work properly, 
since we need to set up the repo in such a way that all the other operations will be supported.

Commit a new revision provided a new document
----------------------------------------------------------------------

Description
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
A user should be able to submit a new version of the document 
(with changes made as they desire) as a commit, 
and gitlit will convert that into the appropriate commit changes in Git.

Risks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Having this work when branching off a section could be interesting, 
as it would require that certain sections be the only things that are changed. 
Though this should be handled neatly once the organization of the repo directory is decided.

**Risk Level:** Medium 
(Should be straightforward how to do it, but possible that there are issues that come up later)

Priority
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
2nd

This feature is a linchpin feature, without this, the system doesn't really matter.

Commit a new revision provided a changed subsection?
-----------------------------------------------------------------------
Description
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
This may be automatically done in the previous feature, 
more requirements gathering needs to be done before we can state more about this feature.

Risks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
This feature may be marvellously difficult to do, 
as there are issues with identifying the sections that were changed, 
as well as determining what to do if there are changes in section that wasn't branched off of.

Priority
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Last
This feature would be nice to have, 
but will be rather difficult to pull off; 
for now, it would be best to focus on the other functionality.


View differences between revisions of a document
----------------------------------------------------------------------
Description
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Users should see a well-defined and obvious diff between the old revision and the new revision, 
ideally rendering the HTML in a manner that lets them see the webpage before and after the change.
The diff should also be per-section, not per-line

Risks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
There could be some difficulty with *how* we note the changes, 
as color changes could be unnoticeable depending on what the CSS of the page is meant to be.

Priority
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
3rd
If users can't see the differences between revisions of the document, 
then the tool doesn't really help with managing documents like Git very well, 
in fact, it might even be worse.

Accept/Reject capability for merge conflicts
----------------------------------------------------------------------
Description
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Users should be able to view any conflicts that come up in an attempted merge, 
select which version they would like to be used, 
and then approve the merge, all via a web-based UI.

Risks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Even current merge conflict tools are confusing, 
so there could be some difficulty in making the UI 
in such a way that is clear to all users 
and yet still has the power that is needed to solve merge conflicts.

Priority
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
6th

This feature matters, 
but users could always just prevent merge conflicts 
from ever happening by checking things beforehand.

Line-by-line Pull Requests
----------------------------------------------------------------------
Description
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Users should be able to send requests 
to other contributors of a repository
to review and approve their changes made to a document. 
Reviewers should be able to view the changes, 
approve, deny, and comment on changes that are in that diff.

Risks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Finding a solid way to turn a GitHub pull request
into a form that is easily view-able via 
gitlit's diff viewer could be an interesting challenge. 
That being said, there are plenty of options, so not much risk overall.

Priority
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
5th

Pull requests and reviews are critical to any form of document creation, 
whether they are source code files or something else. 
This makes this feature critical right behind basic functionality.

Commit new revisions of a document to a branch
----------------------------------------------------------------------
Description
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
A major function of Git is the ability to branch off of a repo 
and make changes that don't block the pipeline for other people. 
As such, we want to allow users to branch off of individual sections, 
as well as the document as a whole, and then allow them to make 
changes to make individual little changes to these branches.

Risks
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Deciding what the right action regarding editing sections
that are in a branch or not in a branch is a bit complex, 
so there is some risk that whatever choice we make 
might not be intuitive to a large number of people that 
we don't have access to when user-testing.

Priority
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
4th
Branching is super critical to git and gitlit; 
we have to have it right after basic committing and repository setup.