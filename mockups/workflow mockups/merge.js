window.onload = function () {

document.forms["mergeBranches"].onsubmit = function(){
	var repoName = document.getElementById("repoName").value;
	var srcbranch = document.getElementById("srcbranch").value;
	var destbranch = document.getElementById("destbranch").value;
    alert("Calculating diff from " + srcbranch + " to " + destbranch + " for " + repoName + " ... ");
}

};