/**
 * Created by Devon Timaeus on 10/11/2014.
 */
var parser = require('../htmlParser');
var fs = require('fs');
var Parser = require('parse5').Parser;
var parse5 = new Parser();
var assert = require('assert');

describe('Check POR-ids and id attributes', function() {

    it('Throw error on duplicate id attribute', function() {
        var faultyHTML = fs.readFileSync('./cli/tests/resources/duplicateIDs.html', 'utf8');
        var faultyDom = parse5.parse(faultyHTML);

        assert.throws(function (){
            parser.checkPORIds(faultyDom);
        }, ReferenceError);
    });
});

describe('Create repo info correctly', function(){
	
	it('Stores the correct repo name', function(){
		var validHTML = fs.readFileSync('./cli/tests/resources/testHTMLJustDocType.html', 'utf8');
		var output1 = parser.parseHTML(validHTML, 'reposGalore');
		var output2 = parser.parseHTML(validHTML, 'repo with spaces');
		var output3 = parser.parseHTML(validHTML, 'repo with bang!');
		var output4 = parser.parseHTML(validHTML, 'query repo?');
		var output5 = parser.parseHTML(validHTML, '"quotes"');
		
		assert.equal(output1.repoName, "reposGalore");
		assert.equal(output2.repoName, "repo with spaces");
		assert.equal(output3.repoName, "repo with bang!");
		assert.equal(output4.repoName, "query repo?");
		assert.equal(output5.repoName, '"quotes"');
	});
	
});

describe('parseHTML over basic test file', function(){
	
	it('Parses correct tags from formatted HTML document', function() {
		var validHTML = fs.readFileSync('./cli/tests/resources/testHTMLBasicFormat.html', 'utf8');
		var output = parser.parseHTML(validHTML, 'repoName');
		
		assert.equal(output.children[1].children[0].children[0].porID, "id1");
		assert.equal(output.children[1].children[1].children[0].porID, "id2");
		assert.equal(output.children[1].children[1].children[0].children[1].porID, "id3");
	});
	
	it('Parses text nodes correctly from formatted HTML document', function(){
		var validHTML = fs.readFileSync('./cli/tests/resources/testHTMLBasicFormat.html', 'utf8');
		var output = parser.parseHTML(validHTML, 'repoName');
		
		assert.equal(output.children[1].children[0].children[0].children[0].value, "\n\t\t\tSuper basic formatted html\n\t\t");
		assert.equal(output.children[1].children[1].children[0].children[0].value, "\n\t\t\tpreSpan\n\t\t\t");
		assert.equal(output.children[1].children[1].children[0].children[1].children[0].value, "\n\t\t\t\tinSpan\n\t\t\t");
		assert.equal(output.children[1].children[1].children[0].children[2].value, "\n\t\t\tpostSpan\n\t\t");
	});
	
	it('Creates the correct tree structure from formatted HTML document', function(){
		var validHTML = fs.readFileSync('./cli/tests/resources/testHTMLBasicFormat.html', 'utf8');
		var output = parser.parseHTML(validHTML, 'repoName');
		
		assert.equal(output.children[0].children, null); //doctype
		assert.equal(output.children[1].children.length, 2); //html
		assert.equal(output.children[1].children[0].children.length, 1); //head
		assert.equal(output.children[1].children[0].children[0].children.length, 1); //title
		assert.equal(output.children[1].children[0].children[0].children[0].children, null); //text
		assert.equal(output.children[1].children[1].children.length, 1); //body
		assert.equal(output.children[1].children[1].children[0].children.length, 3); //h1
		assert.equal(output.children[1].children[1].children[0].children[0].children, null); //text
		assert.equal(output.children[1].children[1].children[0].children[1].children.length, 1); //span
		assert.equal(output.children[1].children[1].children[0].children[1].children[0].children, null); //text
		assert.equal(output.children[1].children[1].children[0].children[2].children, null); //text
	});
	
});

describe('parseHTML over inline text file', function(){
	
		it('Parses correct tags from inline HTML document', function() {
		var validHTML = fs.readFileSync('./cli/tests/resources/testHTMLInlineFormat.html', 'utf8');
		var output = parser.parseHTML(validHTML, 'repoName');
		
		assert.equal(output.children[1].children[0].children[0].porID, "id1");
		assert.equal(output.children[1].children[1].children[0].porID, "id2");
		assert.equal(output.children[1].children[1].children[0].children[1].porID, "id3");
	});
	
	it('Parses text nodes correctly from inline HTML document', function(){
		
		var validHTML = fs.readFileSync('./cli/tests/resources/testHTMLInlineFormat.html', 'utf8');
		var output = parser.parseHTML(validHTML, 'repoName');
		
		assert.equal(output.children[1].children[0].children[0].children[0].value, "Super basic formatted html");
		assert.equal(output.children[1].children[1].children[0].children[0].value, "preSpan");
		assert.equal(output.children[1].children[1].children[0].children[1].children[0].value, "inSpan");
		assert.equal(output.children[1].children[1].children[0].children[2].value, "postSpan");
	});
	
	it('Creates the correct tree structure from inline HTML document', function(){
			
		var validHTML = fs.readFileSync('./cli/tests/resources/testHTMLInlineFormat.html', 'utf8');
		var output = parser.parseHTML(validHTML, 'repoName');
		
		assert.equal(output.children[0].children, null); //doctype
		assert.equal(output.children[1].children.length, 2); //html
		assert.equal(output.children[1].children[0].children.length, 1); //head
		assert.equal(output.children[1].children[0].children[0].children.length, 1); //title
		assert.equal(output.children[1].children[0].children[0].children[0].children, null); //text
		assert.equal(output.children[1].children[1].children.length, 1); //body
		assert.equal(output.children[1].children[1].children[0].children.length, 3); //h1
		assert.equal(output.children[1].children[1].children[0].children[0].children, null); //text
		assert.equal(output.children[1].children[1].children[0].children[1].children.length, 1); //span
		assert.equal(output.children[1].children[1].children[0].children[1].children[0].children, null); //text
		assert.equal(output.children[1].children[1].children[0].children[2].children, null); //text
	});
	
});
