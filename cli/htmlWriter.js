/**
 * Created by John Kulczak on 10/16/2014.
 */
var fs = require("fs");

function initializeFile(directory, outputFile) {
	if (!fs.existsSync(directory)) {
        throw new URIError(file + ' is not a directory');
    }

	var fileLocations = getFileLocations(directory);

	var htmlString = convertToString(fileLocations);

	fs.writeFileSync(outputFile, htmlString);
}

/**
 * Returns a list of file names in the constructed order.
 */
function getFileLocations(currentDir) {

	var fileLocations = [];
	// Push the metadata file onto the array of file names first
	var metadataLocation = currentDir + "/metadata.json";
	fileLocations.push(metadataLocation);
	
	var metadata = JSON.parse(fs.readFileSync(metadataLocation));

	for (var i = 0; i < metadata.constructionOrder.length; i++) {
		var currentObject = currentDir + "/" + metadata.constructionOrder[i];
		// Recurse if it is a directory, otherwise push it onto the array as a .txt file
		if (fs.existsSync(currentObject)) {
			if (fs.lstatSync(currentObject).isDirectory()) {
				fileLocations = fileLocations.concat(getFileLocations(currentObject));
			}
		} else {
			fileLocations.push(currentObject + ".txt");
		}
	}

	// Adds the closing tag
	if (metadata.tag) {
		fileLocations.push("</" + metadata.tag + ">\n");
	}

	return fileLocations;
}

/**
 * Reads the list of file names and writes everything to one long string.
 */
function convertToString(fileLocations) {
	var htmlString = "";

	for (var i = 1; i < fileLocations.length; i++) {
		// If it's a metadata file, include the tag's attributes in it's construction.
		var fileName = fileLocations[i].replace(/^.*[\\\/]/, '');
		if (fileName== "metadata.json") {
			var metadata = JSON.parse(fs.readFileSync(fileLocations[i]));
			htmlString += "<" + metadata.tag;

			metadata.attributes.forEach(function(a) {
				htmlString += ' ' + a.name + '="' + a.value + '"';
			});

			htmlString += ">";

		} else if (fileName.slice(-4) == ".txt") {
			
			file_text = fs.readFileSync(fileLocations[i]);
			if (file_text.slice(0, 10) == "<!DOCTYPE "){
				htmlString += file_text;
			}else{
				htmlString += "<por-text por-id=" + fileName.slice(0, -4) + ">";
				htmlString += file_text;
				htmlString += "</por-text>";
			}
			
		} else {
			htmlString += fileLocations[i];
		}
	}

	return htmlString;
}

// function convertToStringRec(fileLocations){

// 	if (fileLocations.length == 0){
// 		return "";
// 	}

// 	var htmlString = "";

// 	var file = fileLocations.shift();
// 	// console.log(file);
// 	var fileName = file.replace(/^.*[\\\/]/, '');
// 	if (fileName == "metadata.json") {
// 		var metadata = JSON.parse(fs.readFileSync(file));
// 		htmlString += "<" + metadata.tag;

// 		if (metadata.attributes){
// 			metadata.attributes.forEach(function(a) {
// 				htmlString += ' ' + a.name + '="' + a.value + '"';
// 			});
// 		}
// 		htmlString += ">";

// 		htmlString += convertToStringRec(fileLocations);
// 		htmlString += "<" + metadata.tag + ">\n";

// 	} else if (fileName.slice(-4) == ".txt") {
		
// 		file_text = fs.readFileSync(file);
// 		if (file_text.slice(0, 10) == "<!DOCTYPE "){
// 			htmlString += file_text;
// 		}else{
// 			htmlString += "<por-text por-id=" + fileName.slice(0, -4) + ">";
// 			htmlString += file_text;
// 			htmlString += "</por-text>";
// 		}
		
// 		htmlString += convertToStringRec(fileLocations);
// 	}

// 	return htmlString;
// }

module.exports = {
	initializeFile: initializeFile
};
