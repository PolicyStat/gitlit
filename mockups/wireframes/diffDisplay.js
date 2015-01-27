var displayFiles = function(before, after){
	var bodyDom = document.getElementById("body");

	createIFrame(bodyDom, before);
	createIFrame(bodyDom, after);
};

var createIFrame = function(bodyDom, file){
	var iframe = document.createElement("IFRAME");
	var reader = new FileReader();
	reader.onload = function(){
		iframe.setAttribute("src", reader.result);
	}
	reader.readAsDataURL(file);
	bodyDom.appendChild(iframe);
}