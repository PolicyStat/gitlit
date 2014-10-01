/**
 * Created by Devon Timaeus on 9/24/2014.
 */
var init = require("./repoInit");
var program = require("commander");

program._name = 'psychic-octo-robot';

program
    .version('0.0.1')
    .option('-v, --versionFull', 'Print out all the version info for the CLI')
    .option('-l, --libraries', 'Print out the versions of the libraries used');

program
    .command('init <file>')
    .description('Initialize a Repository for the given file')
    .action(function(file) {
        init.initializeRepository(file);
    });

if (process.argv.length == 2){
    // This should only happen if no arguments are provided, since the command would be:
    // node /path/to/script/psychic-octo-robot.js
    // The fact there were only 2 args mean that there was nothing other than this in the
    // command, so we should print out the help
    console.log("No arguments provided");
    program.help();
}

program.parse(process.argv);
if (program.versionFull) {
    console.log("psychic-octo-robot: "   + program._version);
    console.log("browserify: "          + "5.11.2");
    console.log("js-git: "              + "0.7.7");
    console.log("commander.js: "        + "2.3.0");
} else if (program.libraries && !program.versionFull) {
    console.log("browserify: "          + "5.11.2");
    console.log("js-git: "              + "0.7.7");
    console.log("commander.js: "        + "2.3.0");
}