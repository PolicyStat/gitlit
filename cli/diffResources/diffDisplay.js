window.onload = function()
{
    document.getElementById("SaveButton").onclick = saveSelections;
    main();
};

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
    var rowTopMap = setDevonHeights();
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
    console.log(selections);

    makeDownloadLink(selections);

}

function makeDownloadLink(selections){
    window.URL = window.webkitURL || window.URL;
    output = document.querySelector('output');
    var prevLink = output.querySelector('a');
    if (prevLink) {
        window.URL.revokeObjectURL(prevLink.href);
        output.innerHTML = '';
    }
    var bb = new Blob([JSON.stringify(selections)], {type: "text/json"});
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


var setDevonHeights = function() {
    var counter = 0;
    var keepGoing = true;
    var currentPlacementLocation = document.getElementById('after').getBoundingClientRect().bottom;
    var heightMap = {};
    while(keepGoing) {
        var row_elements = document.getElementsByClassName(counter.toString());
        if(row_elements == null) {
            keepGoing = false;
        } else if (row_elements[0] != null && row_elements[0] != undefined &&
            row_elements[1] != null && row_elements[1] != undefined){
            var leftElement = row_elements[0];
            var rightElement = row_elements[1];
            var heightLeft =  parseInt(leftElement.getBoundingClientRect().height);
            var heightRight = parseInt(rightElement.getBoundingClientRect().height);

            leftElement.style.position = 'fixed';
            rightElement.style.position = 'fixed';
            leftElement.style.top = currentPlacementLocation + 'px';
            rightElement.style.top = currentPlacementLocation + 'px';
            heightMap[counter.toString()] = currentPlacementLocation + 'px';
            currentPlacementLocation = Math.max(currentPlacementLocation+heightLeft, currentPlacementLocation+heightRight);
        } else {
            keepGoing = false;
        }
        counter++;
    }
    return heightMap;
};

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
    form.style.position = "fixed";
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