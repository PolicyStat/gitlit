/**
 * Created by John Kulczak on 10/16/2014.
 */
var fs = require("fs");

function initializeFile(directory, outputFile) {
	if (!fs.existsSync(directory)) {
        throw new URIError(file + ' is not a directory');
    }

	var fileNames = getFileNames(directory);

	var htmlString = convertToString(fileNames);

	fs.writeFileSync(outputFile, htmlString);
}

/**
 * Returns a list of file names in the constructed order.
 */
function getFileNames(currentDir) {
	var files = fs.readdirSync(currentDir);
	var fileNames = [];
	// Push the metadata file onto the array of file names first
	fileNames.push(currentDir + "/" + files[files.length - 1]);
	
	var metadata = JSON.parse(fs.readFileSync(currentDir + "/" + files[files.length - 1]));

	for (var i = 0; i < metadata.constructionOrder.length; i++) {
		var currentFile = currentDir + "/" + metadata.constructionOrder[i];
		// Recurse if it is a directory, otherwise push it onto the array as a .txt file
		if (fs.existsSync(currentFile)) {
			if (fs.lstatSync(currentFile).isDirectory()) {
				fileNames = fileNames.concat(getFileNames(currentFile));
			}
		} else {
			fileNames.push(currentFile + ".txt");
		}
	}

	// Adds the closing tag
	if (metadata.tag) {
		fileNames.push("</" + metadata.tag + ">\n");
	}

	return fileNames;
}

/**
 * Reads the list of file names and writes everything to one long string.
 */
function convertToString(fileNames) {
	var htmlString = "";

	for (var i = 1; i < fileNames.length; i++) {
		// If it's a metadata file, include the tag's attributes in it's construction.
		if (fileNames[i].slice(-5) == ".json") {
			var metadata = JSON.parse(fs.readFileSync(fileNames[i]));
			htmlString += "<" + metadata.tag;

			metadata.attributes.forEach(function(a) {
				htmlString += ' ' + a.name + '="' + a.value + '"';
			});
			htmlString += ">";
		} else if (fileNames[i].slice(-4) == ".txt") {
			
			file_text = fs.readFileSync(fileNames[i]);
			if (file_text.slice(0, 10) == "<!DOCTYPE "){
				htmlString += file_text;
			}else{
				var por_id = fileNames[i].replace(/^.*[\\\/]/, '').slice(0, -4);
				htmlString += "<por-text por-id=" + por_id + ">";
				htmlString += file_text;
				htmlString += "</por-text>";
			}
			
		} else {
			htmlString += fileNames[i];
		}
	}

	return htmlString;
}

module.exports = {
	initializeFile: initializeFile
};
