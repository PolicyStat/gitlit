/**
 * Created by Devon Timaeus on 9/30/2014.
 */
var fs = require('fs');
var path = require('path');
var parser = require('./htmlParser');
var fileWriter = require('./htmlRepoWriter');
var diffParser = require('./diffParser');
var shellTools = require('./shellTools');

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
        fileWriter.writeRepoToDirectory(porObject, outputPath);
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
        fileWriter.writeCommitToDirectory(porObject, outputPath, commitMessage);
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
        var diffOutput = diffParser.getDiff(repoLocation);
        console.log(diffOutput);
    } catch (err) {
        if (err instanceof URIError) {
            console.error(err.message);
        }
    }
}

function deleteDirectoryIfExists(pathToDirectory) {
    if(fs.existsSync(pathToDirectory)) {
        shellTools.shellOut('rm -rf ' + pathToDirectory);
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
    getDiff: getDiff
};