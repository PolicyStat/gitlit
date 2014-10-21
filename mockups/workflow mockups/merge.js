window.onload = function () {

document.forms["mergeBranches"].onsubmit = function(){
	var repoName = document.getElementById("repoName").value;
	var destbranch = document.getElementById("destbranch").value;
    alert("Calculating diff from current branch Branch 0 to " + destbranch + " for " + repoName + " ... ");
}

};