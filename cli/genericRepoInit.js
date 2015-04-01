var path = require('path');
var fs = require('fs');
var diffParser = require('./diffParser');
var shellTools = require('./shellTools');

function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}

function getFileContents(file, type) {
    if (!fs.existsSync(file)) {
        throw new URIError('No file found at: ' + file);
    }

    // We will want to do mimetype detection at some point, but for now, this is fine
    var extension = getExtension(file);
    if (extension.toLowerCase() != type) {
        throw new TypeError('Filetype not ' + type);
    }

    try {
        return fs.readFileSync(file, 'utf8');
    } catch (err) {
        throw new URIError('No file found at: ' + file);
    }
}

function initializeRepositoryErrorHandling(file, outputPath, repoName, contentFunction){
    try {
        if (!fs.existsSync(outputPath)) {
            throw new URIError("Output Path does not exist");
        }
        if (fs.existsSync(outputPath + repoName) || fs.existsSync(outputPath + "/" + repoName)) {
            throw new URIError("Error: A directory already exists at this location with the name " + repoName);
        }
        contentFunction(file, outputPath, repoName);
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

function commitDocumentErrorHandling(file, outputPath, repoName, commitMessage, contentFunction){
    try {
        if (!fs.existsSync(outputPath)) {
            throw new URIError("Output Path does not exist");
        }
        contentFunction(file, outputPath, repoName, commitMessage);
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
    return diffParser.filterNonContentChanges(diffObjects);
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

function createJSONForDisplay(outputLocation, diffObject, mergePairs, mergeFileVersion) {
    var fileContents = 'var diffDisplayInfo = ' + JSON.stringify(diffObject);
    fileContents += ";\n";
    fileContents += "var mergePairs = " + JSON.stringify(mergePairs);
    fileContents += ";\n";
    fileContents += "var mergeFile = " + JSON.stringify(mergeFileVersion) + ";";
    fs.writeFileSync(path.join(outputLocation, "diffDisplayObject.js"), fileContents, "utf8");
}

function getMergedPairsGeneric(mergefile, outputLocation, mergeFunction){
        try {
        if(!fs.existsSync(mergefile)) {
            throw new URIError("merge-file does not exist at location: " + mergefile);
        }
        var jsonString = fs.readFileSync(mergefile, 'utf8');
        var mergeJson = JSON.parse(jsonString);
        var decisions = mergeJson.selections;
        var mergePairs = mergeJson.mergePairs;
        var mergeFile = mergeJson.mergeFile;

        mergeFunction(decisions, mergePairs, mergeFile, outputLocation);
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

module.exports = {
	getExtension: getExtension,
	getFileContents: getFileContents,
	initializeRepositoryErrorHandling: initializeRepositoryErrorHandling,
	commitDocumentErrorHandling: commitDocumentErrorHandling,
	getDiff: getDiff,
	getOldAndNewFileVersions: getOldAndNewFileVersions,
	getInterprettedDiff: getInterprettedDiff,
	createDiffPairs: createDiffPairs,
	createMergePairs: createMergePairs,
	createJSONForDisplay: createJSONForDisplay,
	getMergedPairsGeneric: getMergedPairsGeneric,
	deleteDirectoryIfExists: deleteDirectoryIfExists,
	deleteFileIfExists: deleteFileIfExists
}