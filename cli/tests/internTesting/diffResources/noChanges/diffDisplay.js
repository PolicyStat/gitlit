window.onload = function()
{
    document.getElementById("SaveButton").onclick = saveSelections;
};

$(window).load(function(){
    // jQuery methods go here...
    main();
});


var main = function(){
    passMain(diffDisplayInfo);

};

var passMain = function(htmlPair){
    var parser = new DOMParser();
    var docLeft = parser.parseFromString(htmlPair.left, "text/html");
    var docRight = parser.parseFromString(htmlPair.right, "text/html");
    var nodeLeft = docLeft.childNodes[0].childNodes[1];
    var nodeRight = docRight.childNodes[0].childNodes[1];
    placeFloatsFromHTML(nodeLeft, nodeRight);
    var rowTopMap = setHeights();
    var diffRows = getDiffRows();
    makeRadioButtons(rowTopMap, diffRows);

};

function saveSelections() {
    var selectionForms = Array.prototype.slice.call(document.getElementsByClassName('decision'));
    var selections = {};
    selectionForms.forEach(function(form) {
        var row = form.className.split(' ')[0];
        selections[row] = form.elements['radio'].value;
    });

    makeDownloadLink(selections);
}

function makeDownloadLink(selections){
    window.URL = window.webkitURL || window.URL;
    var output = document.querySelector('output');
    var prevLink = output.querySelector('a');
    if (prevLink) {
        window.URL.revokeObjectURL(prevLink.href);
        output.innerHTML = '';
    }
    var jsonFile = {
        selections: selections,
        mergePairs: mergePairs,
        mergeFile: mergeFile
    };
    var bb = new Blob([JSON.stringify(jsonFile)], {type: "text/json"});
    var a = document.createElement('a');
    a.download = 'decisions.json';
    a.href = window.URL.createObjectURL(bb);
    a.textContent = 'Click here to save selections';

    a.dataset.downloadurl = ["text/json", a.download, a.href].join(':');
    output.appendChild(a);
    a.onclick = function(e) {
        if('disabled' in this.dataset) {
            return false;
        }
        cleanUpDownload(this);
    }
}

function cleanUpDownload(a) {
    a.textContent = 'Downloaded';
    a.dataset.disabled = true;
    setTimeout(function() {
        window.URL.revokeObjectURL(a.href);
    }, 1500);
}

function makeRadioButtons(rowTopMap, diffRows) {
    diffRows.forEach(function(row) {
        makeRadio(rowTopMap[row], row);
    });
}

var getDiffRows = function() {
    var insElements = Array.prototype.slice.call(document.getElementsByClassName('ins'));
    var delElements = Array.prototype.slice.call(document.getElementsByClassName('del'));
    var diffElements = [];
    if(insElements != undefined && delElements != undefined) {
        diffElements = diffElements.concat(insElements);
        diffElements = diffElements.concat(delElements);
    } else if (insElements != undefined) {
        diffElements = insElements;
    } else if (delElements != undefined) {
        diffElements = delElements;
    } else {
        //This should never happen, since that would mean that there were no
        //insertions or deletions, although, to be fair, this could mean
        //we are working on moves and such, so maybe in the future.
    }
    var diffRows = [];
    diffElements.forEach(function(element) {
        var classNames = element.className.split(' ');
        //The first thing should be the row, always, so this should work
        diffRows.push(classNames[0]);
    });
    return diffRows
};


var setHeights = function() {
    var counter = 0;
    var keepGoing = true;
    var currentPlacementLocation = document.getElementById('before').getBoundingClientRect().top;
    var heightMap = {};
    var stringClass = '';
    var row_elements=[];
    while(keepGoing) {
        stringClass = "."+counter.toString();
        row_elements = $(stringClass);
        var result = null;
        if(row_elements == null) {
            keepGoing = false;
        } else if (row_elements[0] != null && row_elements[0] != undefined &&
            row_elements[1] != null && row_elements[1] != undefined){
            result = setLeftAndRightHeight(row_elements, currentPlacementLocation, heightMap,counter);
            currentPlacementLocation = result[1];
            heightMap = result[0];

        } else if ((row_elements[0] != null && row_elements[0] != undefined) ||
            (row_elements[1] != null && row_elements[1] != undefined)){
            result = setOneSideHeight(row_elements, currentPlacementLocation, heightMap,counter);
            currentPlacementLocation = result[1];
            heightMap = result[0];
        } else {
            keepGoing = false;
        }
        counter++;
    }
    return heightMap;
};

function setOneSideHeight(row_elements, currentPlacementLocation, heightMap, counter) {
    if((row_elements[0] != null && row_elements[0] != undefined)) {
        //No right side to match up to
        var leftElement = row_elements[0];
        var leftClass = "."+leftElement.className;
        leftClass = leftClass.replace(" ", ".");
        var heightLeft = $(leftClass).outerHeight(true);
        var leftParentTop = parseInt(leftElement.parentNode.getBoundingClientRect().top);
        var leftAbsolute = currentPlacementLocation - leftParentTop;

        leftElement.style.position = 'absolute';
        leftElement.style.top = leftAbsolute + 'px';
        heightMap[counter.toString()] = currentPlacementLocation + 'px';
        currentPlacementLocation = Math.max(currentPlacementLocation+heightLeft, currentPlacementLocation);
        return [heightMap, currentPlacementLocation];
    } else {
        //No left side to match up to
        var rightElement = row_elements[1];
        var rightClass = "."+rightElement.className;
        rightClass = rightClass.replace(" ", ".");
        var heightRight = $(rightClass).outerHeight(true);
        var rightParentTop = parseInt(rightElement.parentNode.getBoundingClientRect().top);
        var rightAbsolute = currentPlacementLocation - rightParentTop;

        rightElement.style.position = 'absolute';
        rightElement.style.top = rightAbsolute + 'px';
        heightMap[counter.toString()] = currentPlacementLocation + 'px';
        currentPlacementLocation = Math.max(currentPlacementLocation, currentPlacementLocation+heightRight);
        return [heightMap, currentPlacementLocation];
    }
}

function setLeftAndRightHeight(row_elements, currentPlacementLocation, heightMap,counter){
    var leftElement = row_elements[0];
    var rightElement = row_elements[1];
    var leftClass = "."+leftElement.className;
    var rightClass = "."+rightElement.className;
    leftClass = leftClass.replace(" ", ".");
    rightClass = rightClass.replace(" ", ".");
    var heightLeft = $(leftClass).outerHeight(true);
    var heightRight = $(rightClass).outerHeight(true);
    var leftParentTop = parseInt(leftElement.parentNode.getBoundingClientRect().top);
    var rightParentTop = parseInt(rightElement.parentNode.getBoundingClientRect().top);
    var leftAbsolute = currentPlacementLocation - leftParentTop;
    var rightAbsolute = currentPlacementLocation - rightParentTop;

    leftElement.style.position = 'absolute';
    rightElement.style.position = 'absolute';
    leftElement.style.top = leftAbsolute + 'px';
    rightElement.style.top = rightAbsolute + 'px';
    heightMap[counter.toString()] = currentPlacementLocation + 'px';
    currentPlacementLocation = Math.max(currentPlacementLocation+heightLeft, currentPlacementLocation+heightRight);
    return [heightMap, currentPlacementLocation];
}

var placeFloatsFromHTML = function(domOld, domNew){
    var before = document.getElementById('before');
    var after = document.getElementById('after');
    before.classList.add("left");
    after.classList.add("right");
    before.appendChild(domOld);
    after.appendChild(domNew);
};


var makeRadio = function(height, number){
    var doc = document.getElementById("wrapper");

    var form = document.createElement("form");
    form.setAttribute("action", "");
    form.classList.add(number);
    form.classList.add("decision");
    form.style.position = "absolute";
    form.style.top = height;
    form.style.left = "50%";
    doc.appendChild(form);

    var revert = document.createElement("input");
    revert.setAttribute("type", "radio");
    revert.setAttribute("value", "revert");
    revert.name = "radio";
    revert.classList.add(number);
    revert.classList.add("revert");
    revert.id = "revert " + number;
    revert.style.margin = "5px";
    form.appendChild(revert);
    var labelRevert = document.createElement("label");
    labelRevert.for = "revert " + number;
    labelRevert.innerHTML = "Revert";
    form.appendChild(labelRevert);

    var keep = document.createElement("input");
    keep.setAttribute("type", "radio");
    keep.setAttribute("value", "keep");
    keep.name ="radio";
    keep.checked = true;
    keep.classList.add(number);
    keep.classList.add("keep");
    keep.style.margin = "5px";
    form.appendChild(keep);
    var labelKeep = document.createElement("label");
    labelKeep.for = "keep " + number;
    labelKeep.innerHTML = "Keep";
    form.appendChild(labelKeep);
};