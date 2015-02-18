#!/usr/bin/env node
/**
 * Created by Devon Timaeus on 9/24/2014.
 */
var init = require("./repoInit");
var writer = require("./htmlWriter");
var program = require("commander");

function printExtraHelp(){
    console.log('IMPORTANT NOTE:');
    console.log('gitlit uses the parse5 HTML parsing library,\n' + '' +
        'as such, there is undefined behavior if there are missing\n' +
        'opening or closing tags. If undesired behavior occurs,\n' +
        'check your document for missing opening or closing tags.');
}

program._name = 'gitlit';

program
    .version('0.3.1')
    .option('-v, --versionFull', 'Print out all the version info for the CLI')
    .option('-l, --libraries', 'Print out the versions of the libraries used');

program
    .command('init <file> <outputPath> <repoName>')
    .description('\n\tInitialize a Repository for the given file')
    .action(function(file, outputPath, repoName) {
        init.initializeRepository(file, outputPath, repoName);
        printExtraHelp();
    });

program
    .command('commit <file> <pathToRepository> <commitMessage>')
    .description('\n\tCommit to a Repository with the given file')
    .action(function(file, pathToRepository, commitMessage) {
        init.commitDocument(file, pathToRepository, './', commitMessage);
    });

program
    .command('write <directory> <outputFile>')
    .description('\n\tConvert a Repository into an HTML file')
    .action(function(directory, outputFile) {
        writer.generateFile(directory, outputFile);
    });

program
    .command('diff <repoLocation> <outputLocation>')
    .description('\n\tShow the difference between the last 2 revisions of the repository'
                + '\n\tDestination should be the directory the output should end up')
    .action(function(repoLocation, outputLocation) {
        var fileVersions = init.getOldAndNewFileVersions(repoLocation);
        var mergeFileVersions = init.getOldAndNewFileVersions(repoLocation);
        var changes = init.getInterprettedDiff(repoLocation);
        var diffDisplayPairs = init.createDiffPairs(fileVersions[0], fileVersions[1], changes);
//        console.log(diffDisplayPairs);
        var diffDisplayObject = init.setUpPairsForDiffDisplay(diffDisplayPairs);
        var mergePairs = init.createMergePairs(mergeFileVersions[0], mergeFileVersions[1], changes);
        init.createCopyOfDiffResources(outputLocation);
        init.createJSONForDisplay(outputLocation, diffDisplayObject, mergePairs, mergeFileVersions[1]);
    });

program
    .command('merge <merge-file> <outputLocation')
    .description('\n\tCreate a new version of an HTML file based on the descisions made'
                 + '\n\tvia the Diff interface, and output to the given location')
    .action(function(mergefile, outputLocation){
        init.getMergedPairs(mergefile, outputLocation);
    });

if (process.argv.length == 2){
    // This should only happen if no arguments are provided, since the command would be:
    // The fact there were only 2 args mean that there was nothing other than this in the
    // command, so we should print out the help
    console.log("No arguments provided");
    program.outputHelp();
    printExtraHelp();
}


program.on('--help', function(){
    printExtraHelp();
});

program.parse(process.argv);
if (program.versionFull) {
    console.log("psychic-octo-robot: "   + program._version);
    console.log("browserify: "          + "5.11.2");
    console.log("html: "                + "0.0.7");
    console.log("deasync: "                + "0.0.7");
    console.log("parse5: "                + "1.1.4");
    console.log("commander.js: "        + "2.3.0");
} else if (program.libraries && !program.versionFull) {
    console.log("browserify: "          + "5.11.2");
    console.log("html: "                + "0.0.7");
    console.log("deasync: "                + "0.0.7");
    console.log("parse5: "                + "1.1.4");
    console.log("commander.js: "        + "2.3.0");
}
