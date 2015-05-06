/**
 * Created by Devon Timaeus on 9/30/2014.
 */
var fs = require('fs');
var path = require('path');
var parser = require('./htmlParser');
var fileWriter = require('./htmlWriter');
var repoWriter = require('./htmlRepoWriter');
var diffParser = require('./diffParser');
var shellTools = require('./shellTools');
var html = require('html');
var wrench = require('wrench');

function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}

function getFileContents(file) {
    if (!fs.existsSync(file)) {
        throw new URIError('No file found at: ' + file);
    }

    // We will want to do mimetype detection at some point, but for now, this is fine
    var extension = getExtension(file);
    if (extension.toLowerCase() != 'html') {
        throw new TypeError('Filetype not HTML');
    }

    try {
        return fs.readFileSync(file, 'utf8');
    } catch (err) {
        throw new URIError('No file found at: ' + file);
    }
}

function initializeRepository(file, outputPath, repoName) {
    try {
        if (!fs.existsSync(outputPath)) {
            throw new URIError("Output Path does not exist");
        }
        if (fs.existsSync(outputPath + repoName) || fs.existsSync(outputPath + "/" + repoName)) {
            throw new URIError("Error: A directory already exists at this location with the name " + repoName);
        }
        var fileContents = getFileContents(file);
        var porObject = parser.parseHTML(fileContents, repoName);
        repoWriter.writeRepoToDirectory(porObject, outputPath);
    } catch (err) {
        if (err instanceof TypeError) {
            console.error(err.message);
        }
        if (err instanceof URIError) {
            console.error(err.message);
        }
        if (err instanceof ReferenceError) {
            console.log(err.message);
        }
    }
}

function commitDocument(file, outputPath, repoName, commitMessage) {
    try {
        if (!fs.existsSync(outputPath)) {
            throw new URIError("Output Path does not exist");
        }
        var fileContents = getFileContents(file);
        var porObject = parser.parseHTML(fileContents, repoName);
        repoWriter.writeCommitToDirectory(porObject, outputPath, commitMessage);
    } catch (err) {
        if (err instanceof TypeError) {
            console.error(err.message);
        }
        if (err instanceof URIError) {
            console.error(err.message);
        }
    }
}

function getDiff(repoLocation) {
    try {
        if(!fs.existsSync(repoLocation)) {
            throw new URIError("Directory does not exist at location: " + repoLocation);
        }
        var diffOutput = diffParser.getGitDiffOutput(repoLocation);
        var granules = diffParser.processDiffIntoFileGranules(diffOutput);
        return diffParser.convertFileGranulesIntoDiffObjects(granules);
    } catch (err) {
        if (err instanceof URIError) {
            console.error(err.message);
        }
    }
}

function getOldAndNewFileVersions(repoLocation) {
    try {
        if(!fs.existsSync(repoLocation)) {
            throw new URIError("Directory does not exist at location: " + repoLocation);
        }
        var fileVersions = fileWriter.getPreviousFileVersions(repoLocation);
        var oldVersion = fileVersions[0];
        var newVersion = fileVersions[1];

        return [oldVersion, newVersion];

    } catch (err) {
        if (err instanceof URIError) {
            console.error(err.message);
        }
    }
}

function getInterprettedDiff(repoLocation) {
    var diffObjects = getDiff(repoLocation);
    return diffParser.resolveComplexChanges(diffObjects);
}

function createDiffPairs(oldVersion, newVersion, contentChanges) {
    var oldBody = diffParser.extractBodyObject(oldVersion);
    var newBody = diffParser.extractBodyObject(newVersion);

    var diffCleanOldBody = diffParser.cleanGitlitObjectForDiff(oldBody);
    var diffCleanNewBody = diffParser.cleanGitlitObjectForDiff(newBody);

    var markedOld = diffParser.markBodyForDiff(diffCleanOldBody, contentChanges);
    var markedNew = diffParser.markBodyForDiff(diffCleanNewBody, contentChanges);

    var linearizedOld = diffParser.linearizeGitlitObject(markedOld);
    var linearizedNew = diffParser.linearizeGitlitObject(markedNew);

    return diffParser.pairUpRows(linearizedOld, linearizedNew);
}

function createMergePairs(oldVersion, newVersion, contentChanges) {
    var oldBody = diffParser.extractBodyObject(oldVersion);
    var newBody = diffParser.extractBodyObject(newVersion);
    var markedOld = diffParser.markBodyForDiff(oldBody, contentChanges);
    var markedNew = diffParser.markBodyForDiff(newBody, contentChanges);
    var linearizedOld = diffParser.linearizeGitlitObject(markedOld);
    var linearizedNew = diffParser.linearizeGitlitObject(markedNew);
    return diffParser.pairUpRows(linearizedOld, linearizedNew);
}

function setUpPairsForDiffDisplay(pairs) {
    var numberedPairs = diffParser.markRowNumbersOnPairs(pairs);
    var splitBodies = diffParser.splitPairsIntoBodies(numberedPairs);
    var oldDocObject = diffParser.convertToDiffDisplayDocObject(splitBodies.oldBody).docObject;
    var newDocObject = diffParser.convertToDiffDisplayDocObject(splitBodies.newBody).docObject;
    var oldHTMLString = html.prettyPrint(diffParser.convertToDiffSafeHTMLString(oldDocObject), {indent_size: 2});
    var newHTMLString = html.prettyPrint(diffParser.convertToDiffSafeHTMLString(newDocObject), {indent_size: 2});
    return {left: oldHTMLString, right:newHTMLString};
}

function matchMovesEdits(pairs) {
    var changeIDs = [];
    var decisionNumber = 0;

    pairs.forEach(function(pair){
        var changeId = "";
        if(pair.left != null) {
            if(pair.left.diffMetadata != undefined || pair.left.diffMetadata != null) {
                if(pair.left.diffMetadata.changeType == "edit") {
                    changeId = pair.left.diffMetadata.oldID + pair.left.diffMetadata.newID;
                    if(changeIDs.indexOf(changeId) == -1){
                        changeIDs.push(changeId);
                        pair.left.diffMetadata.decisionNumber = decisionNumber + "m";
                        decisionNumber += 1;
                    }
                } else if (pair.left.diffMetadata.changeType == "move") {
                    changeId = pair.left.diffMetadata.old.ID + pair.left.diffMetadata.new.ID;
                    if(changeIDs.indexOf(changeId) == -1){
                        changeIDs.push(changeId);
                        pair.left.diffMetadata.decisionNumber = decisionNumber + "m";
                        decisionNumber += 1;
                    }
                }
            }
        }
        changeId = "";
        if(pair.right != null) {
            if(pair.right.diffMetadata != undefined || pair.right.diffMetadata != null) {
                if(pair.right.diffMetadata.changeType == "edit") {
                    changeId = pair.right.diffMetadata.oldID + pair.right.diffMetadata.newID;
                    if(changeIDs.indexOf(changeId) == -1){
                        changeIDs.push(changeId);
                        pair.right.diffMetadata.decisionNumber = decisionNumber + "m";
                        decisionNumber += 1;
                    }
                } else if (pair.right.diffMetadata.changeType == "move") {
                    changeId = pair.right.diffMetadata.old.ID + pair.right.diffMetadata.new.ID;
                    if(changeIDs.indexOf(changeId) == -1){
                        changeIDs.push(changeId);
                        pair.right.diffMetadata.decisionNumber = decisionNumber + "m";
                        decisionNumber += 1;
                    }
                }
            }
        }
    });
}

function createCopyOfDiffResources(outputLocation) {
    wrench.copyDirSyncRecursive(path.join(path.resolve(__dirname), 'diffResources'), path.resolve(outputLocation));
}

function createJSONForDisplay(outputLocation, diffObject, mergePairs, mergeFileVersion) {
    var fileContents = 'var diffDisplayInfo = ' + JSON.stringify(diffObject);
    fileContents += ";\n";
    fileContents += "var mergePairs = " + JSON.stringify(mergePairs);
    fileContents += ";\n";
    fileContents += "var mergeFile = " + JSON.stringify(mergeFileVersion) + ";";
    fs.writeFileSync(path.join(outputLocation, "diffDisplayObject.js"), fileContents, "utf8");
}

function getMergedPairs(mergefile, outputLocation){
    try {
        if(!fs.existsSync(mergefile)) {
            throw new URIError("merge-file does not exist at location: " + mergefile);
        }
        var jsonString = fs.readFileSync(mergefile, 'utf8');
        var mergeJson = JSON.parse(jsonString);
        var decisions = mergeJson.selections;
        var mergePairs = mergeJson.mergePairs;
        var mergeFile = mergeJson.mergeFile;
        var mergedPairs = diffParser.applyDecisionsToMergePairs(decisions, mergePairs);
        var mergedDocObject = diffParser.convertToMergedDocObject(mergedPairs).docObject;
        var writeReadyDocObject = diffParser.insertBodyIntoDocObject(mergedDocObject, mergeFile);
        fileWriter.writePORObjectToHTMLFile(writeReadyDocObject, path.resolve(outputLocation));
    } catch (err) {
        if (err instanceof URIError) {
            console.error(err.message);
        }
    }
}

function deleteDirectoryIfExists(pathToDirectory) {
    if(fs.existsSync(pathToDirectory)) {
        //Need to change the permissions to write so that we can actually delete stuff in general
        shellTools.shellOut('sudo chmod -R u+w ' + pathToDirectory + ';rm -rf ' + pathToDirectory);
    }
}

function deleteFileIfExists(pathToFile) {
    if(fs.existsSync(pathToFile)) {
        fs.unlinkSync(pathToFile);
    }
}

/*
    This makes the functions visible in other js files when using require
    The first part is the key, and will specify what the function should be
    called outside of this file, the second part is a function pointer to the
    function that is desired to be associated with that name.
 */
module.exports = {
    initializeRepository: initializeRepository,
    commitDocument: commitDocument,
    getFileContents : getFileContents,
    getExtension : getExtension,
    deleteDirectoryIfExists: deleteDirectoryIfExists,
    deleteFileIfExists: deleteFileIfExists,
    getGitDiffOutput: getDiff,
    getInterprettedDiff: getInterprettedDiff,
    getOldAndNewFileVersions: getOldAndNewFileVersions,
    createDiffPairs: createDiffPairs,
    createMergePairs: createMergePairs,
    setUpPairsForDiffDisplay: setUpPairsForDiffDisplay,
    createCopyOfDiffResources: createCopyOfDiffResources,
    createJSONForDisplay: createJSONForDisplay,
    getMergedPairs: getMergedPairs,
    matchMovesEdits: matchMovesEdits
};