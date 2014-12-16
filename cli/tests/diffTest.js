
var htmlWriter = require('../htmlWriter');
var repoWriter = require("../htmlRepoWriter");
var repoInit = require("../repoInit.js");
var parser = require('../htmlParser');
var assert = require('assert');
var path = require("path");
var fs = require("fs");

// preemptive guess on what the results of these approximate tests will be.

describe('Diff result testing:', function () {
	it ('handles the edit of text in a node', function(){
		var currentPath = __dirname;
		var firstFileName = "case1Before";
		var secondFileName = "case1After";
	    var pathToFirstFile = path.join(currentPath, 'resources', 'diffTesting', firstFileName);
	    var pathToSecondFile = path.join(currentPath, 'resources', 'diffTesting', secondFileName);

	    // they'll probably have to be turned into their intermediaries for comparison, right now this is fauxcode.
	    var result = compare(pathToFirstFile, pathToSecondFile);
	    var expected = [{isself:false, por_id:"40E36DB5C0AD13957351", child:0, modification:"add, delete", text:"First Text that has been altered"}];
	    assert.equal(expected, result);
	});

	it ('handles the delete of text in a node', function(){
		var currentPath = __dirname;
		var firstFileName = "case2Before";
		var secondFileName = "case2After";
	    var pathToFirstFile = path.join(currentPath, 'resources', 'diffTesting', firstFileName);
	    var pathToSecondFile = path.join(currentPath, 'resources', 'diffTesting', secondFileName);

	    var result = compare(pathToFirstFile, pathToSecondFile);
	    var expected = [{isself:false, por_id:"40E36DB5C0AD13957351", child:0, modification:"delete"}];
	    assert.equal(expected, result);
	});

	it ('handles the insertion of text in a node', function(){
		var currentPath = __dirname;
		var firstFileName = "case3Before";
		var secondFileName = "case3After";
	    var pathToFirstFile = path.join(currentPath, 'resources', 'diffTesting', firstFileName);
	    var pathToSecondFile = path.join(currentPath, 'resources', 'diffTesting', secondFileName);

	    var result = compare(pathToFirstFile, pathToSecondFile);
	    var expected = [{isself:false, por_id:"40E36DB5C0AD13957351", child:0, modification:"add", text:"First Text"}];
	    assert.equal(expected, result);
	});

	it ('handles the move of text in a node', function(){
		var currentPath = __dirname;
		var firstFileName = "case1Before";
		var secondFileName = "case1After";
	    var pathToFirstFile = path.join(currentPath, 'resources', 'diffTesting', firstFileName);
	    var pathToSecondFile = path.join(currentPath, 'resources', 'diffTesting', secondFileName);

	    var result = compare(pathToFirstFile, pathToSecondFile);
	    var expected = [{isself:false, por_id:"40E36DB5C0AD13957351", child:0, modification:"delete"}, {isself:false, por_id:"40E36DB5C0AD13957351", child:1, modification:"add", text:"First Text"}];
	    assert.equal(expected, result);
	});

	it ('handles the move and edit of text in a node', function(){
		var currentPath = __dirname;
		var firstFileName = "case1Before";
		var secondFileName = "case1After";
	    var pathToFirstFile = path.join(currentPath, 'resources', 'diffTesting', firstFileName);
	    var pathToSecondFile = path.join(currentPath, 'resources', 'diffTesting', secondFileName);

	    var result = compare(pathToFirstFile, pathToSecondFile);
	    var expected = [{isself:false, por_id:"40E36DB5C0AD13957351", child:0, modification:"delete"}, {isself:false, por_id:"40E36DB5C0AD13957351", child:1, modification:"add", text:"This is my new First Text"}];
	    assert.equal(expected, result);
	});
}

