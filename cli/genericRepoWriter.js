var fs = require("fs");
var path = require("path");
var shellTools = require('./shellTools');

/*
 TODO: Change to using async file and directory creation, but for now, this makes the logic easier to track
 */
function writeRepoToDirectory(gitLitObject, outputPath) {
    var repoOutputPath = path.join(outputPath, gitLitObject['repoName']);
    try {
        fs.mkdirSync(repoOutputPath);
    } finally {
        // Initialize the repo

        recursivelyBuildRepoDirectory(gitLitObject, repoOutputPath);
        shellTools.gitRepoCreation(repoOutputPath);
    }
}

function writeCommitToDirectory(porObject, outputPath, commitMessage, directoryNameGeneratorFunction){
    var repoOutputPath = path.join(outputPath, porObject['repoName']);

    try {
        fs.mkdirSync(repoOutputPath);
    } finally {
        // Initialize the repo

        prepareRepoGeneric(repoOutputPath, porObject['repoName'], directoryNameGeneratorFunction);
        recursivelyBuildRepoDirectory(porObject, repoOutputPath);
        shellTools.gitCommit(repoOutputPath, commitMessage);
    }
}

function prepareRepoGeneric(outputPath, repoName, directoryNameGeneratorFunction){
    var command = '';

    var tempDirectoryName = directoryNameGeneratorFunction([]);
    var relPath = path.join(outputPath, '..', tempDirectoryName);
    var absPath = path.resolve(relPath);

    //If we SOMEHOW generate a name that already exists, generate another id and try again
    //Technically, this could run forever, but it won't because the chances of there being
    //A directory for every possible combination of 12 random bytes is absurdly low
    if(fs.existsSync(absPath)) {
        while(fs.existsSync(absPath)) {
            tempDirectoryName = directoryNameGeneratorFunction([]);
            relPath = path.join(outputPath, '..', tempDirectoryName);
            absPath = path.resolve(relPath);
        }
    }

    command += 'cd ' + outputPath + ' && ';
    command += 'mv ./.git ' + absPath + ' && ';
    command += 'rm -rf *' + ' && ';
    command += 'mv ' + absPath + ' ./.git && ';
    command += 'rm -rf ' + absPath;

    shellTools.shellOut(command);
}

function recursivelyBuildRepoDirectory(porObject, outputPath) {
    if (porObject.children) {
        var id = "";
        if (porObject.porID) {
            id = porObject.porID;
        }
        var newDirectory = path.join(outputPath, id);
        if (newDirectory != outputPath) {
            fs.mkdirSync(newDirectory);
        }

        var childrenOrder = [];
        for (var index = 0; index < porObject.children.length; index++) {
            // TODO: Filename to include extension here, or no?
            var childPORID = porObject.children[index].porID ? porObject.children[index].porID : index + ".txt";
            childrenOrder.push(childPORID);
            recursivelyBuildRepoDirectory(porObject.children[index], newDirectory, index);
        }

        var metaFileJson = {};

        if (porObject.metadata) {
            metaFileJson = {
                tag: porObject.metadata.tag,
                attributes: porObject.metadata.attributes,
                constructionOrder: childrenOrder,
                parentID: porObject.parentID
            }
        } else {
            metaFileJson = {
                constructionOrder: childrenOrder
            }
        }

        var metadataJSON = JSON.stringify(metaFileJson);
        fs.writeFileSync(newDirectory + "/" + "metadata.json", metadataJSON, "utf8");

    } else {
        var filepath = outputPath + "/" + porObject.porID + ".txt";
        fs.writeFileSync(filepath, porObject.value);
    }
}

module.exports = {
	writeRepoToDirectory: writeRepoToDirectory,
	writeCommitToDirectory: writeCommitToDirectory
}