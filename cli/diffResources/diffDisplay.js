window.onload = function() 
{ 
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
	setHeights();
};

var placeFloatsFromHTML = function(domOld, domNew){
	var before = document.getElementById('before');
	var after = document.getElementById('after');
	before.classList.add("left");
	after.classList.add("right");
	before.appendChild(domOld);
	after.appendChild(domNew);
};

var setHeights = function(){
	var counter = 0;
	var keepGoing = true;
	while(keepGoing){
		var elements = document.getElementsByClassName(counter + '');
		if(elements == null){
			keepGoing = false;
		} else if(elements[0]){
			if(elements[1]){
				var heightLeft = parseInt(elements[0].getBoundingClientRect().top);
				var heightRight = parseInt(elements[1].getBoundingClientRect().top);
				var setHeight = 0;
				if(heightLeft>heightRight){
					setHeight = heightLeft + 'px';
				}else{
					setHeight = heightRight + 'px';
				}
				elements[0].style.position = "fixed";
				elements[0].style.top = setHeight;
				elements[1].style.position = "fixed";
				elements[1].style.top = setHeight;
			}else{
				var height = parseInt(elements[0].getBoundingClientRect().top);
				makeRadio(height, counter);
			}
		} else{
			keepGoing = false;
		}
		counter++;
	}
};

var makeRadio = function(height, number){
	var doc = document.getElementById("wrapper");
	
	var form = document.createElement("form");
	form.setAttribute("action", "");
	form.classList.add(number);
	form.classList.add("decision");
	form.style.position = "fixed";
	form.style.top = height+"px";
	form.style.left = "45%";
	doc.appendChild(form);

	var keep = document.createElement("input");
	keep.setAttribute("type", "radio");
	keep.setAttribute("value", "keep " + number);
	keep.checked = true;
	keep.classList.add(number);
	keep.classList.add("keep");
	keep.setAttribute("onclick", "uncheck(" + number + ", \"keep\")");
	keep.style.position = "relative";
	keep.style.left = "-4em";
	form.appendChild(keep);
	var labelKeep = document.createElement("div");
	labelKeep.style.position = "relative";
	labelKeep.style.left = "3.25em";
	labelKeep.style.top = "-1.5em";
	labelKeep.innerHTML = "Keep this change";
	form.appendChild(labelKeep);

	var revert = document.createElement("input");
	revert.setAttribute("type", "radio");
	revert.setAttribute("value", "revert " + number);
	revert.classList.add(number);
	revert.classList.add("revert");
	revert.setAttribute("onclick", "uncheck(" + number + ", \"revert\")");
	revert.style.position = "relative";
	revert.style.left = "-4em";
	form.appendChild(revert);
	var labelRevert = document.createElement("div");
	labelRevert.style.position = "relative";
	labelRevert.style.left = "3.25em";
	labelRevert.style.top = "-1.5em";
	labelRevert.innerHTML = "Revert this change";
	form.appendChild(labelRevert);
};

var uncheck = function(number, value){
	var node = document.getElementsByClassName(number + ' ' + value)[0];
	var classes = node.classList;
	var isKeep = false;
	for(var i=0; i<classes.length; i++){
		if(classes[i] == "keep"){
			isKeep = true;
			break;
		}
	}
	if(isKeep){
		var revert = document.getElementsByClassName(number + ' revert')[0];
		revert.checked = false;
	}else{
		var keep = document.getElementsByClassName(number + ' keep')[0];
		keep.checked = false;
	}
	node.checked = true;
};