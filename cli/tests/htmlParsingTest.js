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

describe('parseHTML over all on test files', function(){
	
	it('Parses correct tags from HTML document', function() {
		var validHTML = fs.readFileSync('./cli/tests/resources/testHTMLBasicFormat.html', 'utf8');
		var output = parser.parseHTML(validHTML, 'repoName');
		
		assert.equal(output.children[1].children[0].children[0].porID, "id1");
		assert.equal(output.children[1].children[1].children[0].porID, "id2");
		assert.equal(output.children[1].children[1].children[0].children[1].porID, "id3");
	});
	
	it('Parses text nodes correctly from HTML document', function(){
		
		var validHTML = fs.readFileSync('./cli/tests/resources/testHTMLBasicFormat.html', 'utf8');
		var output = parser.parseHTML(validHTML, 'repoName');
		
		assert.equal(output.children[1].children[0].children[0].children[0].value, "\n\t\t\tSuper basic formatted html\n\t\t");
		assert.equal(output.children[1].children[1].children[0].children[0].value, "\n\t\t\tpreSpan\n\t\t\t");
		assert.equal(output.children[1].children[1].children[0].children[1].children[0].value, "\n\t\t\t\tinSpan\n\t\t\t");
		assert.equal(output.children[1].children[1].children[0].children[2].value, " \n\t\t\tpostSpan\n\t\t");
// 		This last one is weird, I don't know why it generates an extra space here. there is no space in the file.
	});
	
});
