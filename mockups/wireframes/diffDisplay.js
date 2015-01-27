window.onload = function() 
{ 
	main();
};

var main = function(){
	var parser = new DOMParser();
	var doc = parser.parseFromString('<html><head lang="en"><meta charset="UTF-8"><title>titletext</title></head><body><h1 id="derp" class="herp" name="headerOne" >Header <span></span> afterSpan</h1></body></html>', "text/html");
	var node = doc.childNodes[0].childNodes[1];
	console.log(node.childNodes);
	console.log(node.innerHTML);
	place(node.cloneNode(true), node.cloneNode(true));
}

var place = function(domOld, domNew){
	var before = document.getElementById('before');
	var after = document.getElementById('after');
	before.appendChild(domOld);
	after.appendChild(domNew);
};

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
			buildList.left.classList += " left";
			wrapper.appendChild(buildList.left);
		}
		if(buildList.right){
			buildList.right.classList += " right";
			wrapper.appendChild(buildList.right);
		}
		var clearNode = document.createElement("span");
		clearNode.classList = "clear";
		wrapper.appendChild(clearNode);
	}
};