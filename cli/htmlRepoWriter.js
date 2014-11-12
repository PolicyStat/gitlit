/**
 * Created by Devon Timaeus on 10/10/2014.
 */

var fs = require("fs");
var path = require("path");
var deasync = require("deasync");

/*
 TODO: Change to using async file and directory creation, but for now, this makes the logic easier to track
 */
 
function writeRepoToDirectory(porObject, outputPath) {
    var repoOutputPath = path.join(outputPath, porObject['repoName']);
    try {
        fs.mkdirSync(repoOutputPath);
    } finally {
        // Initialize the repo

        recursivelyBuildRepoDirectory(porObject, repoOutputPath);
        gitRepoCreation(repoOutputPath);
    }
}

function writeCommitToDirectory(porObject, outputPath, commitMessage){
    var repoOutputPath = path.join(outputPath, porObject['repoName']);

    try {
        fs.mkdirSync(repoOutputPath);
    } finally {
        // Initialize the repo

        prepareRepo(repoOutputPath, porObject['repoName']);
        recursivelyBuildRepoDirectory(porObject, repoOutputPath);
        gitCommit(repoOutputPath, commitMessage);
    }
}

function prepareRepo(path, repoName){
    var command = '';

    command += 'cd ' + path + ' && ';
    //TODO: We need to come up with some other way to save the
    //git repo info, but for now this works
    command += 'mv ./.git ../tempGit' + ' && ';
    command += 'rm -rf *' + ' && ';
    command += 'mv ../tempGit ./.git && ';
    command += 'rm -rf ../tempGit';

    shellOut(command);
}

function gitRepoCreation(repoPath){
    var command = '';

    command += 'cd ' + repoPath + ' && ';
    command += 'git init ' + ' && ';
    command += 'git add *' + ' && ';
    command += 'git commit -m \" repo initialized \"';

    shellOut(command);
}

function gitCommit(repoPath, commitMessage){
    var command = '';

    var message = commitMessage || 'repo initialized';

    command += 'cd ' + repoPath + ' && ';
    command += 'git add -A *' + ' && ';
    command += 'git commit -m \"' + message + ' \"';

    shellOut(command);
}

function shellOut(command){
    var exec = require('child_process').exec;

    var execSync = deasync(exec);
    execSync(command);

}

function recursivelyBuildRepoDirectory(porObject, outputPath) {
    var changes;
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
                constructionOrder: childrenOrder
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
};