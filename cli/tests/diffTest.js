
var htmlWriter = require('../htmlWriter');
var repoWriter = require("../htmlRepoWriter");
var repoInit = require("../repoInit.js");
var parser = require('../htmlParser');
var differ = require('../diffParser.js');
var assert = require('assert');
var path = require("path");
var fs = require("fs");

// preemptive guess on what the results of these approximate tests will be.

describe('Diff result testing:', function () {

	it ('handles the delete of text in a node', function(){
		var currentPath = __dirname;
		var firstFileName = "deletionBefore";
		var secondFileName = "deletionAfter";
	    var pathToFirstFile = path.join(currentPath, 'resources', 'diffTesting', firstFileName);
	    var pathToSecondFile = path.join(currentPath, 'resources', 'diffTesting', secondFileName);

	    initAndCommit('deletionTest', pathToFirstFile, pathToSecondFile);
	    var repoLocation = path.join(currentPath, 'deletionTest');
	    var diff = differ.getDiff(repoLocation);

	    var tag = diff['tag'];
	    var attributes = diff['attributes'];
	    var children = diff['children'];

	    var expectedTag = '';
	    var expectedAttributes = '';
	    var expectedChildren = [{'old':"<div>extra text</div>", 'new':"", 'type':"deletion"}];

	    assert.equal(expectedChildren['type', children[0]['type']);
	    assert.equal(expectedChildren['type', children[0]['new']);
	    assert.equal(expectedChildren['type', children[0]['old']);
	});

	it ('handles the insertion of text in a node', function(){
		var currentPath = __dirname;
		var firstFileName = "insertionBefore";
		var secondFileName = "insertionAfter";
	    var pathToFirstFile = path.join(currentPath, 'resources', 'diffTesting', firstFileName);
	    var pathToSecondFile = path.join(currentPath, 'resources', 'diffTesting', secondFileName);

	    initAndCommit('insertionTest', pathToFirstFile, pathToSecondFile);
	    var repoLocation = path.join(currentPath, 'insertionTest');
	    var diff = differ.getDiff(repoLocation);

	    var tag = diff['tag'];
	    var attributes = diff['attributes'];
	    var children = diff['children'];

	    var expectedTag = '';
	    var expectedAttributes = '';
	    var expectedChildren = [{'old':"", 'new':"<div>new added text</div>", 'type':"insertion"}];

	    assert.equal(expectedChildren['type', children[0]['type']);
	    assert.equal(expectedChildren['type', children[0]['new']);
	    assert.equal(expectedChildren['type', children[0]['old']);
	});

	it ('handles the move of text in a node', function(){
		var currentPath = __dirname;
		var firstFileName = "moveBefore";
		var secondFileName = "moveAfter";
	    var pathToFirstFile = path.join(currentPath, 'resources', 'diffTesting', firstFileName);
	    var pathToSecondFile = path.join(currentPath, 'resources', 'diffTesting', secondFileName);

	    initAndCommit('moveTest', pathToFirstFile, pathToSecondFile);
	    var repoLocation = path.join(currentPath, 'moveTest');
	    var diff = differ.getDiff(repoLocation);

	    var tag = diff['tag'];
	    var attributes = diff['attributes'];
	    var children = diff['children'];

	});

});

function initAndCommit(repoName, file1, file2){
	outputPath = __dirname;
	repoInit.initializeRepository(file1, outputPath, repoName);
	commitMessage = 'repoName test commit';
	repoInit.commitDocument(file2, outputPath, repoName, commitMessage);
}
