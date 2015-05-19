/**
 * Created by Devon Timaeus on 5/19/2015.
 */

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

function applyDecisionsToMergePairs(decisions, pairs) {
    var mergedPairs = [];
    var revertedMovesEdits = [];
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
                    if(left.diffMetadata != null && left.diffMetadata != undefined) {
                        if(left.diffMetadata.decisionNumber != null && left.diffMetadata.decisionNumber != undefined) {
                            revertedMovesEdits.push(left.diffMetadata.decisionNumber);
                        }
                    } else if (right.diffMetadata != null && right.diffMetadata != undefined) {
                        if (right.diffMetadata.decisionNumber != null && right.diffMetadata.decisionNumber != undefined) {
                            revertedMovesEdits.push(right.diffMetadata.decisionNumber);
                        }
                    }
                    if(right == null) {
                        mergedPairs.push({ignoreInChildCounting: left});
                    } else {
                        mergedPairs.push(left);
                    }
                    break;
            }
        } else {
            if(left.diffMetadata != undefined && left.diffMetadata != null) {
                if(left.diffMetadata.decisionNumber != undefined && left.diffMetadata.decisionNumber != null) {
                    if(revertedMovesEdits.indexOf(left.diffMetadata.decisionNumber) != -1 ) {
                        mergedPairs.push(left);
                    }
                }
            }
            else {
                if(right.diffMetadata != undefined && right.diffMetadata != null) {
                    if(right.diffMetadata.decisionNumber != undefined && right.diffMetadata.decisionNumber != null) {
                        if(revertedMovesEdits.indexOf(right.diffMetadata.decisionNumber) == -1) {
                            mergedPairs.push(right);
                        } else {
                            mergedPairs.push(left);
                        }
                    } else {
                        mergedPairs.push(right);
                    }
                } else {
                    mergedPairs.push(right);
                }
            }
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
    applyDecisionsToMergePairs: applyDecisionsToMergePairs,
    convertToMergedDocObject: convertToMergedDocObject,
    insertBodyIntoDocObject: insertBodyIntoDocObject
};

