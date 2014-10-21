/**
 * Created by Devon Timaeus on 10/11/2014.
 */
var parser = require('../htmlParser');
var fs = require('fs');
var Parser = require('parse5').Parser;
var parse5 = new Parser();
var assert = require('assert');
var test = require('unit.js');

/*
 TODO: Test cases still needing to be covered:
 Test whitespace text nodes removed
 There may need to be more tests about pre tags
*/


describe('Check POR-ids and id attributes', function() {

    it('Throw error on duplicate id attribute', function() {
        var faultyHTML = fs.readFileSync('./cli/tests/resources/duplicateIDs.html', 'utf8');
        var faultyDom = parse5.parse(faultyHTML);

        assert.throws(function (){
            parser.checkPORIds(faultyDom);
        }, ReferenceError);
    });

    it('recognize and read id that was already present in tag', function() {
        var htmlSnippet = "<span id=\"basicID\">test</span>";
        var output = parser.parseHTML(htmlSnippet, 'repoName');
        /*
            This is necessary because doing the parse5.parse will generate html, head, and body tags
            Which is awesome, but makes a bit harder to test. We might want to make it so that it
            uses parse5.parseFragment instead, depending on how we want to treat incomplete HTML.
            TODO: Find a way to prevent parse5 from autogenerating, or find a nicer way to access
        */
        var porSnippet = output.children[0].children[1].children[0];
        assert.equal(porSnippet.porID, 'basicID');
    });

    it('recognize and read por-id that was already present in tag', function() {
        var htmlSnippet = "<span por-id=\"basicID\">test</span>";
        var output = parser.parseHTML(htmlSnippet, 'repoName');

        var porSnippet = output.children[0].children[1].children[0];
        assert.equal(porSnippet.porID, 'basicID');
    });

    it('recognize and read mixed por-id and id present in tags', function() {
        var htmlSnippet = "<span por-id=\"porID\">test</span><div id=\"realID\"></div>";
        var output = parser.parseHTML(htmlSnippet, 'repoName');

        var porSnippet = output.children[0].children[1].children[0];
        var idSnippet = output.children[0].children[1].children[1];
        assert.equal(porSnippet.porID, 'porID');
        assert.equal(idSnippet.porID, 'realID');
    });

    it('prefer por-ids over html ids if both are present', function() {
        var htmlSnippet = "<span id='htmlID' por-id=\"porID\">test</span>";
        var output = parser.parseHTML(htmlSnippet, 'repoName');

        var porSnippet = output.children[0].children[1].children[0];
        assert.equal(porSnippet.porID, 'porID');
    });

});

describe('Element ordering & storage in metadata objects', function() {

    it('correct order of elements given all html ids', function() {
        var htmlSnippet = "<span id=\"basicID\">test</span><span id=\"mediumID\"></span><span id=\"lastID\"></span>";
        var output = parser.parseHTML(htmlSnippet, 'repoName');

        var basic = output.children[0].children[1].children[0];
        var medium = output.children[0].children[1].children[1];
        var last = output.children[0].children[1].children[2];

        /*
            Even though the metadata file ends up storing the ordering information for the sections, for the
            POR object, the children are already in the proper order, so we just need to check that the children
            are in the correct order.
         */

        assert.equal(basic.porID, 'basicID');
        assert.equal(medium.porID, 'mediumID');
        assert.equal(last.porID, 'lastID');
    });

    it('correct order of the elements given all por-ids', function() {
        var htmlSnippet = "<span por-id=\"basicID\">test</span><span por-id=\"mediumID\"></span><span por-id=\"lastID\"></span>";
        var output = parser.parseHTML(htmlSnippet, 'repoName');

        var basic = output.children[0].children[1].children[0];
        var medium = output.children[0].children[1].children[1];
        var last = output.children[0].children[1].children[2];

        assert.equal(basic.porID, 'basicID');
        assert.equal(medium.porID, 'mediumID');
        assert.equal(last.porID, 'lastID');
    });

    it('correct order for mixed por & html ids', function() {
        var htmlSnippet = "<span id=\"basicID\">test</span><span por-id=\"mediumID\"></span><span id=\"lastID\"></span>";
        var output = parser.parseHTML(htmlSnippet, 'repoName');

        var basic = output.children[0].children[1].children[0];
        var medium = output.children[0].children[1].children[1];
        var last = output.children[0].children[1].children[2];

        assert.equal(basic.porID, 'basicID');
        assert.equal(medium.porID, 'mediumID');
        assert.equal(last.porID, 'lastID');

        htmlSnippet = "<span id=\"basicID\">test</span><span por-id=\"mediumID\"></span><span por-id=\"lastID\"></span>";
        output = parser.parseHTML(htmlSnippet, 'repoName');

        basic = output.children[0].children[1].children[0];
        medium = output.children[0].children[1].children[1];
        last = output.children[0].children[1].children[2];

        assert.equal(basic.porID, 'basicID');
        assert.equal(medium.porID, 'mediumID');
        assert.equal(last.porID, 'lastID');
    });

    it('correct order when generating ids', function() {
        var htmlSnippet = "<span class=1>test</span><span class=2></span><span class=3></span>";
        var output = parser.parseHTML(htmlSnippet, 'repoName');

        var first = output.children[0].children[1].children[0].metadata.attributes[0];
        var mid = output.children[0].children[1].children[1].metadata.attributes[0];
        var last = output.children[0].children[1].children[2].metadata.attributes[0];

        assert.ok(first.name == 'class' && first.value == 1);
        assert.ok(mid.name == 'class' && mid.value == 2);
        assert.ok(last.name == 'class' && last.value == 3);
    });

    it('correct order for mixed generated & set ids' , function() {
        var htmlSnippet = "<span class=1 por-id=\"what\">test</span><span class=2 id=\"hello\"></span><span class=3></span>" +
                          "<span class=4>test</span><span class=5 por-id=\"por\"></span><span class=6></span>";
        var output = parser.parseHTML(htmlSnippet, 'repoName');

        var first   = output.children[0].children[1].children[0].metadata.attributes[0];
        var second  = output.children[0].children[1].children[1].metadata.attributes[0];
        var third   = output.children[0].children[1].children[2].metadata.attributes[0];
        var fourth  = output.children[0].children[1].children[3].metadata.attributes[0];
        var fifth   = output.children[0].children[1].children[4].metadata.attributes[0];
        var sixth   = output.children[0].children[1].children[5].metadata.attributes[0];

        assert.ok(first.name    == 'class' && first.value == 1);
        assert.ok(second.name   == 'class' && second.value == 2);
        assert.ok(third.name    == 'class' && third.value == 3);
        assert.ok(fourth.name   == 'class' && fourth.value == 4);
        assert.ok(fifth.name    == 'class' && fifth.value == 5);
        assert.ok(sixth.name    == 'class' && sixth.value == 6);
    });

});

describe('Create repo info correctly', function(){
	
	it('Stores the correct repo name', function(){
		var validHTML = fs.readFileSync('./cli/tests/resources/testHTMLJustDocType.html', 'utf8');
		var output1 = parser.parseHTML(validHTML, 'reposGalore');
		var output2 = parser.parseHTML(validHTML, 'repo with spaces');
		var output3 = parser.parseHTML(validHTML, 'repo with bang!');
		var output4 = parser.parseHTML(validHTML, 'query repo?');
		var output5 = parser.parseHTML(validHTML, '\"quotes\"');
		
		assert.equal(output1.repoName, "reposGalore");
		assert.equal(output2.repoName, "repo with spaces");
		assert.equal(output3.repoName, "repo with bang!");
		assert.equal(output4.repoName, "query repo?");
		assert.equal(output5.repoName, '\"quotes\"');
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

describe('Fail to parse broken HTML files', function(){

	it('Does not parse on an unclosed tag -text', function(){
		var invalidHTML = fs.readFileSync('./cli/tests/resources/testHTMLMissingCloseTagText.html', 'utf8');

		test.error(function(){
			parser.parseHTML(invalidHTML, 'repoName');
		});
	});

	it('Does not parse on mismatched tags -text', function(){
		var invalidHTML = fs.readFileSync('./cli/tests/resources/testHTMLMismatchedTagsText.html', 'utf8');
		
		test.error(function(){
			parser.parseHTML(invalidHTML, 'repoName');
		});
	});

});