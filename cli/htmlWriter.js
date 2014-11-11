/**
 * Created by John Kulczak on 10/16/2014.
 */
var fs = require("fs");

function generateFile(directory, outputFile) {
	if (!fs.existsSync(directory)) {
        throw new URIError(file + ' is not a directory');
    }
    var porRepo = getPORObjectFromRepo(directory);

    return writeHTMLFile(porRepo, outputFile);
}

function writeHTMLFile(porObject, outputFile) {
    var fileString = convertPORObjectToHTMLString(porObject);

    fs.writeFileSync(outputFile, fileString);
    return fileString;
}

/**
* Returns a POR object of the repo.
*/
function getPORObjectFromRepo(currentDir){

	var metadataLocation = currentDir + "/metadata.json";
	var metadata = JSON.parse(fs.readFileSync(metadataLocation));

    var porObject = {
        porID: currentDir.replace(/^.*[\\\/]/, ''),
        metadata: metadata,
        children: []
    };

    // Recursively builds the por object from the construction order.
    metadata.constructionOrder.forEach(function(id) {
        var path = currentDir + "/" + id;
        if (fs.existsSync(path)) {
            // For directories.
            if (fs.lstatSync(path).isDirectory()){
                porObject.children.push(getPORObjectFromRepo(path));
            }
        } else {
            // For files, currently only text are used.
            var fileLoc = path + ".txt";
            if (fs.lstatSync(fileLoc).isFile() && fs.existsSync(fileLoc)){
                var textValue = {
                    value: fs.readFileSync(fileLoc, "utf-8"),
                    porID: currentDir.replace(/^.*[\\\/]/, '')
                };
                porObject.children.push(textValue);
            }
        }
    });

    return porObject;
}

/**
* Returns a string built from the POR object.
*/
function convertPORObjectToHTMLString(porObject){

	var fileString = "";

	if ("children" in porObject){
		// if the node is not a leaf (folder)
		if ("tag" in porObject.metadata){
			// Setting up tag
            fileString += convertTagNodeToHTMLString(porObject);
		}else{
			porObject.children.forEach(function(child){
				fileString += convertPORObjectToHTMLString(child);
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
    var porID = porObject.porID;
    if (porID) {
        //TODO: Decide if we want to tag text nodes
        objectString += "<por-text por-id=" + porID + ">";
        objectString += porObject.value;
        objectString += "</por-text>"
    } else {
        // Text of node
        objectString += porObject.value;
    }

    return objectString;
}

function convertTagNodeToHTMLString(porObject) {
    var objectString = "";
    objectString += extractOpeningTag(porObject);

    // Recursively add children to this string
    porObject.children.forEach(function(child){
        objectString += convertPORObjectToHTMLString(child);
    });

    // End tag
    objectString += "</" + porObject.metadata.tag + ">";
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



module.exports = {
    generateFile: generateFile,
    writeHTMLFile : writeHTMLFile,
    convertTagNodeToHTMLString: convertTagNodeToHTMLString,
    convertTextNodeToHTMLString: convertTextNodeToHTMLString,
    convertPORObjectToHTMLString : convertPORObjectToHTMLString,
    getPORObjectFromRepo : getPORObjectFromRepo,
    extractOpeningTag: extractOpeningTag
};
