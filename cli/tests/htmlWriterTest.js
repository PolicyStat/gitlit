/**
 * Created by John Kulczak on 10/23/2014.
 */

var htmlWriter = require('../htmlWriter');
var assert = require('assert');
var fs = require("fs");
var path = require("path");

describe('Get opening tag data from JSON objects properly', function() {

    it('Metadata conversion no attributes', function() {
        var metadata = {
            tag: "head",
            attributes: []
        };
        var tagObject = {
            metadata: metadata,
            children: [],
            porID: ""
        };

        assert.equal(htmlWriter.extractOpeningTag(tagObject), '<head>');
    });

    it('Metadata conversion with attributes', function() {
        var metadata = {
            tag: "head",
            attributes: [{name: "id", value: "test1"}, {name: "class", value: "test2"}]
        };
        var tagObject = {
            metadata: metadata,
            children: [],
            porID: ""
        };

        assert.equal(htmlWriter.extractOpeningTag(tagObject), '<head id="test1" class="test2">');
    });

    it('Metadata conversion with special tags', function() {
        var metadata = {
            tag: "br",
            attributes: []
        };
        var tagObject = {
            metadata: metadata,
            children: []
        };

        assert.equal(htmlWriter.extractOpeningTag(tagObject), '<br>');
    });

    it('Metadata conversion with children', function() {
        var metadata = {
            tag: "div",
            attributes: []
        };
        var child = {
            tag: "span",
            attributes: []
        };
        var tagObject = {
            metadata: metadata,
            children: [child]
        };

        assert.equal(htmlWriter.extractOpeningTag(tagObject), '<div>');

        child2 = child;
        tagObject.children.push(child2);
        assert.equal(htmlWriter.extractOpeningTag(tagObject), '<div>');

        child3 = child;
        tagObject.children.push(child3);
        assert.equal(tagObject.children.length, 3);
        assert.equal(htmlWriter.extractOpeningTag(tagObject), '<div>');
    });
});

describe('Get text conversion of JSON objects', function() {

    it('Text conversion with porID', function() {
        var textObject = {
            value: "This is a test",
            porID: 1111
        };
        assert.equal(htmlWriter.convertTextNodeToHTMLString(textObject), 'This is a test');
    });

    it('Text conversion with no POR ID', function() {
        var textObject = {
            value: "Psychic Octo Robot."
        };
        assert.equal(htmlWriter.convertTextNodeToHTMLString(textObject), 'Psychic Octo Robot.');
    });

});

describe('Test converting JSON object into a string', function() {

    it('Create html string from tree with only tags', function() {
        var metadata = {
            tag: "div",
            attributes: [{name: "por-id", value: "abc"}]
        };
        var metadata2 = {
            tag: "span",
            attributes: [{name: "por-id", value: 1234}]
        };
        var secondTagObject = {
            metadata: metadata2,
            children: [],
            porID: 1234
        };
        var tagObject = {
            metadata: metadata,
            children: [secondTagObject],
            porID: "abc"
        };

        assert.equal(htmlWriter.convertPORObjectToHTMLString(tagObject), '<div por-id="abc"><span por-id="1234"></span>\n</div>');
    });

    it('Create html string with pre tags', function() {
        var metadata = {
            tag: "pre",
            attributes: []
        };
        var textChild = {
            value: "Hello!",
            porID: 1234
        };
        var metadata2 = {
            tag: "b",
            attributes: [{name: "por-id", value: 1234}]
        };
        var secondTagObject = {
            metadata: metadata2,
            children: [textChild],
            porID: 1234
        };
        var tagObject = {
            metadata: metadata,
            children: [secondTagObject],
            porID: "owienvo"
        };

        assert.equal(htmlWriter.convertPORObjectToHTMLString(tagObject), '<pre><b por-id="1234">Hello!</b></pre>');
    });

    it('Create html string from simple tree', function() {
        var metadata = {
            tag: "div",
            attributes: []
        };
        var textChild = {
            value: "Hello!",
            porID: 1234
        };
        var tagObject = {
            metadata: metadata,
            children: [textChild],
            porID: "owienvo"
        };

        assert.equal(htmlWriter.convertPORObjectToHTMLString(tagObject), '<div>Hello!</div>');
    });

    it('Create html string from tree with two tags', function() {
        var metadata = {
            tag: "head",
            attributes: []
        };
        var textChild = {
            value: "Foo ",
            porID: 1234
        };
        var metadata2 = {
            tag: "span",
            attributes: [{name: "id", value: "newSpan"}]
        };
        var textChild2 = {
            value: "Inner span text ",
            porID: 1345
        };
        var tagObjectChild = {
            metadata: metadata2,
            children: [textChild2]
        };
        var tagObject = {
            metadata: metadata,
            children: [textChild, tagObjectChild],
            porID: ""
        };

        assert.equal(htmlWriter.convertTagNodeToHTMLString(tagObject), '<head>Foo<span id="newSpan">Inner span text</span></head>');
    });

    it('Converting a string properly removes unecessary whitespace', function() {
        var metadata = {
            tag: "div",
            attributes: []
        };
        var textChild = {
            value: "     Extra    whitespace  here   . ",
            porID: 1234
        };
        var tagObject = {
            metadata: metadata,
            children: [textChild],
            porID: "test"
        };

        assert.equal(htmlWriter.convertPORObjectToHTMLString(tagObject), '<div>Extra whitespace here .</div>');
    });

});

describe('Test creation of por object from repo', function() {

    it('Create por object from a complex tree', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'testRepo');

        var porObject = {
        porID: "testRepo",
        metadata: {'constructionOrder':["doctype","d9835d3f5428900b9e52c70f"]},
        children: [{value:'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">', porID:"testRepo"},
                   {porID:"d9835d3f5428900b9e52c70f",
                        metadata: { 'tag': 'html',
                                    'attributes': [],
                                    'constructionOrder': [ '54a62d0c502bf19663eb4723', 'fcea086913c5f5dc7b06a4de' ] }, 
                        children:[ { porID: '54a62d0c502bf19663eb4723',
                                        metadata: { 'tag': 'head',
                                                    'attributes': [ {'name':"lang",'value':"en"} ],
                                                    'constructionOrder': [ '90f57321dadf4338b5e71474', 'd5fb38ee71f2bb6998c874a5' ] },
                                        children: [ { porID: '90f57321dadf4338b5e71474',
                                                    metadata: { 'tag': 'meta', 'attributes': [ {'name':"charset",'value':"UTF-8"} ], 'constructionOrder': [] },
                                                    children: [] },
                                                  { porID: 'd5fb38ee71f2bb6998c874a5',
                                                    metadata: { 'tag': 'title', 'attributes': [], 'constructionOrder': [ '223f94230a17fb81e9cce876' ] },
                                                    children: [ { value: 'titletext', porID: 'd5fb38ee71f2bb6998c874a5' } ] } ] },
                                   { porID: 'fcea086913c5f5dc7b06a4de',
                                        metadata: { 'tag': 'body', 'attributes': [], 'constructionOrder': [ 'derp' ] },
                                        children: [ { porID: 'derp', 
                                                      metadata: { 'tag': 'h1',
                                                      'attributes': [ {'name':"id",'value':"derp"},{'name':"class",'value':"herp"},{'name':"name",'value':"headerOne"} ],
                                                      'constructionOrder': 
                                                          [ 'e1e9afb14db3c86d21107e72',
                                                            'f15c70dd19e650c8fe2a1926',
                                                            '1877349f0396f7c7e3ac3ba2' ] }, 
                                                      children: [ { value: 'Header ', porID: 'derp' },
                                                                  { porID: 'f15c70dd19e650c8fe2a1926',
                                                                    metadata: { 'tag': 'span', 'attributes': [], 'constructionOrder': [] },
                                                                    children: [] },
                                                                  { value: ' afterSpan', porID: 'derp' } ] } ] } ] } ] };
        assert.equal(JSON.stringify(htmlWriter.getPORObjectFromRepo(pathToGenerationTest)), JSON.stringify(porObject));
    });

    it("Create por object from small tree", function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'smallRepo');

        var porObject = {
        porID: "smallRepo",
        metadata: {'constructionOrder':["doctype","one"]},
        children: [{value:'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">', porID:"smallRepo"},
                    {porID: "one",
                        metadata: { 'tag': 'html',
                                    'attributes': [],
                                    'constructionOrder': [ 'two' ] }, 
                        children:[ { value:'Text here\n', porID: "one"} ] } ] };

        assert.equal(JSON.stringify(htmlWriter.getPORObjectFromRepo(pathToGenerationTest)), JSON.stringify(porObject));
    });
});

describe('Test conversion from por object to HTML string', function() {

    it('Convert por object of a complex tree', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'testRepo');
        var porObj = htmlWriter.getPORObjectFromRepo(pathToGenerationTest);
        var porObjHTML = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html><head lang="en"><meta charset="UTF-8"></meta><title>titletext</title></head><body><h1 id="derp" class="herp" name="headerOne">Header<span></span>afterSpan</h1></body></html>';

        assert.equal(htmlWriter.convertPORObjectToHTMLString(porObj).replace(/\n| {2,}/g,''), porObjHTML);

    });

    it('Convert simple POR object into a string', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'smallRepo');
        var porObj = htmlWriter.getPORObjectFromRepo(pathToGenerationTest);
        var porObjHTML = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html>Text here</html>';

        assert.ok(porObj.children);
        assert.ok(porObj.children.length == 2);
        assert.ok(porObj.children[1].children.length == 1);
        assert.equal(porObj.children[1].children[0].value, "Text here\n");
        assert.equal(htmlWriter.convertPORObjectToHTMLString(porObj).replace(/\n| {2,}/g,''), porObjHTML);

    });

})

describe('Test initialization of local file', function() {

    it("Throw error if directory doesn't exist", function() {
        assert.throws( function() {
            htmlWriter.initializeFile("./brokenPath", "testRepo");
        } , URIError);
    });

    it('Create html from a complex tree', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'testRepo');
        var pathToOutputHTML = path.join(currentPath, 'resources', 'htmlInitOutput.html');
        htmlWriter.initializeFile(pathToGenerationTest, pathToOutputHTML);
        assert.doesNotThrow( function() {
            fileExists(pathToOutputHTML);
        } , Error);
    });

    it('Create html from a simple POR repository', function() {
        var currentPath = __dirname;
        var pathToSmallTest = path.join(currentPath, 'generationTest', 'smallRepo');
        var pathToOutputHTML = path.join(currentPath, 'generationTest', 'smallOutput.html');

        assert.ok(htmlWriter.initializeFile(pathToSmallTest, pathToOutputHTML));
        assert.doesNotThrow( function() {
            fileExists(pathToOutputHTML);
        } , Error);

        var fileOutput = fs.readFileSync(pathToOutputHTML, "utf-8");
        var fileString = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
        fileString += '\n<html>Text here\n</html>';

        assert.equal(fileOutput, fileString);
    });
});


function fileExists(fileLocation) {
    if (!fs.existsSync(fileLocation)) {
        throw new Error('No file found.');
    }
}