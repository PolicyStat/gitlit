var fs = require("fs");
var html = require('html');
var shellTools = require('./shellTools');

function generateFile(directory, outputFile, writePORObject) {
	if (!fs.existsSync(directory)) {
        throw new URIError(directory + ' is not a directory');
    }
    var porRepo = getPORObjectFromRepo(directory, false);
    return writePORObject(porRepo, outputFile);
}

/**
* Returns a POR object of the repo.
*/
function getPORObjectFromRepo(currentDir, textHaveParents){

	var metadataLocation = currentDir + "/metadata.json";
	var metadata = JSON.parse(fs.readFileSync(metadataLocation));
    var objectId = currentDir.replace(/^.*[\\\/]/, '');

    var porObject = {
        porID: objectId,
        metadata: metadata,
        children: []
    };

    // Recursively builds the por object from the construction order.
    metadata.constructionOrder.forEach(function(id) {
        var path = currentDir + "/" + id;
        if (fs.existsSync(path)) {
            // For directories.
            if (fs.lstatSync(path).isDirectory()){
                porObject.children.push(getPORObjectFromRepo(path, textHaveParents));
            }
        } else {
            // For files, currently only text are used.
            var fileLoc = path + ".txt";
            if (fs.lstatSync(fileLoc).isFile() && fs.existsSync(fileLoc)){
                var textValue = {
                    value: fs.readFileSync(fileLoc, "utf-8"),
                    porID: fileLoc.replace(/^.*[\\\/]/, '').split('.')[0]
                };
                if(textHaveParents) {
                    textValue.parent = objectId;
                }
                porObject.children.push(textValue);
            }
        }
    });

    return porObject;
}

function getPreviousFileVersions(repoLocation) {
    shellTools.checkoutToCommit(repoLocation, 'HEAD^');
    var oldObject = getPORObjectFromRepo(repoLocation, true);

    shellTools.checkoutToCommit(repoLocation, 'master');
    var newObject = getPORObjectFromRepo(repoLocation, true);

    return [oldObject, newObject];
}

module.exports = {
	generateFile: generateFile,
	getPORObjectFromRepo: getPORObjectFromRepo,
	getPreviousFileVersions: getPreviousFileVersions
};