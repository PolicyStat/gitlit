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

    it('Large Text Node edit', function () {
        var htmlFile = 'completeIDs.html';
        var repoName = 'LargeTextNodeEditRepo';
        var testObject = setupTest(htmlFile, repoName);
        var pathToFile = path.join(testObject.pathToDiffTest, 'completeIDs-edited.html');
        shellTools.shellOut(testObject.locCommand);
        repoInit.commitDocument(pathToFile, testObject.pathToDiffTest, repoName, "this is a test commit");
        var diffObjects = repoInit.getInterpretedDiff(testObject.pathToGeneratedRepo);
        var header = {
            changeType: 'edit',
            parent: 'derp',
            oldContent: 'Header ',
            newContent: 'Header is different '
        };
        assert.ok(deepContainsIgnoreID(diffObjects, header));
        shellTools.shellOut("cd " + testObject.currentPlace);
    });

    it('Small Text Node edit', function () {
        var htmlFile = 'smallTextNodeEditBefore.html';
        var repoName = 'smallTextNodeEditRepo';
        var testObject = setupTest(htmlFile, repoName);
        var pathToFile = path.join(testObject.pathToDiffTest, 'smallTextNodeEditAfter.html');
        shellTools.shellOut(testObject.locCommand);
        repoInit.commitDocument(pathToFile, testObject.pathToDiffTest, repoName, "this is a test commit");
        var diffObjects = repoInit.getInterpretedDiff(testObject.pathToGeneratedRepo);
        var header = {
            changeType: 'edit',
            parent: 'derp',
            oldContent: 'Header ',
            newContent: 'Headers '
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
        var diffObjects = repoInit.getInterpretedDiff(testObject.pathToGeneratedRepo);
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
        var diffObjects = repoInit.getInterpretedDiff(testObject.pathToGeneratedRepo);
        var oldHeader = {
            changeType: 'added',
            parent: 'span',
            content: 'new added text'
        };
        assert.ok(deepContainsIgnoreID(diffObjects, oldHeader));
        shellTools.shellOut("cd " + testObject.currentPlace);
    });

    it('Move type testing', function() {
        var htmlFile = 'moveBefore.html';
        var repoName = 'moveRepo';
        var testObject = setupTest(htmlFile, repoName);
        var pathToFile = path.join(testObject.pathToDiffTest, 'moveAfter.html');
        shellTools.shellOut(testObject.locCommand);
        repoInit.commitDocument(pathToFile, testObject.pathToDiffTest, repoName, 'this is a test commit');
        var diffObjects = repoInit.getInterpretedDiff(testObject.pathToGeneratedRepo);
        var externalMove = {
            changeType: 'move',
                old: { parent: "148eaa51fddefbb7dc5cf485" },
            new: { parent: "b4ab0b72dab11be0b451f3bc" }
        };
        var internalMove =  {
            changeType: 'move',
            old: { parent: "b4ab0b72dab11be0b451f3bc" },
            new: { parent: "b4ab0b72dab11be0b451f3bc" }
        };
        assert.ok(deepContainsIgnoreID(diffObjects, externalMove));
        assert.ok(deepContainsIgnoreID(diffObjects, internalMove));
        shellTools.shellOut("cd " + testObject.currentPlace);
    });

    it('Complex diff test', function () {
        var htmlFile = 'LargeNumberOfChanges.html';
        var repoName = 'ComplexDiffRepo';
        var testObject = setupTest(htmlFile, repoName);
        var pathToFile = path.join(testObject.pathToDiffTest, 'LargeNumberOfChanges-After.html');
        shellTools.shellOut(testObject.locCommand);
        repoInit.commitDocument(pathToFile, testObject.pathToDiffTest, repoName, "this is a test commit");
        var diffObjects = repoInit.getInterpretedDiff(testObject.pathToGeneratedRepo);
        var header = {
            changeType: 'edit',
            parent: 'derp',
            oldContent: 'Header ',
            newContent: 'Header is too different '
        };
        var newStuff = {
            changeType: 'added',
            parent: '4bbe6f9ca93df19c42fc731c',
            content: 'new stuff here'
        };
        var listLook = {
            changeType: 'added',
            parent: 'li1',
            content: 'Let&#39;s look at lists'
        };
        var weird = {
            changeType: 'added',
            parent: 'li2',
            content: 'this could get weird'
        };
        var unwanted = {
            changeType: 'added',
            parent: 'li3',
            content: 'don&#39;t want to keep this'
        };
        assert.ok(deepContainsIgnoreID(diffObjects, header));
        assert.ok(deepContainsIgnoreID(diffObjects, newStuff));
        assert.ok(deepContainsIgnoreID(diffObjects, listLook));
        assert.ok(deepContainsIgnoreID(diffObjects, weird));
        assert.ok(deepContainsIgnoreID(diffObjects, unwanted));

        shellTools.shellOut("cd " + testObject.currentPlace);
    });

    it('Very Complex diff test', function () {
        this.timeout(3000);
        var htmlFile = 'LargeNumberOfChanges-After.html';
        var repoName = 'VeryComplexDiffRepo';
        var testObject = setupTest(htmlFile, repoName);
        var pathToFile = path.join(testObject.pathToDiffTest, 'LargeNumberOfChangesFinal.html');
        shellTools.shellOut(testObject.locCommand);
        repoInit.commitDocument(pathToFile, testObject.pathToDiffTest, repoName, "this is a test commit");
        var diffObjects = repoInit.getInterpretedDiff(testObject.pathToGeneratedRepo);
        var header = {
            changeType: 'edit',
            parent: 'derp',
            oldContent: 'Header is too different ',
            newContent: 'Header is two different '
        };
        var crossDocMove = {
            changeType: 'move',
            old: { parent: "li1" },
            new: { parent: "derp" }
        };
        var added = {
            changeType: 'added',
            parent: 'li4',
            content: 'this is a new addition'
        };
        var weird = {
            changeType: 'edit',
            parent: 'li2',
            oldContent: 'this could get weird',
            newContent: 'this is pretty darn weird'
        };
        var internalNodeMove = {
            changeType: 'move',
            old: { parent: "li3" },
            new: { parent: "li3" }
        };
        assert.ok(deepContainsIgnoreID(diffObjects, header));
        assert.ok(deepContainsIgnoreID(diffObjects, crossDocMove));
        assert.ok(deepContainsIgnoreID(diffObjects, added));
        assert.ok(deepContainsIgnoreID(diffObjects, weird));
        assert.ok(deepContainsIgnoreID(diffObjects, internalNodeMove));

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
        } else if(arrayItem.changeType == 'move' ){
            //Since moves keep track of the ID's of the objects moved, and their parents,
            //we need to do checking a little different. Since we have no idea what text
            //node id's were! So just check that the parents moved as we expected
            compareObject = { changeType: 'move',
                              old: { parent: arrayItem.old.parent },
                              new: { parent: arrayItem.new.parent }
                            };
        }
        else {
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
