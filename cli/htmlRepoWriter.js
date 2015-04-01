/**
 * Created by Devon Timaeus on 10/10/2014.
 */
var htmlParser = require("./htmlParser");
var writer = require("./genericRepoWriter");


 
function writeRepoToDirectory(porObject, outputPath) {
    writer.writeRepoToDirectory(porObject, outputPath);
}

//I should have stuck with my original intention to just rename this file,
//The only thing in the entire set of code that actually requires htmlParser is the
//directory name generator. 
function writeCommitToDirectory(porObject, outputPath, commitMessage){
    writer.writeCommitToDirectory(porObject, outputPath, commitMessage, htmlParser.generateNewPORID);
}

module.exports = {
    writeRepoToDirectory: writeRepoToDirectory,
    writeCommitToDirectory: writeCommitToDirectory
};