window.onload = function () {

document.forms["fileUpload"].onsubmit = function(){
	var repoName = document.getElementById("repoName").value;
    alert("New repository \'" + repoName + "\' created successfully.");
}

};