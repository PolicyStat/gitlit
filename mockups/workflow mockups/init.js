window.onload = function () {


document.forms["fileUpload"].onsubmit = function(){
	var repoName = document.getElementById("repoName").value;
	var alertDiv = document.getElementById("alertDiv");
	alertDiv.innerHTML = "<button onclick=\"clearAlert()\" id=\"button-alert\" class=\"pure-button button-alert\">New document created.</button>";

}

};

function clearAlert(){
	var alertDiv = document.getElementById("alertDiv");
	alertDiv.innerHTML = "";
}