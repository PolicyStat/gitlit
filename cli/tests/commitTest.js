
var shellTools = require('../shellTools');
var repoWriter = require("../htmlRepoWriter");
var repoInit = require("../repoInit.js");
var parser = require('../htmlParser');
var assert = require('assert');
var path = require("path");
var fs = require("fs");

describe('Performs a git commit correctly', function () {

    var htmlFile = 'testHTML.html';
    var repoName = 'testRepo';
    var testObject = setupCommitTest(htmlFile, repoName);

	it('Tests to see if the repo was initialized correctly', function () {
		var command = testObject.locCommand + 'git rev-list HEAD --count';
		assert.equal(shellTools.shellOut(command), '1\n');
	});
	
	it('Tests to see if the commit hash changes between commits', function () {
		var command = testObject.locCommand + 'git rev-parse HEAD';
		var initialSHA1 = shellTools.shellOut(command);
		repoInit.commitDocument(testObject.pathToGeneratedFile, testObject.pathToGeneratedRepo, repoName, "this is a test commit");
		assert.notEqual(shellTools.shellOut(command), initialSHA1);
	});

	it('Tests to see if the commit count is correct after second commit', function () {
		var command = testObject.locCommand + 'git rev-list HEAD --count';
		assert.equal(shellTools.shellOut(command), '2\n');
	});

	it('Tests to see if the commit message is correct', function () {
		var command = testObject.locCommand + 'git rev-parse HEAD';
		var sha1 = shellTools.shellOut(command);
		command = testObject.locCommand + 'git log -n 1 --pretty=format:%s ' + sha1;
		assert.equal(shellTools.shellOut(command), "this is a test commit");
	});

    shellTools.shellOut("cd " + testObject.currentPlace);

});

function setupCommitTest(htmlFile, repoName) {
    var currentPath = path.resolve(__dirname);
    var repoSetupObject = setupRepo(currentPath, htmlFile, repoName);
    repoSetupObject['currentPlace'] = currentPath;
    repoSetupObject['locCommand'] = 'cd ' + repoSetupObject.fullRepoPath + ' && ';
    return repoSetupObject;
}

function setupRepo(currentPath, sourceHtmlFile, repoName) {

    var pathToGeneratedFile = path.join(currentPath, 'commitTest', sourceHtmlFile);
    var pathToGeneratedRepo = path.join(currentPath, 'commitTest');
    var fullRepoPath = path.join(pathToGeneratedRepo, repoName);
    repoInit.deleteDirectoryIfExists(fullRepoPath);
    repoInit.initializeRepository(pathToGeneratedFile, pathToGeneratedRepo, repoName);

    return {pathToGeneratedFile: pathToGeneratedFile, pathToGeneratedRepo:pathToGeneratedRepo, fullRepoPath:fullRepoPath };
}

// this is here temporarily, can get cleaned up with our test modifications
