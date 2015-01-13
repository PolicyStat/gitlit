
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

	    var result = compare(pathToFirstFile, pathToSecondFile);
	    var expected = [{isself:false, por_id:"40E36DB5C0AD13957351", child:0, modification:"delete"}];
	    assert.equal(expected, result);
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

	    var result = compare(pathToFirstFile, pathToSecondFile);
	    var expected = [{isself:false, por_id:"40E36DB5C0AD13957351", child:0, modification:"add", text:"First Text"}];
	    assert.equal(expected, result);
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

	    var result = compare(pathToFirstFile, pathToSecondFile);
	    var expected = [{isself:false, por_id:"40E36DB5C0AD13957351", child:0, modification:"delete"}, {isself:false, por_id:"40E36DB5C0AD13957351", child:1, modification:"add", text:"First Text"}];
	    assert.equal(expected, result);
	});

});

function initAndCommit(repoName, file1, file2){
	outputPath = __dirname;
	repoInit.initializeRepository(file1, outputPath, repoName);
	commitMessage = 'repoName test commit';
	repoInit.commitDocument(file2, outputPath, repoName, commitMessage);
}
