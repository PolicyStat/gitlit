/**
 * Created by Devon Timaeus on 10/1/2014.
 *
 * Updated by John Kulczak on 10/2/2014.
 */

var Parser = require('parse5').Parser;
var parser = new Parser();
var porKeys = [];

function parseHTML(fileContents, repoName) {
    var dom = parser.parse(fileContents);
    porKeys = checkPORIds(dom);
    return parseHTMLToWritableRepo(dom, repoName);
}

function checkPORIds(dom) {
    var foundIDs = [];
    var elementStack = [];
    elementStack.push(dom);
    while (elementStack.length > 0) {
        var domElement = elementStack.pop();
        if (domElement.attrs) {
            for (var attributeIndex = 0; attributeIndex < domElement.attrs.length; ++attributeIndex) {
                if (domElement.attrs[attributeIndex].name == 'por-id' || domElement.attrs[attributeIndex].name == 'id') {
                    var id = domElement.attrs[attributeIndex].value;
                    if (foundIDs.indexOf(id) == -1) {
                        foundIDs.push(id);
                        break;
                    } else {
                        // Found a duplicate id, so we will want to let the user know that there is some problem, and error
                        throw new ReferenceError("Multiple elements have the same psychic-octo-robot or HTML id attribute." +
                                                 "\nAction canceled to prevent possible unexpected behavior\n" +
                                                 "Duplicate Key: " + id);
                    }
                }
            }
        }
        if (typeof domElement.childNodes != "undefined") {
            for (var childIndex = 0; childIndex < domElement.childNodes.length; ++childIndex) {
                elementStack.push(domElement.childNodes[childIndex]);
            }
        }
    }
    return foundIDs;
}

function parseHTMLToWritableRepo(dom, repoName) {
    if (dom.nodeName == '#document') {
        /*
         We are at the top-most layer, so we need to make the top-most directory
         and then go through and add the files to it.
         */
        var children = parseChildrenNodes(dom, false);

        return {
            repoName: repoName,
            children: children
        };
    } else {
        // There was some problem parsing, as the top-level should be the #document
        throw new TypeError("Error in parsing file: top-level #document not created");
    }

}

function generateNewPORID(porKeys){
    var token = require('crypto').randomBytes(12).toString("hex");

    while (porKeys.indexOf(token) != -1) {
        token = require('crypto').randomBytes(12).toString("hex");
    }
    return token;
}


function parseChildrenNodes(dom, inPre) {
    var children = [];
    var contents = null;
    for (var childIndex = 0; childIndex < dom.childNodes.length; ++childIndex) {
        if (typeof dom.childNodes[childIndex].tagName == 'undefined') {
            contents = processTaglessChild(dom.childNodes[childIndex], inPre);
            if (contents[0] != null) {
                children.push({ value: contents[0],
                                porID: contents[1]
                              });
            }
        } else if (dom.childNodes[childIndex].tagName == 'por-text') {
            contents = processCustomTaggedChild(dom.childNodes[childIndex], inPre);
            if (context != null) {
                children.push(contents);
            }
        }
        else {
            children.push(processTaggedChild(dom.childNodes[childIndex], inPre));
        }
    }
    return children
}

function processTaggedChild(dom, inPre) {
    var id = null;
    var tag = dom.tagName;
    var attributes = null;

    if (typeof dom.attrs != 'undefined') {
        attributes = dom.attrs;
    }

    var idIndex = null;
    for (var attributeIndex = 0; attributeIndex < attributes.length; ++attributeIndex) {
        if (attributes[attributeIndex].name == 'por-id'){
            idIndex = attributeIndex;
            break;
        }
        if (attributes[attributeIndex].name == 'id'){
            idIndex = attributeIndex;
        }
    }

    if (idIndex != null) {
        id = attributes[idIndex].value;
    }

    if (id == null) {
        id = generateNewPORID(porKeys);
        attributes.push({name: 'por-id', value: id});
    }

    var children = parseChildrenNodes(dom, tag == 'pre' || inPre);

    var metaFileJson = {
        tag: tag,
        attributes: attributes
    };

    return  {
        porID: id,
        metadata: metaFileJson,
        children: children
    };
}

function processTaglessChild(dom, inPre) {
    /*
     If we don't have a tag, then there is more to be done here, as
     we might be in a text node (a node that has raw text that was in
     the parent node), or something else. Otherwise, since we have the
     tag, we can just process the children and move on.
     */
    var contents = null;
    var id = null;
    if (dom.nodeName == "#text") {
        /*
         This means that we are in a node that is just a representation
         of raw text that was in the parent node, so we just need to make
         a file for this and put the contents in it.
         */
        contents = dom.value;
        id = generateNewPORID(porKeys);

        if (/[\"\&\<\>]/.test(contents)){
            throw new Error("Reserved character detected, could be do to an unclosed tag.");
        }

    } else if (dom.nodeName == '#documentType') {
        /*
         This means that we've found the opening DOCTYPE tag
         */
        var systemInfo = "";
        var publicInfo = "";
        if (dom.systemId) {
            systemInfo = "\"" + dom.systemId + "\"";
        }
        if (dom.publicId) {
            publicInfo = "PUBLIC " + "\"" + dom.publicId + "\"";
        }
        contents = "<!DOCTYPE " + dom.name + " " + publicInfo + " " + systemInfo +">";
        id = "doctype";
    }

    if (/^\s*$/.test(contents) && !inPre) {
        // If all of the contents are whitespace, and we aren't in a pre tag,
        // strip the whitespace as we don't want to keep track of that
        contents = null;
    }


    return [contents, id];
}

function processCustomTaggedChild(dom) {
    if (dom.tagName != 'por-text' || dom.childNodes.length == 0) {
        return null;
    } else if (dom.childNodes.length > 1){
        /*
         If there is more than one child, then that means at least one is a tagged element, which we don't want.
         */
        throw new SyntaxError("Custom por-text tag had non-text children,\n" +
            "please ensure that only text is inside a por-text node");
    }
    var attributes = null;
    var id = null;

    if (typeof dom.attrs != 'undefined') {
        attributes = dom.attrs;
    }

    var idIndex = null;
    for (var attributeIndex = 0; attributeIndex < attributes.length; ++attributeIndex) {
        if (attributes[attributeIndex].name == 'por-id'){
            idIndex = attributeIndex;
            break;
        }
        if (attributes[attributeIndex].name == 'id'){
            idIndex = attributeIndex;
        }
    }

    if (idIndex != null) {
        id = attributes[idIndex].value;
    }

    var contents;
    if ('value' in dom.childNodes[0]) {
        contents = dom.childNodes[0].value;
    } else {
        throw new SyntaxError("Custom por-text tag had non-text children,\n" +
            "please ensure that only text is inside a por-text node");
    }

    return {   value: contents,
        porID: id
    };
}

module.exports = {
    parseHTML: parseHTML,
    processTaglessChild: processTaglessChild,
    processTaggedChild: processTaggedChild,
    checkPORIds: checkPORIds,
    generateNewPORID: generateNewPORID
};
