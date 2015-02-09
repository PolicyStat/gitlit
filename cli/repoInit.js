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

function getLeftAndRightDiffSides(repoLocation) {
    try {
        if(!fs.existsSync(repoLocation)) {
            throw new URIError("Directory does not exist at location: " + repoLocation);
        }
        var diffObjects = getDiff(repoLocation);
        var contentChanges = diffParser.filterNonContentChanges(diffObjects);

        var fileVersions = fileWriter.getPreviousFileVersions(repoLocation);
        var oldVersion = fileVersions[0];
        var newVersion = fileVersions[1];

        var oldBody = diffParser.extractBodyObject(oldVersion);
        var newBody = diffParser.extractBodyObject(newVersion);

        var diffCleanOldBody = diffParser.cleanGitlitObjectForDiff(oldBody);
        var diffCleanNewBody = diffParser.cleanGitlitObjectForDiff(newBody);

        var markedOld = diffParser.markBodyForDiff(diffCleanOldBody, contentChanges);
        var markedNew = diffParser.markBodyForDiff(diffCleanNewBody, contentChanges);

        var linearizedOld = diffParser.linearizeGitlitObject(markedOld);
        var linearizedNew = diffParser.linearizeGitlitObject(markedNew);

        return diffParser.pairUpRows(linearizedOld, linearizedNew);

    } catch (err) {
        if (err instanceof URIError) {
            console.error(err.message);
        }
    }
}

function setUpPairsForDiffDisplay(pairs) {
    var numberedPairs = diffParser.markRowNumbersOnPairs(pairs);
    var splitBodies = diffParser.splitPairsIntoBodies(numberedPairs);
    var oldDocObject = diffParser.convertToDocObject(splitBodies.oldBody).docObject;
    var newDocObject = diffParser.convertToDocObject(splitBodies.newBody).docObject;
    var oldHTMLString = html.prettyPrint(diffParser.convertToDiffSafeHTMLString(oldDocObject), {indent_size: 2});
    var newHTMLString = html.prettyPrint(diffParser.convertToDiffSafeHTMLString(newDocObject), {indent_size: 2});
//    console.log(oldHTMLString);
//    console.log(newHTMLString);
    return {left: oldHTMLString, right:newHTMLString};
}

function createCopyOfDiffResources(outputLocation) {
    wrench.copyDirSyncRecursive(path.join(path.resolve(__dirname), 'diffResources'), path.resolve(outputLocation));
}

function createJSONForDisplay(outputLocation, diffObject) {
    var fileContents = 'var diffDisplayInfo = ' + JSON.stringify(diffObject);
    fs.writeFileSync(path.join(outputLocation, "diffDisplayObject.js"), fileContents, "utf8");
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
    getLeftAndRightDiffSides: getLeftAndRightDiffSides,
    setUpPairsForDiffDisplay: setUpPairsForDiffDisplay,
    createCopyOfDiffResources: createCopyOfDiffResources,
    createJSONForDisplay: createJSONForDisplay
};