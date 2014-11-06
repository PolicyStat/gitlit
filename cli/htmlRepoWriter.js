/**
 * Created by Devon Timaeus on 10/10/2014.
 */

var fs = require("fs");

var modes = require('js-git/lib/modes');
var repo = {};
var treeHash = {};
require('js-git/mixins/mem-db')(repo);
require('js-git/mixins/create-tree')(repo);

/*
 TODO: Change to using async file and directory creation, but for now, this makes the logic easier to track
 */

function writeRepoToDirectory(porObject, path) {
    var repoOutputPath = path + "/" + porObject['repoName'];

    try {
        fs.mkdirSync(repoOutputPath);
    } finally {
        // Initialize the repo
        treeHash = repo.createTree({
            dirName: {
                mode: modes.tree}});

        recursivelyBuildRepoDirectory(porObject, repoOutputPath, 0);
        gitRepoCreation(path + porObject['repoName']);
    }
}

function writeCommitToDirectory(porObject, path, commitMessage){
    var repoOutputPath = path + "/" + porObject['repoName'];

    try {
        fs.mkdirSync(repoOutputPath);
    } finally {
        // Initialize the repo
        treeHash = repo.createTree({
            dirName: {
                mode: modes.tree}
            });
        prepareRepo(path, porObject['repoName']);
        recursivelyBuildRepoDirectory(porObject, repoOutputPath, 0);
        gitCommit(path + porObject['repoName'], commitMessage);
    }
}

function prepareRepo(path, repoName){
    var command = '';

    command += 'cd ' + path + ' && ';
    command += 'mv ' + repoName + '/.git ./' + ' && ';
    command += 'rm -rf ' + repoName + '/*' + ' && ';
    command += 'mv ./.git ./' + repoName + ' && '; 
    command += 'rm -rf ./.git';

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

    message = commitMessage || 'repo initialized';

    command += 'cd ' + repoPath + ' && ';
    command += 'git add -A *' + ' && ';
    command += 'git commit -m \"' + message + ' \"';

    shellOut(command);
}

function shellOut(command){    var asyncblock = require('asyncblock');
    var exec = require('child_process').exec;
    var child;

    asyncblock(function(flow){
        exec(command,
            function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                if (error !== null) {
                     console.log('exec error: ' + error);
                }
            },
            flow.add('flag')
        );
        flow.wait('flag');
    });
}


function recursivelyBuildRepoDirectory(porObject, outputPath) {
    var changes;
    if (porObject.children) {
        var id = "";
        if (porObject.porID) {
            id = porObject.porID;
        }
        var newDirectory = outputPath + "/" + id;
        if (newDirectory != outputPath + "/") {
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

        // Create a new blob for this file and add it to the repo tree
        changes = [
            {
                path: newDirectory + "/" + "metadata.json",
                mode: modes.file,
                content: metadataJSON
            }
        ];

        changes.base = treeHash;
        treeHash = repo.createTree(changes);

    } else {
        var filepath = outputPath + "/" + porObject.porID + ".txt";
        fs.writeFileSync(filepath, porObject.value);
        // Create a new blob for this file and add it to the repo tree
        changes = [
            {
                path: filepath,
                mode: modes.file,
                content: porObject.value
            }
        ];

        changes.base = treeHash;
        treeHash = repo.createTree(changes);
    }
}

module.exports = {
    writeRepoToDirectory: writeRepoToDirectory,
    writeCommitToDirectory: writeCommitToDirectory
};