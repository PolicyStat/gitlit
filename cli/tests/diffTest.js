/**
 * Created by Devon Timaeus on 1/20/2015.
 */

var shellTools = require('../shellTools');
var repoWriter = require("../htmlRepoWriter");
var repoInit = require("../repoInit.js");
var parser = require('../htmlParser');
var assert = require('assert');
var path = require("path");
var fs = require("fs");

describe('Performs a git diff correctly:', function () {

    it('Simple Text node edit', function () {
        var htmlFile = 'completeIDs.html';
        var repoName = 'diffRepo';
        var testObject = setupTest(htmlFile, repoName);
        var pathToFile = path.join(testObject.pathToDiffTest, 'completeIDs-edited.html');
        shellTools.shellOut(testObject.locCommand);
        repoInit.commitDocument(pathToFile, testObject.pathToDiffTest, repoName, "this is a test commit");
        var diffObjects = repoInit.getDiff(testObject.pathToGeneratedRepo);
        var oldHeader = {
            changeType: 'deleted',
            parent: 'derp',
            content: '<del>Header </del>'
        };
        var newHeader = {
            changeType: 'new',
            parent: 'derp',
            content: '<ins>Header is different </ins>'
        };
        assert.ok(deepContainsIgnoreID(diffObjects, oldHeader));
        assert.ok(deepContainsIgnoreID(diffObjects, newHeader));
        shellTools.shellOut("cd " + testObject.currentPlace);
    });

});

function deepContainsIgnoreID(array, element) {
    for(var index = 0; index < array.length; index++) {
        var arrayItem = array[index];
        var compareObject = {
            changeType: arrayItem.changeType,
            parent: arrayItem.parent,
            content: arrayItem.content
        };

        if (JSON.stringify(compareObject) == JSON.stringify(element)) return true;
    }
    return false;
}

function setupTest(htmlFile, repoName) {
    var currentPath = path.resolve(__dirname);
    var repoSetupObject = setupRepo(currentPath, htmlFile, repoName);
    repoSetupObject['currentPlace'] = currentPath;
    repoSetupObject['locCommand'] = 'cd ' + repoSetupObject.fullRepoPath;
    return repoSetupObject;
}

function setupRepo(currentPath, sourceHtmlFile, repoName) {

    var pathToGeneratedFile = path.join(currentPath, 'diffTest', sourceHtmlFile);
    var pathToDiffTest = path.join(currentPath, 'diffTest');
    var pathToGeneratedRepo = path.join(currentPath, 'diffTest', repoName);
    var fullRepoPath = path.join(pathToDiffTest, repoName);
    repoInit.deleteDirectoryIfExists(fullRepoPath);
    repoInit.initializeRepository(pathToGeneratedFile, pathToDiffTest, repoName);

    return {pathToDiffTest: pathToDiffTest, pathToGeneratedRepo:pathToGeneratedRepo, fullRepoPath:fullRepoPath };
}

// this is here temporarily, can get cleaned up with our test modifications
