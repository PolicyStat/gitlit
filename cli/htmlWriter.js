/**
 * Created by John Kulczak on 10/16/2014.
 */
var fs = require("fs");
var html = require('html');
var genericWriter = require('./genericWriter');

function generateFile(directory, outputFile) {
    return genericWriter.generateFile(directory, outputFile, this.writePORObjectToHTMLFile)
}

function getPORObjectFromRepo(currentDir, textHaveParents){
    return genericWriter.getPORObjectFromRepo(currentDir, textHaveParents);
}

function writePORObjectToHTMLFile(porObject, outputFile) {
    var fileString = convertPORRepoObjectToHTMLString(porObject);

    fs.writeFileSync(outputFile, fileString);
    return fileString;
}

function convertPORRepoObjectToHTMLString(porObject) {
    var htmlString =  recursivelyConvertPORObjectToHTML(porObject);
    return html.prettyPrint(htmlString, {indent_size: 2});
}

/**
* Returns a string built from the POR object.
*/
function recursivelyConvertPORObjectToHTML(porObject){

	var fileString = "";

	if ("children" in porObject){
		// if the node is not a leaf (folder)
		if ("tag" in porObject.metadata){
			// Setting up tag
            fileString += convertTagNodeToHTMLString(porObject);
		}else{
			porObject.children.forEach(function(child){
				fileString += recursivelyConvertPORObjectToHTML(child);
			});
		}
	} else {
        fileString += porObject.value;
    }

    return fileString;
}

//This remains here for now for future extensability.
function convertTextNodeToHTMLString(porObject) {
    // if the node is a leaf (text file)
    var objectString = "";
    objectString += porObject.value;
    return objectString;
}

function convertTagNodeToHTMLString(porObject) {
    var emptyTags = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"]
    var objectString = "";
    objectString += extractOpeningTag(porObject);

    // Recursively add children to this string
    porObject.children.forEach(function(child){
        objectString += recursivelyConvertPORObjectToHTML(child);
    });

    // End tag
    if (emptyTags.indexOf(porObject.metadata.tag) == -1) {
        objectString += "</" + porObject.metadata.tag + ">";
    }
    return objectString;
}

function extractOpeningTag(porObject) {
    var objectString = "<" + porObject.metadata.tag;
    porObject.metadata.attributes.forEach(function(attribute) {
        // This is wrong and 'temporary', we need to revise the initial parsing so that we don't make everything strings.
        // TODO: Change repository creation to keep data types
        objectString += ' ' + attribute.name + '="' + attribute.value + '"';
    });
    objectString += ">";
    return objectString;
}

//no html
function getPreviousFileVersions(repoLocation) {
    return genericWriter.getPreviousFileVersions(repoLocation);
}



module.exports = {
    generateFile: generateFile,
    writePORObjectToHTMLFile : writePORObjectToHTMLFile,
    convertTagNodeToHTMLString: convertTagNodeToHTMLString,
    convertTextNodeToHTMLString: convertTextNodeToHTMLString,
    convertPORObjectToHTMLString : convertPORRepoObjectToHTMLString,
    getPORObjectFromRepo : getPORObjectFromRepo,
    extractOpeningTag: extractOpeningTag,
    getPreviousFileVersions: getPreviousFileVersions
};
