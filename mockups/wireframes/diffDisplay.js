window.onload = function() 
{ 
	main();
};

var main = function(){
	var parser = new DOMParser();
	var docLeft = parser.parseFromString('<html><head lang="en"><meta charset="UTF-8"><title>titletext</title></head><body><h1 id="derp" class="herp 0" name="headerOne" >Header <span></span> afterSpan</h1></body></html>', "text/html");
	var docRight = parser.parseFromString('<html><head lang="en"><meta charset="UTF-8"><title>titletext</title></head><body><h1 id="derp" class="herp" name="headerOne" >Header <span></span> afterSpan <div class="0">divcheck</div> </h1></body></html>', "text/html");
	var nodeLeft = docLeft.childNodes[0].childNodes[1];
	var nodeRight = docRight.childNodes[0].childNodes[1];
	placeFloatsFromHTML(nodeLeft, nodeRight);
	setHeights();
}

var place = function(domOld, domNew){
	var before = document.getElementById('before');
	var after = document.getElementById('after');
	before.appendChild(domOld);
	after.appendChild(domNew);
};

var placeFloatsFromHTML = function(domOld, domNew){
	var before = document.getElementById('before');
	var after = document.getElementById('after');
	before.classList.add("left");
	after.classList.add("right");
	before.appendChild(domOld);
	after.appendChild(domNew);
}



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
				var heightRight = parseInt(elements[1].getBoundingClientRect().top);6
				var setHeight = 0;
				if(heightLeft>heightRight){
					setHeight = heightLeft + 'px';
				}else{
					setHeight = heightRight + 'px';
				}
				elements[0].style.position = "absolute";
				elements[0].style.top = setHeight;
				elements[1].style.position = "absolute";
				elements[1].style.top = setHeight;
			}
		} else{
			keepGoing = false;
		}
		counter++;
	}
}

var placeTable = function(buildList){
	var wrapper = document.getElementById('wrapper');
	var table = document.createElement("table");
	for(var i=0; i<buildList.length; i++){
		var row = document.createElement("tr");	
		var leftElement = document.createElement("td");
		var rightElement = document.createElement("td");
		if(buildList.left){
			leftElement.appendChild(buildList.left);
		}
		if(buildList.right){
			rightElement.appendChild(buildList.right);
		}
		row.appendChild(leftElement);
		row.appendChild(rightElement);
		table.appendChild(table);
	}
	wrapper.appendChild(table);
};

var placeFloats = function(buildList){
	var wrapper = document.getElementById('wrapper');
	for(var i=0; i<buildList.length; i++){
		if(buildList.left){
			buildList.left.classList.add("left");
			wrapper.appendChild(buildList.left);
		}
		if(buildList.right){
			buildList.right.classList.add("right");
			wrapper.appendChild(buildList.right);
		}
		var clearNode = document.createElement("span");
		clearNode.classList.add("clear");
		wrapper.appendChild(clearNode);
	}
};