function getDiff(repoLocation) {


    if(granule.fileInfo.changeType == 'new') {
        return {changeType: 'new', objectID: granule.fileInfo.newID,
        granule.versions.old.attributes.forEach(function(attribute){
           if(attribute.name == 'por-id') {
               oldID = attribute.value;
           }
        });
        granule.versions.new.attributes.forEach(function(attribute){
            if(attribute.name == 'por-id') {
                newID = attribute.value;
            }
        });

    var oldPathParent = splitOld[splitOld.length-2];
    var newPathParent = splitNew[splitNew.length-2];
    } else if (first == mightBeNull) {
        {type: "new", pattern: /(new file mode)/g},
    getDiff: getDiff,