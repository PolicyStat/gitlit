window.onload = function () {

document.forms["pushRepo"].onsubmit = function(){
	var repoName = document.getElementById("repoName").value;
	var branchName = document.getElementById("branchName").value;

    alert("Successfully pushed to \'" + repoName + "\' on branch \'" + branchName + "\'");
}

};