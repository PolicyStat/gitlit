window.onload = function () {

document.forms["newbranch"].onsubmit = function(){
	var branchname = document.getElementById("newbranchname").value;
    alert("Created and checked out new branch \'" + branchname + "\'" );
}

document.forms["oldbranch"].onsubmit = function(){
	var branchname = document.getElementById("branch").value;
    alert("Checked out branch \'" + branchname + "\'" );
}

};