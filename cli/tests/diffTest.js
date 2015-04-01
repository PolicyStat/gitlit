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
        var diffObjects = repoInit.getGitDiffOutput(testObject.pathToGeneratedRepo);
        var header = {
            changeType: 'edit',
            parent: 'derp',
            oldContent: 'Header ',
            newContent: 'Header is different '
        };
        assert.ok(deepContainsIgnoreID(diffObjects, header));
        shellTools.shellOut("cd " + testObject.currentPlace);
    });

    it('Simple Text node deletion', function() {
        var htmlFile = 'deletionBefore.html';
        var repoName = 'deletionRepo';
        var testObject = setupTest(htmlFile, repoName);
        var pathToFile = path.join(testObject.pathToDiffTest, 'deletionAfter.html');
        shellTools.shellOut(testObject.locCommand);
        repoInit.commitDocument(pathToFile, testObject.pathToDiffTest, repoName, 'this is a test commit');
        var diffObjects = repoInit.getGitDiffOutput(testObject.pathToGeneratedRepo);
        var oldHeader = {
            changeType: 'deleted',
            parent: 'span',
            content: 'after div'
        };
        assert.ok(deepContainsIgnoreID(diffObjects, oldHeader));
        shellTools.shellOut("cd " + testObject.currentPlace);
    });

    it('Simple Text node insertion', function() {
        var htmlFile = 'insertionBefore.html';
        var repoName = 'insertionRepo';
        var testObject = setupTest(htmlFile, repoName);
        var pathToFile = path.join(testObject.pathToDiffTest, 'insertionAfter.html');
        shellTools.shellOut(testObject.locCommand);
        repoInit.commitDocument(pathToFile, testObject.pathToDiffTest, repoName, 'this is a test commit');
        var diffObjects = repoInit.getGitDiffOutput(testObject.pathToGeneratedRepo);
        var oldHeader = {
            changeType: 'added',
            parent: 'span',
            content: 'new added text'
        };
        assert.ok(deepContainsIgnoreID(diffObjects, oldHeader));
        shellTools.shellOut("cd " + testObject.currentPlace);
    });

    it('Simple Text node move', function() {
        var htmlFile = 'moveBefore.html';
        var repoName = 'moveRepo';
        var testObject = setupTest(htmlFile, repoName);
        var pathToFile = path.join(testObject.pathToDiffTest, 'moveAfter.html');
        shellTools.shellOut(testObject.locCommand);
        repoInit.commitDocument(pathToFile, testObject.pathToDiffTest, repoName, 'this is a test commit');
        var diffObjects = repoInit.getGitDiffOutput(testObject.pathToGeneratedRepo);
        var newTextDiff = {
            changeType: 'added',
            parent: 'span',
            content: 'extra text'
        };
        var oldTextDiff = {
            changeType: 'deleted',
            parent: 'div2',
            content: 'extra text'
        };
        //For now, since we don't have rename id-ing and stuff, this should NOT
        //report that there was an addition and deletion. , we will want to
        //alter this test in the future, but this is mostly just a sanity check
        //for now
        //TODO: Alter this test once we have rename logic working
        assert.ok(!deepContainsIgnoreID(diffObjects, newTextDiff));
        assert.ok(!deepContainsIgnoreID(diffObjects, oldTextDiff));
        shellTools.shellOut("cd " + testObject.currentPlace);
    });

});

function deepContainsIgnoreID(array, element) {
    for(var index = 0; index < array.length; index++) {
        var arrayItem = array[index];
        var compareObject = {};
        if(arrayItem.oldContent != undefined){
            compareObject = {
                changeType: arrayItem.changeType,
                parent: arrayItem.parent,
                oldContent: arrayItem.oldContent,
                newContent: arrayItem.newContent
            };
        } else {
            compareObject = {
                changeType: arrayItem.changeType,
                parent: arrayItem.parent,
                content: arrayItem.content
            };
        }

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
