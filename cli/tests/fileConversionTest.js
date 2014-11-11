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
		assert.equal(porObject.children[1].metadata.attributes[0].value, "html");
	});

	it("Checking 'head' node in the JSON object", function() {
		//Child order: repo -> html -> head
		assert.ok(porObject.children[1].children[0]);
		assert.ok(porObject.children[1].children[0].metadata);
		assert.equal(porObject.children[1].children[0].metadata.tag, 'head');
		assert.equal(porObject.children[1].children[0].metadata.attributes[0].name, "id");
		assert.equal(porObject.children[1].children[0].metadata.attributes[0].value, "head");
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

		assert.ok(fs.existsSync("./cli/tests/conversionTest/testRepo/html"));
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testRepo/html/head"));
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testRepo/html/head/title"));
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testRepo/html/head/title/metadata.json"));

		assert.equal(JSON.parse(fs.readFileSync("./cli/tests/conversionTest/testRepo/html/head/title/metadata.json")).tag, "title");
	});
});

describe("Test writing repo directory back into HTML file", function() {

	htmlWriter.initializeFile("./cli/tests/conversionTest/testRepo", "./cli/tests/conversionTest/testFile.html");

	it("Checking that the html file was created", function() {
		assert.ok(fs.existsSync("./cli/tests/conversionTest/testFile.html"));
	});

	it("Checking the contents of the html file", function() {
		var fileContents = fs.readFileSync("./cli/tests/conversionTest/testFile.html", "utf-8");
		fileString = fileContents.replace(/\n| {2,}/g,'');

		var testFileString = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
		testFileString += '<html id="html"><head id="head" lang="en"><meta id="meta" charset="UTF-8"></meta><title id="title">Title Here</title></head><body></body></html>';

		assert.equal(fileString, testFileString);
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
		fileString = fileContents.replace(/\n| {2,}/g,'');

		var testFile2String = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
		testFile2String += '<html><head></head><body><hr></hr><h1 class="header" style="color:green">Header</h1></body></html>';

		assert.equal(fileString, testFile2String);
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
		fileString = fileContents.replace(/\n| {2,}/g,'');

		var testFile3String = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
		testFile3String += '<html><head></head><body><div><span>Span Text</span><br></br><h3 id="headerTwo" class="test">Underline</h3></div></body></html>';

		assert.equal(fileString, testFile3String);
	});
});