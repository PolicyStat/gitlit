window.onload = function () {

document.forms["pullRequest"].onsubmit = function(){
	var repoName = document.getElementById("repoName").value;
	var destbranch = document.getElementById("destbranch").value;
    alert("Calculating diff from Branch0 to " + destbranch + " for " + repoName + " ... ");
}

};