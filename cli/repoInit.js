/**
 * Created by Devon Timaeus on 9/30/2014.
 */

var fs = require('fs');
var diffParser = require('./diffParser');
var fileWriter = require('./htmlWriter');
var repoWriter = require('./htmlRepoWriter');
var parser = require('./htmlParser');
var init = require('./genericRepoInit');

function getExtension(filename) {
    return init.getExtension(filename);
}

function getFileContents(file) {
    return init.getFileContents(file, 'html');
}

function initializeRepository(file, outputPath, repoName) {
    init.initializeRepositoryErrorHandling(file, outputPath, repoName, initializeRepositoryContentHandling);
}

function initializeRepositoryContentHandling(file, outputPath, repoName){
    var fileContents = getFileContents(file);
    var porObject = parser.parseHTML(fileContents, repoName);
    repoWriter.writeRepoToDirectory(porObject, outputPath);
}

function commitDocument(file, outputPath, repoName, commitMessage) {
    init.commitDocumentErrorHandling(file, outputPath, repoName, commitMessage, commitDocumentContentHandling);
}

function commitDocumentContentHandling(file, outputPath, repoName, commitMessage){
    var fileContents = getFileContents(file);
    var porObject = parser.parseHTML(fileContents, repoName);
    repoWriter.writeCommitToDirectory(porObject, outputPath, commitMessage);
}

function getDiff(repoLocation) {
    return init.getDiff(repoLocation);
}

function getOldAndNewFileVersions(repoLocation) {
    return init.getOldAndNewFileVersions(repoLocation);
}

function getInterprettedDiff(repoLocation) {
    return init.getInterprettedDiff(repoLocation);
}

function createDiffPairs(oldVersion, newVersion, contentChanges) {
    return createDiffPairs(oldVersion, newVersion, contentChanges);
}

function createMergePairs(oldVersion, newVersion, contentChanges) {
    return createMergePairs(oldVersion, newVersion, contentChanges);
}

// I don't feel okay with trying to extract the html from this, pretty solid as it stands.
function setUpPairsForDiffDisplay(pairs) {
    var numberedPairs = diffParser.markRowNumbersOnPairs(pairs);
    var splitBodies = diffParser.splitPairsIntoBodies(numberedPairs);
    var oldDocObject = diffParser.convertToDiffDisplayDocObject(splitBodies.oldBody).docObject;
    var newDocObject = diffParser.convertToDiffDisplayDocObject(splitBodies.newBody).docObject;
    var oldHTMLString = html.prettyPrint(diffParser.convertToDiffSafeHTMLString(oldDocObject), {indent_size: 2});
    var newHTMLString = html.prettyPrint(diffParser.convertToDiffSafeHTMLString(newDocObject), {indent_size: 2});
    return {left: oldHTMLString, right:newHTMLString};
}

function createCopyOfDiffResources(outputLocation) {
    wrench.copyDirSyncRecursive(path.join(path.resolve(__dirname), 'diffResources'), path.resolve(outputLocation));
}

function createJSONForDisplay(outputLocation, diffObject, mergePairs, mergeFileVersion) {
    createJSONForDisplay(outputLocation, diffObject, mergePairs, mergeFileVersion);
}

//Has HTML sections in it, not confident enough with the diff parser to try to extract.
function getMergedPairs(mergefile, outputLocation){
    init.getMergedPairsGeneric(mergefile, outputLocation, mergeDocHTML);
}

function mergeDocHTML(decisions, mergePairs, mergeFile, outputLocation){
    var mergedPairs = diffParser.applyDecisionsToMergePairs(decisions, mergePairs);
    var mergedDocObject = diffParser.convertToMergedDocObject(mergedPairs).docObject;
    var writeReadyDocObject = diffParser.insertBodyIntoDocObject(mergedDocObject, mergeFile);
    fileWriter.writePORObjectToHTMLFile(writeReadyDocObject, path.resolve(outputLocation));
}

function deleteDirectoryIfExists(pathToDirectory) {
    init.deleteDirectoryIfExists(pathToDirectory);
}

function deleteFileIfExists(pathToFile) {
    init.deleteFileIfExists(pathToFile);
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
    getGitDiffOutput: getInterprettedDiff,
    getInterprettedDiff: getInterprettedDiff,
    getOldAndNewFileVersions: getOldAndNewFileVersions,
    createDiffPairs: createDiffPairs,
    createMergePairs: createMergePairs,
    setUpPairsForDiffDisplay: setUpPairsForDiffDisplay,
    createCopyOfDiffResources: createCopyOfDiffResources,
    createJSONForDisplay: createJSONForDisplay,
    getMergedPairs: getMergedPairs
};