#!/usr/bin/env node
/**
 * Created by Devon Timaeus on 9/24/2014.
 */
var init = require("./repoInit");
var writer = require("./htmlWriter");
var program = require("commander");

// Set commander info that will display during the help
program._name = 'gitlit';

program
    .version('0.5.0')
    .option('-v, --versionFull', 'Print out all the version info for the CLI')
    .option('-l, --libraries', 'Print out the versions of the libraries used');

/*
 * This section set the commands, their signatures, and what they do
 */
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
        // Get the file before and after changes
        var fileVersions = init.getOldAndNewFileVersions(repoLocation);
        var mergeFileVersions = init.getOldAndNewFileVersions(repoLocation);

        // Get the interpreted diff that tells what the differences are in more detail
        var changes = init.getInterpretedDiff(repoLocation);

        //Create pairs that match up what should go side-by-side
        var diffDisplayPairs = init.createDiffPairs(fileVersions[0], fileVersions[1], changes);
        var mergePairs = init.createMergePairs(mergeFileVersions[0], mergeFileVersions[1], changes);

        //Label any moves and edits only once so that only one button appears for each actual change
        init.labelUniqueMovesAndEdits(diffDisplayPairs);
        init.labelUniqueMovesAndEdits(mergePairs);

        // Set up the pairs to be rendered
        var diffDisplayObject = init.setUpPairsForDiffDisplay(diffDisplayPairs);

        //Copy the files that actually allow for viewing of the diff
        init.createCopyOfDiffResources(outputLocation);

        //Create the file that contains the information to be used in the diff rendering
        init.createJSONForDisplay(outputLocation, diffDisplayObject, mergePairs, mergeFileVersions[1]);
    });

program
    .command('merge <mergeFile> <outputLocation>')
    .description('\n\tCreate a new version of an HTML file based on the descisions made'
                 + '\n\tvia the Diff interface, and output to the given location')
    .action(function(mergefile, outputLocation){
        init.mergeDocument(mergefile, outputLocation);
    });

if (process.argv.length == 2){
    // This should only happen if no arguments are provided, since the command would be:
    // The fact there were only 2 args mean that there was nothing other than this in the
    // command, so we should print out the help
    console.log("No arguments provided");
    program.outputHelp();
    printExtraHelp();
}

/*
 * Print the warning about parse5 possibly interpreting bad HTML
 */
function printExtraHelp(){
    console.log('IMPORTANT NOTE:');
    console.log('gitlit uses the parse5 HTML parsing library,\n' + '' +
        'as such, there is undefined behavior if there are missing\n' +
        'opening or closing tags. If undesired behavior occurs,\n' +
        'check your document for missing opening or closing tags.');
}

program.on('--help', function(){
    printExtraHelp();
});

program.parse(process.argv);
if (program.versionFull) {
    console.log("psychic-octo-robot: "   + program._version);
    console.log("browserify: "          + "5.11.2");
    console.log("html: "                + "0.0.7");
    console.log("deasync: "                + "0.0.10");
    console.log("parse5: "                + "1.1.4");
    console.log("commander.js: "        + "2.3.0");
} else if (program.libraries && !program.versionFull) {
    console.log("browserify: "          + "5.11.2");
    console.log("html: "                + "0.0.7");
    console.log("deasync: "                + "0.0.10");
    console.log("parse5: "                + "1.1.4");
    console.log("commander.js: "        + "2.3.0");
}
