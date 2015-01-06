/**
 * Created by Devon Timaeus on 12/16/2014.
 */
var fs = require("fs");
var path = require("path");
var deasync = require("deasync");
var shellTools = require('./shellTools');

function getDiff(repoLocation) {
    // Note: This doesn't work currently, not sure why, but it's here for posterity for now
    var startingLocation = process.cwd();
    var resolvedRepoLocation = path.resolve(repoLocation);
    process.chdir(resolvedRepoLocation);

    var command = 'git --no-pager diff HEAD^';
    var diffOutput = shellTools.shellOut(command);
//    console.log("output of the command is: " + diffOutput);
    process.chdir(startingLocation);
    return diffOutput;
}

module.exports = {
    getDiff: getDiff
};