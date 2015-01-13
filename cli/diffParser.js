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

function processDiffIntoFileGranules(diff) {
    var pattern = /(diff --git [^\s]* [^\s]*)/g;
    var match;
    var matchIndeces = [];
    var counter = 0;
    while ((match = pattern.exec(diff)) !== null)
    {
        matchIndeces.push(match.index);
        counter++;
    }
    matchIndeces.push(diff.length);

    var diffGranules = [];
    for(var item = 0; item < (matchIndeces.length-1); item++) {
        diffGranules.push(diff.substring(matchIndeces[item], matchIndeces[item+1]));
    }
    return diffGranules;
}

function convertFileGranulesIntoDiffObjects(granules) {
    var granule = granules[0];
    var splitGranule = granule.split("\n");
    console.log(splitGranule);
    var diffHeader = splitGranule[0].split(" ");
    var oldFilePath = diffHeader[2].substring(2,diffHeader[2].length);
    var newFilePath = diffHeader[3].substring(2,diffHeader[3].length);

    console.log("Old: " + oldFilePath);
    console.log("New: " + newFilePath);
}

module.exports = {
    getDiff: getDiff,
    processDiffIntoFileGranules: processDiffIntoFileGranules,
    convertFileGranulesIntoDiffObjects: convertFileGranulesIntoDiffObjects
};