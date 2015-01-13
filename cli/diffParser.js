/**
 * Created by Devon Timaeus on 12/16/2014.
 */
var fs = require("fs");
var path = require("path");
var deasync = require("deasync");
var shellTools = require('./shellTools');

function getDiff(repoLocation) {
    var startingLocation = process.cwd();
    var resolvedRepoLocation = path.resolve(repoLocation);
    process.chdir(resolvedRepoLocation);

    //The --unified=100000 guaranteed that we are given 100K lines of context.
    //While this sounds insane, it guarantees that for each file's diff, we
    //get the whole file, which will be nice for us when doing the diffing.
    //Furthermore, it seems safe to assume that no one node will have more than
    //100K lines of text, or at least, it shouldn't...
    var command = 'git --no-pager diff --unified=100000 HEAD^';
    var diffOutput = shellTools.shellOut(command);
    process.chdir(startingLocation);
    return diffOutput;
}

function processDiffIntoFileGranules(diff) {
    var pattern = /(diff --git [^\s]* [^\s]*)/g;
    var match;
    var matchIndices = [];
    var counter = 0;
    while ((match = pattern.exec(diff)) !== null)
    {
        matchIndices.push(match.index);
        counter++;
    }
    matchIndices.push(diff.length);

    var diffGranules = [];
    for(var item = 0; item < (matchIndices.length-1); item++) {
        diffGranules.push(diff.substring(matchIndices[item], matchIndices[item+1]));
    }
    return diffGranules;
}

function convertFileGranulesIntoDiffObjects(granules) {
    //TODO: make this operate on all the granules
    var granule = granules[0];
    var splitGranuleObject = splitGranuleIntoHeaderAndBodyObject(granule);

    headerInterpretation(splitGranuleObject.header);

    var fileVersions = getFileVersionsFromBody(splitGranuleObject.body);
    console.log(fileVersions.newFile);

}

function headerInterpretation(header){
    var diffHeaderList = header.split("\n");
    var itemizedHeader = diffHeaderList[0].split(" ");
//    console.log(diffHeaderList);
    var oldFilePath = diffHeaderList[0].split(" ")[2].substring(2,itemizedHeader[2].length);
    var newFilePath = diffHeaderList[0].split(" ")[3].substring(2,itemizedHeader[3].length);
}

function getFileVersionsFromBody(body) {
    var bodyLines = body.split("\n");

    var newFileTemplate = {idSymbol: '+'};
    var oldFileTemplate = {idSymbol: '-'};

    var newFileLines = getFileVersion(bodyLines, newFileTemplate);
    var oldFileLines = getFileVersion(bodyLines, oldFileTemplate);
    return {oldFile: oldFileLines, newFile: newFileLines};
}

function getFileVersion(fileArray, template){
    var fileLines = [];

    for(var line = 0; line < fileArray.length; line++) {
        var lineToAdd = fileArray[line];
        switch(fileArray[line][0]) {
            case ' ':
                fileLines.push(lineToAdd);
                break;
            case template.idSymbol:
                fileLines.push(lineToAdd);
                break;
        }
    }
    return fileLines;
}

function splitGranuleIntoHeaderAndBodyObject(granule) {
    var firstIndex = granule.indexOf("@@") + 2;
    // The +2 is because we are looking for 2 characters
    var secondIndex = firstIndex + (granule.substring(firstIndex, granule.length).indexOf("@@") + 2);
    return {header: granule.substring(0, secondIndex), body: granule.substring(secondIndex, granule.length)};
}

module.exports = {
    getDiff: getDiff,
    processDiffIntoFileGranules: processDiffIntoFileGranules,
    convertFileGranulesIntoDiffObjects: convertFileGranulesIntoDiffObjects
};