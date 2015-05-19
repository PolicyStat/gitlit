/**
 * Created by Devon Timaeus on 5/19/2015.
 */

/*
 *
 */
function applyDecisionsToMergePairs(decisions, pairs) {
    var mergedPairs = [];
    var revertedMovesEdits = [];
    for(var row = 0; row < pairs.length; row++){
        //We want to go through each row, and see if there was a decision made here
        var left = pairs[row].left;
        var right = pairs[row].right;
        var parent = null;

        //Look to see what the parent should be based on whether the left or right side is null
        //Then set left and\or right appropriately
        if(left == null && right != null) {
            parent = right.parent != undefined ? right.parent : right.metadata.parentID;
            left = emptyNode(0,"",parent)
        } else if (right == null && left != null) {
            parent = left.parent != undefined ? left.parent : left.metadata.parentID;
            right = emptyNode(0,"",parent)
        }

        if(decisions[row] != undefined) {
            if(decisions[row] == 'keep') {
                //If we are wanting to keep the change, just take the right side, as that is the most up-to-date
                //possible node
                mergedPairs.push(right);
            } else {
                //If we aren't keeping, we're reverting, so we need to look and see if the decision is a move
                //or edit that we are reverting, because if so, we need to handle the fact that the other half
                //of the change appears elsewhere.
                if(left.diffMetadata != null && left.diffMetadata != undefined) {
                    if(left.diffMetadata.decisionNumber != null && left.diffMetadata.decisionNumber != undefined) {
                        //If the left side exists, we want to add it's decision number to the list
                        revertedMovesEdits.push(left.diffMetadata.decisionNumber);
                    }
                } else if (right.diffMetadata != null && right.diffMetadata != undefined) {
                    if (right.diffMetadata.decisionNumber != null && right.diffMetadata.decisionNumber != undefined) {
                        //If the right side exists, and the left side didn't, we want to add the
                        //right side's decision number to the list
                        revertedMovesEdits.push(right.diffMetadata.decisionNumber);
                    }
                }
                //No matter what, we want to actually take the appropriate change
                if(right == null) {
                    mergedPairs.push({ignoreInChildCounting: left});
                } else {
                    mergedPairs.push(left);
                }
            }
        } else {
            //There isn't a decision made for this row, but there may still need to be some
            //change made at a different row enacted here. That is, a change regarding this
            //pair might have been made earlier, so we need to look for that
            if(left.diffMetadata != undefined && left.diffMetadata != null) {
                if(left.diffMetadata.decisionNumber != undefined && left.diffMetadata.decisionNumber != null) {
                    //If this diff has been reverted, then push the left side
                    if(revertedMovesEdits.indexOf(left.diffMetadata.decisionNumber) != -1 ) {
                        mergedPairs.push(left);
                    }
                }
            }
            else {
                //If the object on the right has a diff, and it is either an edit or move, then we want to see if it's
                //been reverted. If it has, then we want to push the left side, otherwise, the right.
                if(right.diffMetadata != undefined && right.diffMetadata != null) {
                    if(right.diffMetadata.decisionNumber != undefined && right.diffMetadata.decisionNumber != null) {
                        if(revertedMovesEdits.indexOf(right.diffMetadata.decisionNumber) != -1) {
                            mergedPairs.push(left);
                            continue;
                        }
                    }
                }
                mergedPairs.push(right);
            }
        }
    }

    return mergedPairs;
}

/*
 * Return an emptyNode with the given row number, id, and parent id
 */
function emptyNode(row, id, parent) {
    return {value: '',
        porID: id,
        row: row,
        parent: parent}
}

/*
 * Convert a flattened list of nodes with diff data into a gitlit document object
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


/*
 * Take the merged gitlit document body, and insert it into the document body's shell that
 * has the header and the other information that was not renderable.
 */
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

