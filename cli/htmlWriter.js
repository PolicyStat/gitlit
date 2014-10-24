/**
 * Created by John Kulczak on 10/16/2014.
 */
var fs = require("fs");

function initializeFile(directory, outputFile) {
	if (!fs.existsSync(directory)) {
        throw new URIError(file + ' is not a directory');
    }

    var porRepo = getPORRepo(directory);

    var fileString = convertPORToString(porRepo);

	fs.writeFileSync(outputFile, fileString);
}

/**
* Returns a POR object of the repo.
*/
function getPORRepo(currentDir){

	var metadataLocation = currentDir + "/metadata.json";
	var metadata = JSON.parse(fs.readFileSync(metadataLocation));

	var porObject = {
		porID: currentDir.replace(/^.*[\\\/]/, ''),
		metadata: metadata,
		children: []
	}

	// Recursively builds the por object from the construction order.
	metadata.constructionOrder.forEach(function(id) {
    	var path = currentDir + "/" + id;
    	if (fs.existsSync(path)) {
    		// For directories.
	    	if (fs.lstatSync(path).isDirectory()){
	    		porObject.children.push(getPORRepo(path));
	    	}
    	} else {
    		// For files, currently only text are used.
    		var fileLoc = path + ".txt"
    		if (fs.lstatSync(fileLoc).isFile()){
    			var textValue = {
    				value: fs.readFileSync(fileLoc, "utf-8"),
    				porID: currentDir.replace(/^.*[\\\/]/, '')
    			}
    			porObject.children.push(textValue);
    		}
    	}
	});

	return porObject;

}

/**
* Returns a string built from the POR object.
*/
function convertPORToString(porObject){

	var fileString = "";

	if ("children" in porObject){
		// if the node is not a leaf (folder)
		if ("tag" in porObject.metadata){
			// Setting up tag
			fileString += "<" + porObject.metadata.tag;
			porObject.metadata.attributes.forEach(function(attribute) {
				// This is wrong and temporary, we need to revise the initial parsing so that we don't make everything strings.
				fileString += ' ' + attribute.name + '="' + attribute.value + '"';
			});
			fileString += ">\n";

			// Recurse
			porObject.children.forEach(function(child){
				fileString += convertPORToString(child);
			});

			// End tag
			fileString += "</" + porObject.metadata.tag + ">\n";
		}else{
			porObject.children.forEach(function(child){
				fileString += convertPORToString(child);
			});
		}
	} else {
		// if the node is a leaf (text file)
		var porID = porObject.porID;
		if (porID){
			fileString += "<por-text por-id=" + porID + ">";
			fileString += porObject.value;
			fileString += "</por-text>\n"
		} else {
			// Text of node
			fileString += porObject.value;
		}
	}

	return fileString;

}



module.exports = {
	initializeFile: initializeFile
};
