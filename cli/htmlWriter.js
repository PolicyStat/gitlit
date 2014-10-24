/**
 * Created by John Kulczak on 10/16/2014.
 */
var fs = require("fs");

function initializeFile(directory, outputFile) {
	if (!fs.existsSync(directory)) {
        throw new URIError(file + ' is not a directory');
    }

	var fileObject = getFileObject(directory, outputFile);

	var htmlString = convertToString(fileObject);

	fs.writeFileSync(outputFile, htmlString);
	return htmlString;
}

/**
 * Returns a list of file names in the constructed order.
 */
function getFileObject(filePath, fileName) {
	var metadataLocation = filePath + "/metadata.json";
	var metadata = JSON.parse(fs.readFileSync(metadataLocation));
	metadata.name = fileName;
	metadata.childNodes = [];

	for (var i = 0; i < metadata.constructionOrder.length; i++) {
		var currentFile = filePath + "/" + metadata.constructionOrder[i];

		// Recurse if it is a directory, otherwise push it onto object's child nodes.

		if (fs.existsSync(currentFile)) {

			if (fs.lstatSync(currentFile).isDirectory()) {

				metadata.childNodes.push(getFileObject(currentFile, metadata.constructionOrder[i]));
			} else {

				metadata.childNodes.push(currentFile);
			}
		} else if (fs.existsSync(currentFile + ".txt")) {

			// Create the text node JSON object and push it.

			var textNode = '{"name":"' + metadata.constructionOrder[i] + '"}';
			textNode = JSON.parse(textNode);
			textNode.text = fs.readFileSync(currentFile + ".txt");

			metadata.childNodes.push(textNode);

		} else {
			throw new URIError('Error writing file ' + currentFile + ' from repository.');
		}
	}

	return metadata;
}

/**
 * Reads the list of file names and writes everything to one long string.
 */
function convertToString(jsonObject) {
	var htmlString = "";
	htmlString += convertJson(jsonObject);

	if (jsonObject.childNodes) {
		for (var i = 0; i < jsonObject.childNodes.length; i++) {
			htmlString += convertToString(jsonObject.childNodes[i]);
		}

		// Throw the closing tags on after the children, unless this node doesn't have a tag.
		if (jsonObject.tag) {
			htmlString += "</" + jsonObject.tag + ">\n";
		}
	} else if (jsonObject.text) {
		return htmlString;
	} else {
		throw new URIError('Error writing file. Unknown JSON object referenced.');
	}

	return htmlString;
}

/**
 * Determine whether the JSON object is a text node or a metadata node,
 *  and delegate to the appropriate converter function.
 */
function convertJson(objNode){
	if (objNode.text) {
		return convertText(objNode);

	} else if (objNode.tag) {
		return convertMeta(objNode);

	} else {
		return "";
	}
}

/**
 * Converts JSON metadata node into a string.
 */
function convertMeta(objNode){
	htmlString = "<" + objNode.tag;

	objNode.attributes.forEach(function(a) {
		htmlString += ' ' + a.name + '="' + a.value + '"';
	});

	htmlString += ">\n";
	return htmlString;
}

/**
 * Converts JSON text node into a string
 */
function convertText(objNode){
	if (objNode.text.slice(0, 10) == "<!DOCTYPE "){
		return objNode.text;
	} else {
		htmlString = "<por-text por-id=" + objNode.name + ">";
		htmlString += objNode.text;
		htmlString += "</por-text>";
		return htmlString;
	}
}


module.exports = {
	initializeFile: initializeFile,
	getFileLocations : getFileLocations,
	convertMeta : convertMeta,
	convertText : convertText
	convertToString: convertToString,
	convertJson: convertJson
};
