/**
 * Created by Devon Timaeus on 9/30/2014.
 */
var fs = require('fs');
var path = require('path');
var parser = require('./htmlParser');
var fileWriter = require('./htmlWriter');
var repoWriter = require('./htmlRepoWriter');
var diffParser = require('./diffParser');
var merger = require('./merge');
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

/*
 * Get the file before and after the most recent commit
 */
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

/*
 * Get the interpreted output of 'git diff' that tells in more detail just what happened
 */
function getInterpretedDiff(repoLocation) {
    var diffObjects = getDiff(repoLocation);
    return diffParser.resolveComplexChanges(diffObjects);
}

/*
 * Get the output of 'git diff' as objects for each individual file that changed.
 */
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

/*
 * Create pairs for the file that have had the attributes cleared out for rendering in-browser
 */
function createDiffPairs(oldVersion, newVersion, contentChanges) {
    // Get the body of the document before and after the changes
    var oldBody = diffParser.extractBodyObject(oldVersion);
    var newBody = diffParser.extractBodyObject(newVersion);

    // Remove any attributes in the object, as that could cause rendering problems for the diff
    var diffCleanOldBody = diffParser.cleanGitlitObjectForDiff(oldBody);
    var diffCleanNewBody = diffParser.cleanGitlitObjectForDiff(newBody);

    // Mark the objects in the bodies that are to be displayed with the diff objects that show they have changed
    var markedOld = diffParser.markBodyForDiff(diffCleanOldBody, contentChanges);
    var markedNew = diffParser.markBodyForDiff(diffCleanNewBody, contentChanges);

    // Flatten the gitlit object into a list of the elements in the order they should be be displayed.
    var linearizedOld = diffParser.flattenGitlitObject(markedOld);
    var linearizedNew = diffParser.flattenGitlitObject(markedNew);

    //Pair up the flatten objects so that there are 'rows' of what should be side-by-side
    return diffParser.pairUpRows(linearizedOld, linearizedNew);
}

/*
 * Create pairs that retain their attributes for the final merge the creates a new document
 */
function createMergePairs(oldVersion, newVersion, contentChanges) {
    // Get the body of the document before and after the changes
    var oldBody = diffParser.extractBodyObject(oldVersion);
    var newBody = diffParser.extractBodyObject(newVersion);

    // Mark the objects in the bodies that are to be displayed with the diff objects that show they have changed
    var markedOld = diffParser.markBodyForDiff(oldBody, contentChanges);
    var markedNew = diffParser.markBodyForDiff(newBody, contentChanges);

    // Flatten the gitlit object into a list of the elements in the order they should be be displayed so that they
    // can be matched up to what should be in each row.
    var linearizedOld = diffParser.flattenGitlitObject(markedOld);
    var linearizedNew = diffParser.flattenGitlitObject(markedNew);

    //Pair up the flatten objects so that there are 'rows' of what should be side-by-side
    return diffParser.pairUpRows(linearizedOld, linearizedNew);
}

function setUpPairsForDiffDisplay(pairs) {
    //Mark the row numbers that the object should fall in when rendered
    var numberedPairs = diffParser.markRowNumbersOnPairs(pairs);

    //Split the pairs back into separate, flattened bodies so they may be rendered
    var splitBodies = diffParser.splitPairsIntoBodies(numberedPairs);

    //Given the flattened bodies, reconstruct the tree structure the documents originally had
    var oldDocObject = diffParser.convertToDiffDisplayDocObject(splitBodies.oldBody).docObject;
    var newDocObject = diffParser.convertToDiffDisplayDocObject(splitBodies.newBody).docObject;

    //Convert the gitlit document objects into HTML that can be rendered for diffs
    var oldHTMLString = html.prettyPrint(diffParser.convertToDiffSafeHTMLString(oldDocObject), {indent_size: 2});
    var newHTMLString = html.prettyPrint(diffParser.convertToDiffSafeHTMLString(newDocObject), {indent_size: 2});

    return {left: oldHTMLString, right:newHTMLString};
}

/*
 * Label the pairs so that each actual change only gets one button
 */
function labelUniqueMovesAndEdits(pairs) {
    diffParser.labelUniqueMovesAndEdits(pairs);
}

/*
 * Copy the resources that actually render the diff into a directory for the user
 */
function createCopyOfDiffResources(outputLocation) {
    wrench.copyDirSyncRecursive(path.join(path.resolve(__dirname), 'diffResources'), path.resolve(outputLocation));
}

/*
 * Fill in the contents of the file that will be used for the client-side rendering of the diffs
 */
function createJSONForDisplay(outputLocation, diffObject, mergePairs, mergeFileVersion) {
    var fileContents = 'var diffDisplayInfo = ' + JSON.stringify(diffObject);
    fileContents += ";\n";
    fileContents += "var mergePairs = " + JSON.stringify(mergePairs);
    fileContents += ";\n";
    fileContents += "var mergeFile = " + JSON.stringify(mergeFileVersion) + ";";
    fs.writeFileSync(path.join(outputLocation, "diffDisplayObject.js"), fileContents, "utf8");
}

function mergeDocument(mergefile, outputLocation){
    try {
        if(!fs.existsSync(mergefile)) {
            throw new URIError("merge-file does not exist at location: " + mergefile);
        }
        //Read the decision file and get out the data we care about
        var jsonString = fs.readFileSync(mergefile, 'utf8');
        var mergeJson = JSON.parse(jsonString);
        var decisions = mergeJson.selections;
        var mergePairs = mergeJson.mergePairs;
        var mergeFile = mergeJson.mergeFile;

        // Merge the pairs together into a single set of flattened nodes
        var mergedPairs = merger.applyDecisionsToMergePairs(decisions, mergePairs);
        //Reconstruct the gitlit document object out of the flattened object
        var mergedDocObject = merger.convertToMergedDocObject(mergedPairs).docObject;
        //Take the gitlit document object and put it into the rest of the HTML document object that
        //contains the head and other info in the document that was not renderable.
        var writeReadyDocObject = merger.insertBodyIntoDocObject(mergedDocObject, mergeFile);
        //Output the file
        fileWriter.writeGitlitObjectToHTMLFile(writeReadyDocObject, path.resolve(outputLocation));
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
    getInterpretedDiff: getInterpretedDiff,
    getOldAndNewFileVersions: getOldAndNewFileVersions,
    createDiffPairs: createDiffPairs,
    createMergePairs: createMergePairs,
    setUpPairsForDiffDisplay: setUpPairsForDiffDisplay,
    createCopyOfDiffResources: createCopyOfDiffResources,
    createJSONForDisplay: createJSONForDisplay,
    mergeDocument: mergeDocument,
    labelUniqueMovesAndEdits: labelUniqueMovesAndEdits
};