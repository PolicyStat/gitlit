
var htmlWriter = require('../htmlWriter');
var repoWriter = require("../htmlRepoWriter");
var repoInit = require("../repoInit.js");
var parser = require('../htmlParser');
var assert = require('assert');
var path = require("path");
var fs = require("fs");

describe('Performs a git commit correctly', function () {

	var currentPath = __dirname;
	var repoName = 'testRepo';
	var pathToGeneratedFile = path.join(currentPath, 'commitTest', 'testHTML.html');
	var pathToGeneratedRepo = path.join(currentPath, 'commitTest');
    var fullRepoPath = path.join(pathToGeneratedRepo, repoName);
	deleteDirectoryIfExists(fullRepoPath);
	repoInit.initializeRepository(pathToGeneratedFile, pathToGeneratedRepo, repoName);
    console.log("completed the initialization");
    console.log(repoWriter.shellOut("ls " + fullRepoPath));
    var currentPlace = repoWriter.shellOut("pwd");
	var locCommand = 'cd ' + fullRepoPath + ' && ';
    console.log(repoWriter.shellOut('git --version'));

	it('Tests to see if the repo was initilized correctly', function () {
        console.log(repoWriter.shellOut(locCommand + 'git log'));
		var command = locCommand + 'git rev-list HEAD --count';
		assert.equal(repoWriter.shellOut(command), '1\n');
	});
	
	it('Tests to see if the commit hash changes between commits', function () {
		var command = locCommand + 'git rev-parse HEAD';
		var initialSHA1 = repoWriter.shellOut(command);
		repoInit.commitDocument(pathToGeneratedFile, pathToGeneratedRepo, repoName, "this is a test commit");
		assert.notEqual(repoWriter.shellOut(command), initialSHA1);
	});

	it('Tests to see if the commit count is correct after second commit', function () {
		var command = locCommand + 'git rev-list HEAD --count';
		assert.equal(repoWriter.shellOut(command), '2\n');
	});

	it('Tests to see if the commit message is correct', function () {
		var command = locCommand + 'git rev-parse HEAD';
		var sha1 = repoWriter.shellOut(command);
		command = locCommand + 'git log -n 1 --pretty=format:%s ' + sha1;
		assert.equal(repoWriter.shellOut(command), "this is a test commit");
	});

    repoWriter.shellOut("cd " + currentPlace);

});

// this is here temporarily, can get cleaned up with our test modifications
function deleteDirectoryIfExists(pathToDirectory) {
	if(fs.existsSync(pathToDirectory)) {
		repoWriter.shellOut('rm -rf ' + pathToDirectory);
	}
}