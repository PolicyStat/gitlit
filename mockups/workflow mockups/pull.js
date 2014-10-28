window.onload = function () {

document.forms["pullRepo"].onsubmit = function(){
	var repoName = document.getElementById("repoName").value;
    alert("Successfully pulled \'" + repoName + "\'.");
}

};