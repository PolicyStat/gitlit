/**
 * Created by Devon Timaeus on 12/16/2014.
 */
var fs = require("fs");
var path = require("path");
var deasync = require("deasync");
var shellTools = require('./shellTools');
var htmlWriter = require('./htmlWriter');

function getGitDiffOutput(repoLocation) {
    var startingLocation = process.cwd();
    var resolvedRepoLocation = path.resolve(repoLocation);
    process.chdir(resolvedRepoLocation);

    //The --unified=100000 guaranteed that we are given 100K lines of context.
    //While this sounds insane, it guarantees that for each file's diff, we
    //get the whole file, which will be nice for us when doing the diffing.
    //Furthermore, it seems safe to assume that no one node will have more than
    //100K lines of text, or at least, it shouldn't...
    var command = 'git --no-pager diff -M --unified=100000 HEAD^';
    var diffOutput = shellTools.shellOut(command);
    process.chdir(startingLocation);
    return diffOutput;
}

function processDiffIntoFileGranules(diff) {
    var pattern = /(diff --git [^\s]* [^\s]*)/g;
    var match;
    var matchIndices = [];
    var counter = 0;
    while ((match = pattern.exec(diff)) !== null)
    {
        matchIndices.push(match.index);
        counter++;
    }
    matchIndices.push(diff.length);

    var diffGranules = [];
    for(var item = 0; item < (matchIndices.length-1); item++) {
        diffGranules.push(diff.substring(matchIndices[item], matchIndices[item+1]));
    }
    return diffGranules;
}

function convertFileGranulesIntoDiffObjects(granules) {
    var interprettedGranules = [];
    granules.forEach(function(granule) {
        var splitGranuleObject = splitGranuleIntoHeaderAndBodyObject(granule);
        var header = headerInterpretation(splitGranuleObject.header);
        var fileVersions = getFileVersionsFromBody(splitGranuleObject.body);
        interprettedGranules.push({fileInfo: header, versions:fileVersions});
    });

    var convertedFileVersions = [];
    interprettedGranules.forEach(function(granule) {
        convertedFileVersions.push(convertVersionsToObjects(granule));
    });

    var diffObjects = [];
    for(var index = 0; index < convertedFileVersions.length; index++) {
        var granule = convertedFileVersions[index];
        var diffObject = convertToDiffObject(granule);
        if (diffObject !== null) diffObjects.push(diffObject);
    }
    return diffObjects;
}

function convertToDiffObject(granule) {
    if(granule.fileInfo.changeType == 'added') {
        //new file, whether it is completely new, or just a
        //large edit, doesn't really matter, either way,
        //just trim the info accordingly
        return {changeType: 'added', objectID: granule.fileInfo.newID,
                parent: granule.fileInfo.newParent, content: granule.versions.new};
    } else if(granule.fileInfo.changeType == 'deleted') {
        //file was deleted, again, just trim info to be clean
        return {changeType: 'deleted', objectID: granule.fileInfo.oldID,
            parent: granule.fileInfo.oldParent, content: granule.versions.old};
    } else if(granule.fileInfo.changeType == 'edit') {
        //The file was edited but didn't change otherwise
        //This can only really happen with metadata files
        //that don't get moved, as such, we need to hold
        //to both the old and new versions
        var oldID = null;
        var newID = null;

        if('attributes' in granule.versions.old) {
            granule.versions.old.attributes.forEach(function (attribute) {
                if (attribute.name == 'por-id') {
                    oldID = attribute.value;
                }
            });
        }

        if('attributes' in granule.versions.new) {
            granule.versions.new.attributes.forEach(function (attribute) {
                if (attribute.name == 'por-id') {
                    newID = attribute.value;
                }
            });
        }
        return {changeType: 'edit',
                old:{ID: oldID,
                     parent: granule.versions.old.parentID,
                     content: granule.versions.old},
                new:{ID: newID,
                    parent: granule.versions.new.parentID,
                    content: granule.versions.new}
        };
    } else {
        //There are other cases for renames, but for now, we are fine with
        //just the above cases
        //TODO: Add rename logic at some point.
        return null;
    }
}

function convertVersionsToObjects(granule) {
    var oldNode;
    var newNode;
    if(granule.fileInfo.oldID == 'metadata' || granule.fileInfo.newID == 'metadata') {
        //we're dealing with a metadata file, so we need to actually read the
        //contents of the new and old files as that will tell us more information
        //about what the nodes were before and after
        var oldNodeText = '';
        var newNodeText = '';
        if(granule.versions.oldFile.length > 0) {
            var oldContent = granule.versions.oldFile[0];
            oldNodeText = oldContent.substring(1,oldContent.length);
        }
        if(granule.versions.newFile.length > 0) {
           var newContent = granule.versions.newFile[0];
            newNodeText = newContent.substring(1,newContent.length);
        }

        //We can just references the first element straight away since we
        //make all our json files one line long
        oldNode = oldNodeText == '' ? null : JSON.parse(oldNodeText);
        newNode = newNodeText == '' ? null : JSON.parse(newNodeText);

    } else {
        oldNode = "";
        newNode = "";

        granule.versions.oldFile.forEach(function(line){
            if(oldNode.length > 0) {
                //This means that there have been lines appended already,
                //as such, since these are supposed to be _lines_ of the
                //file, and thus the text node, we should add newlines
                //here as well
                oldNode += '\n';
            }
            oldNode += line.substring(1,line.length);
        });
        granule.versions.newFile.forEach(function(line){
            if(newNode.length > 0) {
                //This means that there have been lines appended already,
                //as such, since these are supposed to be _lines_ of the
                //file, and thus the text node, we should add newlines
                //here as well
                newNode += '\n';
            }
            newNode += line.substring(1,line.length);
        });

    }

    return {fileInfo: granule.fileInfo, versions: {old: oldNode, new: newNode}};
}


function headerInterpretation(header){
    var diffHeaderList = header.split("\n");
    var itemizedHeader = diffHeaderList[0].split(" ");

    var oldFilePath = diffHeaderList[0].split(" ")[2].substring(2,itemizedHeader[2].length);
    var newFilePath = diffHeaderList[0].split(" ")[3].substring(2,itemizedHeader[3].length);

    var changeData = interpretChangeType(diffHeaderList);
    changeData = resolveIdsAndParent(changeData, oldFilePath, newFilePath);

    return changeData;
}

function resolveIdsAndParent(changeData, oldPath, newPath) {
    var splitOld = oldPath.split('/');
    var splitNew = newPath.split('/');

    var oldPathId = splitOld[splitOld.length-1];
    var oldPathParent = null;
    if(splitOld.length != 0) {
        oldPathParent = splitOld[splitOld.length-2];
    }

    var newPathId = splitNew[splitNew.length-1];
    var newPathParent = null;
    if(splitNew.length != 0) {
        newPathParent = splitNew[splitNew.length-2];
    }

    var oldParent = resolveID(oldPathParent, changeData.oldParent);
    var newParent = resolveID(newPathParent, changeData.newParent);
    var oldID = resolveID(oldPathId, changeData.oldID);
    var newID = resolveID(newPathId, changeData.newID);

    return {changeType: changeData.changeType, oldParent:oldParent, newParent:newParent, oldID:oldID, newID:newID};
}

function resolveID(first, mightBeNull) {
    if (mightBeNull == null) {
        if(first == null) {
            //This almost certainly means that the topmost level metadata file
            //was edited, so we should just return null, since there IS no parent
            return null;
        }
        return first.split('.')[0];
    } else if (first == mightBeNull && mightBeNull != null) {
        if (first == 'metadata.json') {
            //We're dealing with a metadata file that describes a tag node, as such, let's just
            //note that it's a metadata file
            return "metadata";
        } else {
            //the id is the just first part before the .txt
            return first.split('.')[0];
        }
    } else {
        throw Error('IDs in diff are not equal when they should be, problem with the diff?')
    }
}

function interpretChangeType(headerLines) {
    var changeType = null;

    /*
        edit, no name change or move - no header match
        rename - rename =
            rename from oldname
            rename to newname
        rename and move - rename
            rename from path/oldname
            rename to differentpath/newname
        rename and/or move and edit small - rename
        rename and/or move and edit big - add/delete
        move - rename
            rename from path/name
            rename to differentpath/name
        brand new - add
        delete - delete
     */
    var changeTypeList = [
        {type: "deleted", pattern: /(deleted file mode)/g},
        {type: "added", pattern: /(new file mode)/g},
        {type: "rename", pattern: /(rename from)/g},
        {type: "rename", pattern: /(rename to)/g}
    ];

    var changeTypeLines = [];

    for (var headerIndex = 0; headerIndex < headerLines.length; headerIndex++) {
        for(var index = 0; index<changeTypeList.length; index++) {
            if (changeTypeList[index].pattern.test(headerLines[headerIndex])) {
                changeTypeLines.push(headerLines[headerIndex]);
                changeType =  changeTypeList[index].type;
            }
        }
    }

    var oldId = null;
    var oldParent = null;
    var newId = null;
    var newParent = null;

    switch (changeType) {
        case "rename":
            var splitRenameFrom = changeTypeLines[0].split('/');
            var splitRenameTo = changeTypeLines[1].split('/');
            oldParent = splitRenameFrom[splitRenameFrom.length-2];
            newParent = splitRenameTo[splitRenameTo.length-2];
            oldId = splitRenameFrom[splitRenameFrom.length-1];
            newId = splitRenameTo[splitRenameTo.length-1];
            break;
        case null:
            //Change type was never set, this means that we are looking at just a normal
            //file edit, so not much else to do
            changeType = 'edit';
    }

    return {changeType:changeType, oldID:oldId, oldParent:oldParent, newID:newId, newParent:newParent};
}

function getFileVersionsFromBody(body) {
    var bodyLines = body.split("\n");

    var newFileTemplate = {idSymbol: '+'};
    var oldFileTemplate = {idSymbol: '-'};

    var newFileLines = getFileVersion(bodyLines, newFileTemplate);
    var oldFileLines = getFileVersion(bodyLines, oldFileTemplate);
    return {oldFile: oldFileLines, newFile: newFileLines};
}

function getFileVersion(fileArray, template){
    var fileLines = [];

    for(var line = 0; line < fileArray.length; line++) {
        var lineToAdd = fileArray[line];
        switch(fileArray[line][0]) {
            case ' ':
                fileLines.push(lineToAdd);
                break;
            case template.idSymbol:
                fileLines.push(lineToAdd);
                break;
        }
    }
    return fileLines;
}

function splitGranuleIntoHeaderAndBodyObject(granule) {
    var firstIndex = granule.indexOf("@@");
    if(firstIndex == -1) {
        //No occurence of @@, so we need to just return the whole thing as the header
        return {header: granule, body: ""};
    } else {
        //Otherwise, need to add 2 since we're looking for 2 characters
        firstIndex += 2;
    }
    // The +2 is because we are looking for 2 characters, the other +1 is for the \n
    var secondIndex = firstIndex + (granule.substring(firstIndex, granule.length).indexOf("@@") + 2) + 1;
    return {header: granule.substring(0, secondIndex), body: granule.substring(secondIndex, granule.length)};
}

function extractBodyObject(gitlitObject) {
    if (gitlitObject.metadata != undefined){
        var metadata = gitlitObject.metadata;
        var tag = metadata.tag;
        if(tag == 'body') {
            return gitlitObject;
        } else {
            var toReturn = null;
            for(var index = 0; index < gitlitObject.children.length; index++) {
                var child = gitlitObject.children[index];
                toReturn = extractBodyObject(child);
                if(toReturn != null) {
                    return toReturn;
                }
            }
        }
    } else {
        return null;
    }

}

function filterNonContentChanges(diffObjects) {
    var toReturn = [];
    diffObjects.forEach(function(diffObject){
        if(diffObject.objectID != 'metadata' && diffObject.objectID != undefined){
            toReturn.push(diffObject);
        }
    });
    return toReturn;
}

function cleanGitlitObjectForDiff(gitlitObject) {
    if(gitlitObject.metadata != undefined) {
        var toReturn = gitlitObject;
        toReturn.metadata.attributes = [];
        var newChildren = [];
        toReturn.children.forEach(function(child){
           newChildren.push(cleanGitlitObjectForDiff(child));
        });
        toReturn.children = newChildren;
        return toReturn;
    } else {
        return gitlitObject;
    }
}

function markBodyForDiff(gitlitObject, diffObjects) {
    var toReturn = gitlitObject;
    diffObjects.forEach(function(diff){
        toReturn = markDiff(toReturn, diff);
    });
    return toReturn;
}

function markDiff(gitlitObject, diff) {
    if(diff.objectID == gitlitObject.porID) {
        gitlitObject.diffMetadata = diff;
        return gitlitObject;
    } else {
        if(gitlitObject.children == undefined) {
            return gitlitObject;
        }
        var toReturn = gitlitObject;
        var newChildren = [];
        toReturn.children.forEach(function(child){
            newChildren.push(markDiff(child, diff));
        });
        toReturn.children = newChildren;
        return toReturn;
    }
}

function linearizeGitlitObject(gitlitObject) {
    var toReturn = [];
    if(gitlitObject.children == undefined) {
        return [gitlitObject];
    } else {
        var linearizedChildren = [];
        gitlitObject.children.forEach(function(child) {
            linearizedChildren = linearizedChildren.concat(linearizeGitlitObject(child))
        });
        var numberOfChildren = gitlitObject.children.length;
        var newObject = gitlitObject;
        newObject.children = numberOfChildren;

        return [newObject].concat(linearizedChildren);
    }
}

function pairUpRows(oldNodes, newNodes) {
    var pairedUpRows = [];
    var oldIndex = 0;
    var newIndex = 0;
    while(oldIndex < oldNodes.length && newIndex < newNodes.length) {
        var leftNode = oldNodes[oldIndex];
        var rightNode = newNodes[newIndex];
        var pairUpResult = pairUp(leftNode, rightNode, oldIndex, newIndex);
        oldIndex = pairUpResult.oldIndex;
        newIndex = pairUpResult.newIndex;
        pairedUpRows.push(pairUpResult.pair);
    }

    for(oldIndex; oldIndex < oldNodes.length; oldIndex++) {
        pairedUpRows.push(pairUp(oldNodes[oldIndex], {}, 0,0).pair);
    }

    for(newIndex; newIndex < newNodes.length; newIndex++) {
        pairedUpRows.push(pairUp({}, newNodes[newIndex], 0,0).pair);
    }

    return pairedUpRows
}

function pairUp(left, right, oldIndex, newIndex) {
    var toReturn = {pair: {left: null,
                           right:null},
                    oldIndex: oldIndex,
                    newIndex: newIndex
                    };

    if(left==null && right != null) {
        toReturn.newIndex += 1;
        toReturn.pair = {left: null, right: right};
        return toReturn;
    } else if (right==null && left != null){
        toReturn.oldIndex += 1;
        toReturn.pair = {left: left, right: null};
        return toReturn;
    }

    if(left.diffMetadata == undefined && right.diffMetadata == undefined) {
        toReturn.oldIndex += 1;
        toReturn.newIndex += 1;
        toReturn.pair = {left: left, right: right};
        return toReturn;
    } else if (left.diffMetadata != undefined) {
        /*
        for right now, we aren't tracking metadata/tag/attribute changes, so
        this can ONLY be a delete, so we can just pair it up with nothing and move on
         */
        toReturn.oldIndex += 1;
        toReturn.pair = {left: left, right: null};
        return toReturn;
    } else {
        /*
        This can only be new sections for now, since we don't do text-level edits, or
        tag-level edits.
         */
        toReturn.newIndex += 1;
        toReturn.pair = {left: null, right: right};
        return toReturn;
    }
}

function markRowNumbersOnPairs(pairs) {
    var row = 0;
    pairs.forEach(function(pair) {
        assignRow(pair, row);
        row++;
    });
    return pairs;
}

function assignRow(pair, row) {
    if(pair.left != null) {
        if(pair.left.metadata != undefined) {
            pair.left.metadata.attributes = [
                {name: 'class', value: row.toString()}
            ]
        } else {
            pair.left.row = row.toString();
        }
    }
    if(pair.right != null) {
        if(pair.right.metadata != undefined) {
            pair.right.metadata.attributes = [
                {name: 'class', value: row.toString()}
            ]
        } else {
            pair.right.row = row.toString();
        }
    }
}

function splitPairsIntoBodies(pairs) {
    var oldBody = [];
    var newBody = [];
    pairs.forEach(function(pair){
        pair.left  != null ? oldBody.push(pair.left)  : oldBody.push(emptyNode(pair.right.row, pair.right.porID, pair.right.parent));
        pair.right != null ? newBody.push(pair.right) : newBody.push(emptyNode(pair.left.row, pair.left.porID, pair.left.parent));
    });
    return {oldBody: oldBody, newBody: newBody};
}

function emptyNode(row, id, parent) {
    return {value: '',
            porID: id,
            row: row,
            parent: parent}
}

function convertToDiffDisplayDocObject(nodeList){
    var firstNode = nodeList[0];
    if(firstNode.children != undefined) {
        var childrenList = [];
        var restOfList = nodeList.slice(1, nodeList.length);
        for(var childrenFound = 0; childrenFound < firstNode.children; childrenFound++){
            var resultObject = convertToDiffDisplayDocObject(restOfList);
            restOfList = resultObject.restOfList;
            childrenList.push(resultObject.docObject);
        }
        while(restOfList.length > 0 && restOfList[0].parent == firstNode.porID) {
            resultObject = convertToDiffDisplayDocObject(restOfList);
            restOfList = resultObject.restOfList;
            childrenList.push(resultObject.docObject);
        }
        firstNode.children = childrenList;
        return {docObject: firstNode, restOfList: restOfList}
    } else {
        //This means it's a text node, so we need to wrap it in a
        //span for proper displaying and then return it
        return {docObject: wrapForDisplay(firstNode), restOfList: nodeList.slice(1, nodeList.length)};
    }
}

function convertToMergedDocObject(nodeList){
    var firstNode = nodeList[0];
    var restOfList = nodeList.slice(1, nodeList.length);
    if(firstNode.ignoreInChildCounting != undefined) {
        //This means there was a row that we made a decision about, and
        //The parent isn't expecting it, so we need to somehow tell the parent
        //not to count this
        return {docObject: firstNode.ignoreInChildCounting, restOfList: restOfList, ignoreInChildCounting:true};
    }
    if(firstNode.children != undefined) {
        var childrenList = [];
        for(var childrenFound = 0; childrenFound < firstNode.children; childrenFound++){
            var resultObject = convertToMergedDocObject(restOfList);
            if(resultObject.ignoreInChildCounting != undefined) {
                //This means we should not count this child while
                //adding them, so just decrement childrenFound to make this true
                childrenFound--;
            }
            restOfList = resultObject.restOfList;
            childrenList.push(resultObject.docObject);
        }
        while(restOfList.length > 0 && restOfList[0].parent == firstNode.porID) {
            resultObject = convertToMergedDocObject(restOfList);
            restOfList = resultObject.restOfList;
            childrenList.push(resultObject.docObject);
        }
        var constructionOrder = [];
        childrenList.forEach(function(child) {
            constructionOrder.push(child.porID);
        });
        firstNode.children = childrenList;
        firstNode.metadata.constructionOrder = constructionOrder;
        return {docObject: firstNode, restOfList: restOfList}
    } else {
        //This means it's a text node, so we need to wrap it in a
        //span for proper displaying and then return it
        return {docObject: firstNode, restOfList: restOfList};
    }
}

function wrapForDisplay(textNode) {
    var attributes = [{name: "class", value:textNode.row}];
    if(textNode.diffMetadata != undefined) {
        attributes = [{name: "class",
                         value: textNode.row.toString() + ' ' + (textNode.diffMetadata.changeType == 'added' ? "ins" : "del")}];
    }

    return {porID: textNode.porID,
            metadata: {tag: 'span',
                       attributes: attributes,
                       constructionOrder: [textNode.porID]},
            children: [{value: textNode.value,
                       podID: textNode.porID}]
            };
}

function convertToDiffSafeHTMLString(docObject) {
    if(docObject.metadata != undefined) {
        //We have a tag node
        return convertTagNodeToHTMLString(docObject);

    } else {
        //non-tag node, just need to hand back the content
        //with ins/del tags as necessary
        var htmlContent = '';
        var possibleEndTag = '';
        if(docObject.diffMetadata != undefined) {
            switch(docObject.diffMetadata.changeType){
                case 'added':
                    htmlContent += '<ins>';
                    possibleEndTag  = '</ins>';
                    break;
                case 'deleted':
                    htmlContent += '<del>';
                    possibleEndTag  = '</del>';
                    break;
            }
        }
        return htmlContent + docObject.value + possibleEndTag;
    }
}

function convertTagNodeToHTMLString(docObject) {
    var emptyTags = ["area", "base", "br", "col", "command", "embed", "hr", "img",
                    "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];
    var objectString = "";
    objectString += htmlWriter.extractOpeningTag(docObject);

    // Recursively add children to this string
    docObject.children.forEach(function(child){
        objectString += convertToDiffSafeHTMLString(child);
    });


    // End tag
    if (emptyTags.indexOf(docObject.metadata.tag) == -1) {
        objectString += "</" + docObject.metadata.tag + ">";
    }
    return objectString;
}

function applyDecisionsToMergePairs(decisions, pairs) {
    var mergedPairs = [];
    for(var row = 0; row < pairs.length; row++){
        var left = pairs[row].left;
        var right = pairs[row].right;
        var parent = null;
        if(left == null && right != null) {
            parent = right.parent != undefined ? right.parent : right.metadata.parentID;
            left = emptyNode(0,"",parent)
        } else if (right == null && left != null) {
            parent = left.parent != undefined ? left.parent : left.metadata.parentID;
            right = emptyNode(0,"",parent)
        }
        if(decisions[row] != undefined) {
            switch(decisions[row]){
                case 'keep':
                    mergedPairs.push(right);
                    break;
                case 'revert':
                    if(right == null) {
                        mergedPairs.push({ignoreInChildCounting: left});
                    } else {
                        mergedPairs.push(left);
                    }
                    break;
            }
        } else {
            mergedPairs.push(right);
        }
    }

    return mergedPairs;
}

function insertBodyIntoDocObject(mergedBody, fullDocObject){
    if (fullDocObject.metadata != undefined){
        var metadata = fullDocObject.metadata;
        var tag = metadata.tag;
        if(tag == 'body') {
            return mergedBody;
        } else {
            var newChild = null;
            var children = [];
            for(var index = 0; index < fullDocObject.children.length; index++) {
                var child = fullDocObject.children[index];
                newChild = insertBodyIntoDocObject(mergedBody, child);
                children.push(newChild);
            }
            fullDocObject.children = children;
            return fullDocObject;
        }
    } else {
        return fullDocObject;
    }
}




module.exports = {
    getGitDiffOutput: getGitDiffOutput,
    processDiffIntoFileGranules: processDiffIntoFileGranules,
    convertFileGranulesIntoDiffObjects: convertFileGranulesIntoDiffObjects,
    extractBodyObject: extractBodyObject,
    filterNonContentChanges: filterNonContentChanges,
    cleanGitlitObjectForDiff: cleanGitlitObjectForDiff,
    markBodyForDiff: markBodyForDiff,
    linearizeGitlitObject: linearizeGitlitObject,
    pairUpRows: pairUpRows,
    markRowNumbersOnPairs: markRowNumbersOnPairs,
    splitPairsIntoBodies: splitPairsIntoBodies,
    convertToDiffDisplayDocObject: convertToDiffDisplayDocObject,
    convertToDiffSafeHTMLString: convertToDiffSafeHTMLString,
    applyDecisionsToMergePairs: applyDecisionsToMergePairs,
    convertToMergedDocObject: convertToMergedDocObject,
    insertBodyIntoDocObject: insertBodyIntoDocObject
};