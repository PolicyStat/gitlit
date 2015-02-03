window.onload = function() 
{ 
	main();
};

var main = function(){
	var object = {
		left: '<body><h1 id="derp" class="herp 0" name="headerOne" >Header <span></span> afterSpan</h1></body>',
		right: '<body><h1 id="derp" class="herp" name="headerOne" >Header <span></span> afterSpan <div class="0">divcheck</div> </h1></body>'
	};
	passMain(object);
}

var passMain = function(htmlPair){
	var parser = new DOMParser();
	var docLeft = parser.parseFromString(htmlPair.left, "text/html");
	var docRight = parser.parseFromString(htmlPair.right, "text/html");
	var nodeLeft = docLeft.childNodes[0].childNodes[1];
	var nodeRight = docRight.childNodes[0].childNodes[1];
	placeFloatsFromHTML(nodeLeft, nodeRight);
	setHeights();
}

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
