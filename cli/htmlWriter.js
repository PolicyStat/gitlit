/**
 * Created by John Kulczak on 10/16/2014.
 */
var fs = require("fs");
var html = require('html');
var shellTools = require('./shellTools');

function generateFile(directory, outputFile) {
	if (!fs.existsSync(directory)) {
        throw new URIError(directory + ' is not a directory');
    }
    var porRepo = getPORObjectFromRepo(directory, false);
    return writePORObjectToHTMLFile(porRepo, outputFile);
}

function writePORObjectToHTMLFile(porObject, outputFile) {
    var fileString = convertPORRepoObjectToHTMLString(porObject);

    fs.writeFileSync(outputFile, fileString);
    return fileString;
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
        if(id.indexOf('.txt') > -1) {
            path = currentDir + "/" + id.slice(0,id.indexOf('.txt'));
        }
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
        fileString += convertTextNodeToHTMLString(porObject);
    }

    return fileString;
}

function convertTextNodeToHTMLString(porObject) {
    // if the node is a leaf (text file)
    var objectString = "";

    //We don't want to tag text nodes, as this might break something that uses the
    //HTML, so just give the text
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
        // This is wrong and temporary, we need to revise the initial parsing so that we don't make everything strings.
        // TODO: Change repository creation to keep data types
        objectString += ' ' + attribute.name + '="' + attribute.value + '"';
    });
    objectString += ">";
    return objectString;
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
    writePORObjectToHTMLFile : writePORObjectToHTMLFile,
    convertTagNodeToHTMLString: convertTagNodeToHTMLString,
    convertTextNodeToHTMLString: convertTextNodeToHTMLString,
    convertPORObjectToHTMLString : convertPORRepoObjectToHTMLString,
    getPORObjectFromRepo : getPORObjectFromRepo,
    extractOpeningTag: extractOpeningTag,
    getPreviousFileVersions: getPreviousFileVersions
};
