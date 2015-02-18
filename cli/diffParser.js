var htmlWriter = require('./htmlWriter');
function getGitDiffOutput(repoLocation) {
    if(granule.fileInfo.changeType == 'added') {
        return {changeType: 'added', objectID: granule.fileInfo.newID,

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
    var oldPathParent = null;
    if(splitOld.length != 0) {
        oldPathParent = splitOld[splitOld.length-2];
    }

    var newPathParent = null;
    if(splitNew.length != 0) {
        newPathParent = splitNew[splitNew.length-2];
    }

        if(first == null) {
            //This almost certainly means that the topmost level metadata file
            //was edited, so we should just return null, since there IS no parent
            return null;
        }
    } else if (first == mightBeNull && mightBeNull != null) {
        {type: "added", pattern: /(new file mode)/g},
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




    getGitDiffOutput: getGitDiffOutput,
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