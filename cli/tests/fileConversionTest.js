var repoInit = require('../repoInit');
var parser = require('../htmlParser');
var htmlWriter = require('../htmlWriter');
var fs = require('fs');
var assert = require('assert');

describe("First tests: Reading the file", function() {

	it("Grabbing file extension", function() {
		assert.equal(repoInit.getExtension('./cli/tests/resources/testFullConversion.html'), 'html');
	});

	it("Getting file contents", function() {
		var fileContents = repoInit.getFileContents('./cli/tests/resources/testFullConversion.html');
		assert.ok(typeof fileContents == 'string');
		assert.ok(fileContents.length > 0);
		assert.equal(fileContents.substring(0, 14), '<!DOCTYPE html');
	});
});

describe("Test parsing of file into JSON object", function() {
	/*
	 * Best way to do this is to generate the JSON object and then 
	 * examine several nodes and make sure they're what we expect them to be.
	 */
	var fileContents = repoInit.getFileContents('./cli/tests/resources/testFullConversion.html');
	var porObject = parser.parseHTML(fileContents, "testRepo");

	it("Checking first node in the JSON object", function() {
		assert.ok(porObject.children[0]);
		assert.equal(porObject.children[0].value.substring(0, 14), '<!DOCTYPE html');
	});

	it("Checking 'html' node in the JSON object", function() {
		assert.ok(porObject.children[1]);
		assert.ok(porObject.children[1].metadata);
		assert.equal(porObject.children[1].metadata.tag, 'html');
		assert.equal(porObject.children[1].metadata.attributes[0].name, "id");
		assert.equal(porObject.children[1].metadata.attributes[0].value, "one");
	});

	it("Checking 'head' node in the JSON object", function() {
		//Child order: repo -> html -> head
		assert.ok(porObject.children[1].children[0]);
		assert.ok(porObject.children[1].children[0].metadata);
		assert.equal(porObject.children[1].children[0].metadata.tag, 'head');
		assert.equal(porObject.children[1].children[0].metadata.attributes[0].name, "id");
		assert.equal(porObject.children[1].children[0].metadata.attributes[0].value, "two");
		assert.equal(porObject.children[1].children[0].metadata.attributes[1].name, "lang");
		assert.equal(porObject.children[1].children[0].metadata.attributes[1].value, "en");
	});

	it("Checking first text node in the JSON object", function() {
		//Child order: repo -> html -> head -> title -> text
		assert.equal(porObject.children[1].children[0].children[1].children[0].value, "Title Here");
		assert.ok(porObject.children[1].children[0].children[1].children[0].porID);
	});

	it("Checking that a body tag was properly created", function() {
		//Child order: repo -> html -> body
		assert.ok(porObject.children[1].children[1]);
		assert.ok(porObject.children[1].children[1].metadata);
		assert.equal(porObject.children[1].children[1].metadata.tag, "body");
	});
});

describe("Test writing the JSON object to repo directory", function() {

	repoInit.initializeRepository('./cli/tests/resources/testFullConversion.html', './cli/tests/conversionTest', 'testRepo');

	it("Checking that the directory was created", function() {
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testRepo"));
		assert.equal(fs.readdirSync("./cli/tests/conversionTest/testRepo").length, 3);
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testRepo/metadata.json"));
	});

	it("Checking the contents of several files in the directory", function() {
		assert.ok(JSON.parse(fs.readFileSync("./cli/tests/conversionTest/testRepo/metadata.json")).constructionOrder);

		assert.ok(fs.existsSync("./cli/tests/conversionTest/testRepo/doctype.txt"));
		assert.equal(fs.readFileSync("./cli/tests/conversionTest/testRepo/doctype.txt", "utf-8").substring(0, 9), '<!DOCTYPE');

		assert.ok(fs.existsSync("./cli/tests/conversionTest/testRepo/one"));
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testRepo/one/two"));
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testRepo/one/two/three"));
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testRepo/one/two/three/metadata.json"));

		assert.equal(JSON.parse(fs.readFileSync("./cli/tests/conversionTest/testRepo/one/two/three/metadata.json")).tag, "title");
	});
});

describe("Test writing repo directory back into HTML file", function() {

	htmlWriter.initializeFile("./cli/tests/conversionTest/testRepo", "./cli/tests/conversionTest/testFile.html");

	it("Checking that the html file was created", function() {
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testFile.html"));
	});

	it("Checking the contents of the html file", function() {
		var fileContents = fs.readFileSync("./cli/tests/conversionTest/testFile.html", "utf-8");
		fileArray = fileContents.split('\n');
		assert.equal(fileArray[1], '<html id="one">');
		assert.equal(fileArray[3], '  <head id="two" lang="en">');
		assert.equal(fileArray[4], '    <meta charset="UTF-8"></meta>');
		assert.equal(fileArray[5], '    <title id="three">Title Here</title>');
		assert.equal(fileArray[6], '  </head>');
		assert.equal(fileArray[8], '  <body></body>');
		assert.equal(fileArray[10], '</html>');
	});
});

describe("Sending the new HTML file back through repo/html generation", function() {
	repoInit.initializeRepository('./cli/tests/conversionTest/testFile.html', './cli/tests/conversionTest', 'testRepoRepeat');
	htmlWriter.initializeFile("./cli/tests/conversionTest/testRepoRepeat", "./cli/tests/conversionTest/testFileRepeat.html");

	it("Checking that the html file was created", function() {
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testFileRepeat.html"));
	});

	it("Checking the contents of the html file", function() {
		var oldFileContents = fs.readFileSync("./cli/tests/conversionTest/testFile.html", "utf-8");
		var newFileContents = fs.readFileSync("./cli/tests/conversionTest/testFileRepeat.html", "utf-8");
		assert.equal(oldFileContents, newFileContents);
	});
});


describe("Testing second file sent through repo/html writers", function() {
	repoInit.initializeRepository('./cli/tests/resources/testFullConversion2.html', './cli/tests/conversionTest', 'testRepo2');
	htmlWriter.initializeFile("./cli/tests/conversionTest/testRepo2", "./cli/tests/conversionTest/testFile2.html");

	it("Checking that the html file was created", function() {
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testFile2.html"));
	});

	// Parser should correctly put the hr tag inside the body tag
	it("Checking the contents of the html file", function() {
		var fileContents = fs.readFileSync("./cli/tests/conversionTest/testFile2.html", "utf-8");
		fileArray = fileContents.split('\n');
		assert.equal(fileArray[1], '<html>');
		assert.equal(fileArray[3], '  <head></head>');
		assert.equal(fileArray[5], '  <body>');
		assert.equal(fileArray[6], '    <hr></hr>');
		assert.equal(fileArray[7], '     <h1 class="header" style="color:green">Header</h1>');
		assert.equal(fileArray[9], '  </body>');
		assert.equal(fileArray[11], '</html>');
	});
});


describe("Testing third file sent through repo/html writers", function() {
	repoInit.initializeRepository('./cli/tests/resources/testFullConversion3.html', './cli/tests/conversionTest', 'testRepo3');
	htmlWriter.initializeFile("./cli/tests/conversionTest/testRepo3", "./cli/tests/conversionTest/testFile3.html");

	it("Checking that the html file was created", function() {
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testFile3.html"));
	});

	// Parser should correctly put the div tags and everything inside under a body tag
	it("Checking the contents of the html file", function() {
		var fileContents = fs.readFileSync("./cli/tests/conversionTest/testFile3.html", "utf-8");
		fileArray = fileContents.split('\n');
		assert.equal(fileArray[1], '<html>');
		assert.equal(fileArray[3], '  <head></head>');
		assert.equal(fileArray[5], '  <body>');
		assert.equal(fileArray[6], '    <div><span>Span Text</span>');
		assert.equal(fileArray[8], '      <br></br>');
		assert.equal(fileArray[9], '       <h3 id="headerTwo" class="test">Underline</h3>');
		assert.equal(fileArray[11], '    </div>');
		assert.equal(fileArray[12], '  </body>');
		assert.equal(fileArray[14], '</html>');
	});
});