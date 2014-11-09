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
});

describe('Get text conversion of JSON objects', function() {

    it('Text conversion with porID', function() {
        var textObject = {
            value: "This is a test",
            porID: 1111
        };
        // Since we don't want to insert tags into the HTML, we should just have the text here
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
            attributes: [{name: "por-id", value: "preTag"}]
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
            porID: "preTag"
        };

        assert.equal(htmlWriter.convertPORObjectToHTMLString(tagObject), '<pre por-id="preTag"><b por-id="1234">Hello!</b></pre>');
    });

    it('Pre tags text & whitespace tree', function() {
        var metadata = {
            tag: "pre",
            attributes: [{name: "por-id", value: "preTag"}]
        };
        var textChild2 = {
            value: "Hello!",
            porID: 1234
        };

        var textChild1 = {
            value: "\n\n\t\t",
            porID: "newlinesTabs"
        };

        var textChild3 = {
            value: "\n\nText after newline!",
            porID: "textAndNewline"
        };

        var metadata2 = {
            tag: "b",
            attributes: [{name: "por-id", value: 1234}]
        };
        var secondTagObject = {
            metadata: metadata2,
            children: [textChild2],
            porID: 1234
        };
        var tagObject = {
            metadata: metadata,
            children: [textChild1, secondTagObject, textChild3],
            porID: "preTag"
        };

        assert.equal(htmlWriter.convertPORObjectToHTMLString(tagObject), '<pre por-id="preTag">\n\n\t\t<b por-id="1234">Hello!</b>\n\nText after newline!</pre>');
    });

    it('Create html string from simple tree', function() {
        var metadata = {
            tag: "div",
            attributes: []
        };

        var bodyMetadata = {
            tag: "body",
            attributes: []
        };

        var textChild = {
            value: "Hello!",
            porID: 1234
        };
        var divObject = {
            metadata: metadata,
            children: [textChild],
            porID: "divObject"
        };

        var bodyObject = {
            metadata: bodyMetadata,
            children: [divObject],
            porID: "bodyObject"
        };

        //We currently have our pretty printer doing 2 indents where it can, so we need 2 spaces after newlines
        //where indents make sense
        assert.equal(htmlWriter.convertPORObjectToHTMLString(bodyObject), '<body>\n  <div>Hello!</div>\n</body>');
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

        assert.equal(htmlWriter.convertTagNodeToHTMLString(tagObject), '<head>Foo <span id="newSpan">Inner span text </span></head>');
    });

});

describe('Test creation of por object from repo', function() {

    it('Create por object from a complex tree', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'testRepo', 'test');

        var porObject = {
        porID: "test",
        metadata: {'constructionOrder':["doctype","3e61894fe84fd31246460272"]},
        children: [{value:'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">', porID:"test"},
                   {porID:"3e61894fe84fd31246460272",
                        metadata: { 'tag': 'html',
                                    'attributes': [],
                                    'constructionOrder': [ '18eda53718376a1c58837e6e', '32bb8c5780eb0cbd283bc7a0' ] }, 
                        children:[ { porID: '18eda53718376a1c58837e6e',
                                        metadata: { 'tag': 'head',
                                                    'attributes': [ {'name':"lang",'value':"en"} ],
                                                    'constructionOrder': [ '9e2928948e789fe743dd9761', '5376f5329b6e80a8d7934c62' ] },
                                        children: [ { porID: '9e2928948e789fe743dd9761',
                                                    metadata: { 'tag': 'meta', 'attributes': [ {'name':"charset",'value':"UTF-8"} ], 'constructionOrder': [] },
                                                    children: [] },
                                                  { porID: '5376f5329b6e80a8d7934c62',
                                                    metadata: { 'tag': 'title', 'attributes': [], 'constructionOrder': [ '8f422c29094277568d01bde4' ] },
                                                    children: [ { value: 'titletext', porID: '5376f5329b6e80a8d7934c62' } ] } ] },
                                   { porID: '32bb8c5780eb0cbd283bc7a0',
                                        metadata: { 'tag': 'body', 'attributes': [], 'constructionOrder': [ 'derp' ] },
                                        children: [ { porID: 'derp', 
                                                      metadata: { 'tag': 'h1',
                                                      'attributes': [ {'name':"id",'value':"derp"},{'name':"class",'value':"herp"},{'name':"name",'value':"headerOne"} ],
                                                      'constructionOrder': 
                                                          [ '63572ec1ae7313a2e128e0fe',
                                                            '5892268b7a3588982d7042eb',
                                                            '058f9fbe9cc061d2b819c905' ] }, 
                                                      children: [ { value: 'Header ', porID: 'derp' },
                                                                  { porID: '5892268b7a3588982d7042eb',
                                                                    metadata: { 'tag': 'span', 'attributes': [], 'constructionOrder': [] },
                                                                    children: [] },
                                                                  { value: ' afterSpan', porID: 'derp' } ] } ] } ] } ] };
        assert.equal(JSON.stringify(htmlWriter.getPORObjectFromRepo(pathToGenerationTest)), JSON.stringify(porObject));
    })
});

describe('Test conversion from por object to HTML string', function() {

    it('Convert por object of a complex tree', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'testRepo', 'test');
        var porObj = htmlWriter.getPORObjectFromRepo(pathToGenerationTest);
        var porObjHTML = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n' +
            '<html>\n  \n  <head lang="en">\n    <meta charset="UTF-8"></meta>\n    <title>titletext</title>\n  </head>\n  \n  <body>\n    ' + '' +
            '<h1 id="derp" class="herp" name="headerOne">Header <span></span> afterSpan</h1>\n  </body>\n\n</html>';

        assert.equal(htmlWriter.convertPORObjectToHTMLString(porObj), porObjHTML);

    });

})

describe('Test initialization of local file', function() {

    it('Create html from a complex tree', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'testRepo', 'test');
        var pathToOutputHTML = path.join(currentPath, 'resources', 'htmlInitOutput.html');
        htmlWriter.initializeFile(pathToGenerationTest, pathToOutputHTML);
        assert.doesNotThrow( function() {
            fileExists(pathToOutputHTML);
        } , Error);
    })
});


function fileExists(fileLocation) {
    if (!fs.existsSync(fileLocation)) {
        throw new Error('No file found.');
    }
}