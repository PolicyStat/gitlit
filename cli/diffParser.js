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

    var command = "git --no-pager diff HEAD HEAD^ > patch_file";
    console.log(command);
    var other = shellTools.shellOut(command);
    other = require('simple-git')().diff('HEAD^ HEAD');
    console.log("Other: " + other);
    var patchFileLocation = path.join(resolvedRepoLocation, 'patch_file');
    console.log("patchFileLocation: " + patchFileLocation);
    var diffOutput = fs.readFileSync(patchFileLocation, 'utf-8');
//    fs.unlinkSync(patchFileLocation);
    var otherOutput = shellTools.shellOut("git log");
    console.log(diffOutput);
    console.log(otherOutput);
    process.chdir(startingLocation);
    return diffOutput;
}

module.exports = {
    getDiff: getDiff
};