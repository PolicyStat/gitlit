/**
 * Created by Devon Timaeus on 9/24/2014.
 */

// This provides symbolic names for the octal modes used by git trees.
var modes = require('js-git/lib/modes');

// Create a repo by creating a plain object.
var repo = {};

// This provides an in-memory storage backend that provides the following APIs:
// - saveAs(type, value) => hash
// - loadAs(type, hash) => hash
// - saveRaw(hash, binary) =>
// - loadRaw(hash) => binary
require('js-git/mixins/mem-db')(repo);

// This adds a high-level API for creating multiple git objects by path.
// - createTree(entries) => hash
require('js-git/mixins/create-tree')(repo);

// This provides extra methods for dealing with packfile streams.
// It depends on
// - unpack(packStream, opts) => hashes
// - pack(hashes, opts) => packStream
require('js-git/mixins/pack-ops')(repo);

// This adds in walker algorithms for quickly walking history or a tree.
// - logWalk(ref|hash) => stream<commit>
// - treeWalk(hash) => stream<object>
require('js-git/mixins/walkers')(repo);

// This combines parallel requests for the same resource for effeciency under load.
require('js-git/mixins/read-combiner')(repo);

// This makes the object interface less strict.  See it's docs for details
require('js-git/mixins/formats')(repo);

// First we create a blob from a string.  The `formats` mixin allows us to
// use a string directly instead of having to pass in a binary buffer.
var blobHash = repo.saveAs("blob", "Hello World\n");
console.log("Created the blob and saved to repo");

// Now we create a tree that is a folder containing the blob as `greeting.txt`
var treeHash = repo.saveAs("tree", {
    "greeting.txt": { mode: modes.file, hash: blobHash }
});
console.log("Created the tree and saved to repo");

// With that tree, we can create a commit.
// Again the `formats` mixin allows us to omit details like committer, date,
// and parents.  It assumes sane defaults for these.
var commitHash = repo.saveAs("commit", {
    author: {
        name: "Tim Caswell",
        email: "tim@creationix.com"
    },
    tree: treeHash,
    message: "Test commit\n"
});
console.log("Created a commit for the new repo in-memory");