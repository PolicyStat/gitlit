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
        // Create a test commit
        // repo.saveAs("commit", {
        //     author: {
        //         name: "John Kulczak",
        //         email: "j_kulczak@hotmail.com"
        //     },
        //     tree: treeHash,
        //     message: "Test commit\n"
        // });
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
        console.log('point 1');
        prepareRepo(path, porObject['repoName']);
        console.log('point 2');
        recursivelyBuildRepoDirectory(porObject, repoOutputPath, 0);
        console.log('point 3');
        gitCommit(path + porObject['repoName'], commitMessage);
        console.log('point 4');
    }
}

function prepareRepo(path, repoName){
    // I know these function are gross right now, they can be cleaned up /after/ everything works += .
    var cdShell = 'cd ' + path;
    var moveShell = 'mv ' + repoName + '/.git ./';
    var removeShell = 'rm -rf ' + repoName + '/*';
    var replaceShell = 'mv ./.git ./' + repoName; 
    var removeGitShell = 'rm -rf ./.git';

    var command = cdShell + ' && ' + moveShell + ' && ' + removeShell + ' && ' + replaceShell + ' && ' + removeGitShell;

    shellOut(command);
}

function gitRepoCreation(repoPath){
    var cdShell = 'cd ' + repoPath;
    var initShell = 'git init '
    var addAllShell = 'git add *';
    var commitShell = 'git commit -m \" repo initialized \"';

    var command = cdShell + ' && ' + initShell + ' && ' + addAllShell + ' && ' + commitShell;

    shellOut(command);
}

function gitCommit(repoPath, commitMessage){
    var cdShell = 'cd ' + repoPath;
    var addAllShell = 'git add *';
    var commitMessage = commitMessage || 'repo initialized';
    var commitShell = 'git commit -m \"' + commitMessage + ' \"';

    var command = cdShell + ' && ' + addAllShell + ' && ' + commitShell

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