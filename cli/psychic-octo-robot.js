/**
 * Created by Devon Timaeus on 9/24/2014.
 */

var program = require("commander");

program
    .version('0.0.1')
    .option('-v, --versionFull', 'Print out all the version info for the CLI')
    .option('-l, --libraries', 'Print out the versions of the libraries used');

program._name = 'psychic-octo-robot';
program.on('version', function(){
    console.log("browserify: "          + "5.11.2");
});

// This just pulls out the first 2 arguments as they should be
// the path to the script as well as the script name itself
var args = process.argv.slice(2);

if (args.length == 0){
    console.log("No arguments provided");
    program.help();
}

program.parse(process.argv);

if (program.versionFull) {
    console.log("psychic-octo-robot: "   + program._version);
    console.log("browserify: "          + "5.11.2");
    console.log("js-git: "              + "0.7.7");
    console.log("commander.js: "        + "2.3.0");
}