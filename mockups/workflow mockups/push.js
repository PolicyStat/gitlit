window.onload = function () {

document.forms["pushRepo"].onsubmit = function(){
	var repoName = document.getElementById("repoName").value;

    alert("Successfully pushed to \'" + repoName + "\' on branch \'Branch 0\'");
}

};