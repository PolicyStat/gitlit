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
        assert.equal(htmlWriter.convertTextNodeToHTMLString(textObject), '<por-text por-id=1111>This is a test</por-text>');
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
            tag: "html",
            attributes: []
        };
        var metadata2 = {
            tag: "br",
            attributes: []
        };
        var secondTagObject = {
            metadata: metadata2,
            children: []
        }
        var tagObject = {
            metadata: metadata,
            children: [secondTagObject]
        };

        assert.equal(htmlWriter.convertTagNodeToHTMLString(tagObject), '<html><br></br></html>');
    });

    it('Create html string from simple tree', function() {
        var metadata = {
            tag: "head",
            attributes: []
        };
        var textChild = {
            value: "Hello!",
            porID: 1234
        };
        var tagObject = {
            metadata: metadata,
            children: [textChild],
            porID: ""
        };

        assert.equal(htmlWriter.convertTagNodeToHTMLString(tagObject), '<head><por-text por-id=1234>Hello!</por-text></head>');
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

        assert.equal(htmlWriter.convertTagNodeToHTMLString(tagObject), '<head><por-text por-id=1234>Foo </por-text><span id="newSpan"><por-text por-id=1345>Inner span text </por-text></span></head>');
    });

});

describe('Test creation of por object from repo', function() {

    it('Create por object from HTML with very basic formatting', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'resources', 'sampleRepos', 'testHTMLBasicFormat');
        var porObject = {porID:"testHTMLBasicFormat",metadata: {"constructionOrder":["doctype","95920963fa52e944add2f34d"]}, children: [{value:"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">",porID:"testHTMLBasicFormat"}, {porID:"95920963fa52e944add2f34d", metadata:{"tag":"html","attributes":[],"constructionOrder":["c2df015809050d95722c5129","550eec4fd617089ec34b5821"]}, children: [{porID:"c2df015809050d95722c5129", metadata:{"tag":"head","attributes":[],"constructionOrder":["id1"]}, children: [{porID:"id1", metadata:{"tag":"title","attributes":[{"name":"por-id","value":"id1"}],"constructionOrder":["5b778ad71fe839df5eb628bb"]}, children: [{value:"\n\t\t\tSuper basic formatted html\n\t\t",porID:"id1"}] }] }, {porID:"550eec4fd617089ec34b5821", metadata:{"tag":"body","attributes":[],"constructionOrder":["id2"]}, children: [{porID:"id2", metadata:{"tag":"h1","attributes":[{"name":"por-id","value":"id2"}],"constructionOrder":["a93d4b97d1eac9e23e5b3ef0","id3","36c77f6633e16fd853ac652f"]}, children: [{value:"\n\t\t\tpreSpan\n\t\t\t",porID:"id2"}, {porID:"id3", metadata:{"tag":"span","attributes":[{"name":"por-id","value":"id3"}],"constructionOrder":["ebc3ea2cad0c915fc83463ed"]}, children: [{value:"\n\t\t\t\tinSpan\n\t\t\t",porID:"id3"}]},{value:"\n\t\t\tpostSpan\n\t\t",porID:"id2"}] }] }]}]};
        
        assert.equal(JSON.stringify(htmlWriter.getPORObjectFromRepo(pathToGenerationTest)), JSON.stringify(porObject));
    })

    it('Create por object from a document with inline format', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'resources', 'sampleRepos', 'testHTMLInlineFormat');
        var porObject = {porID:"testHTMLInlineFormat",metadata:{"constructionOrder":["doctype","7db330ba8e9beece5062fd2e"]},children:[{value:"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">",porID:"testHTMLInlineFormat"},{porID:"7db330ba8e9beece5062fd2e",metadata:{"tag":"html","attributes":[],"constructionOrder":["0a7e9b49533fc5f65d6686c8","a826d5b54fd832d759250004"]},children:[{porID:"0a7e9b49533fc5f65d6686c8",metadata:{"tag":"head","attributes":[],"constructionOrder":["id1"]},children:[{porID:"id1",metadata:{"tag":"title","attributes":[{"name":"por-id","value":"id1"}],"constructionOrder":["4fdbbfa4a09f4e32914448f5"]},children:[{value:"Super basic formatted html",porID:"id1"}]}]},{porID:"a826d5b54fd832d759250004",metadata:{"tag":"body","attributes":[],"constructionOrder":["id2"]},children:[{porID:"id2",metadata:{"tag":"h1","attributes":[{"name":"por-id","value":"id2"}],"constructionOrder":["e9702122daa7d73cbadee71e","id3","b6d8eb2a78c4c6ebabe06038"]},children:[{value:"preSpan",porID:"id2"},{porID:"id3",metadata:{"tag":"span","attributes":[{"name":"por-id","value":"id3"}],"constructionOrder":["0c206a96c11299af9acc8319"]},children:[{value:"inSpan",porID:"id3"}]},{value:"postSpan",porID:"id2"}]}]}]}]};
        
        assert.equal(JSON.stringify(htmlWriter.getPORObjectFromRepo(pathToGenerationTest)), JSON.stringify(porObject));
    })

    it('Create por object from a document with only a doctype definition', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'resources', 'sampleRepos', 'testHTMLJustDoctype');
        var porObject = {porID:"testHTMLJustDoctype",metadata:{"constructionOrder":["doctype","09f35ea82117f977494710ac"]},children:[{value:"<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">",porID:"testHTMLJustDoctype"},{porID:"09f35ea82117f977494710ac",metadata:{"tag":"html","attributes":[],"constructionOrder":["977dbd0a1f8cca2919295e9a","e7a54ae48ddaf227fbe4676d"]},children:[{porID:"977dbd0a1f8cca2919295e9a",metadata:{"tag":"head","attributes":[],"constructionOrder":[]},children:[]},{porID:"e7a54ae48ddaf227fbe4676d",metadata:{"tag":"body","attributes":[],"constructionOrder":[]},children:[]}]}]};
        
        assert.equal(JSON.stringify(htmlWriter.getPORObjectFromRepo(pathToGenerationTest)), JSON.stringify(porObject));
    })

    it('Create por object from a complex tree', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'testRepo', 'test');
        var porObject = { porID: "test", metadata: {'constructionOrder':["doctype","3e61894fe84fd31246460272"]}, children: [{value:'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">', porID:"test"}, {porID:"3e61894fe84fd31246460272", metadata: { 'tag': 'html', 'attributes': [], 'constructionOrder': [ '18eda53718376a1c58837e6e', '32bb8c5780eb0cbd283bc7a0' ] }, children:[ { porID: '18eda53718376a1c58837e6e', metadata: { 'tag': 'head', 'attributes': [ {'name':"lang",'value':"en"} ], 'constructionOrder': [ '9e2928948e789fe743dd9761', '5376f5329b6e80a8d7934c62' ] }, children: [ { porID: '9e2928948e789fe743dd9761', metadata: { 'tag': 'meta', 'attributes': [ {'name':"charset",'value':"UTF-8"} ], 'constructionOrder': [] }, children: [] }, { porID: '5376f5329b6e80a8d7934c62', metadata: { 'tag': 'title', 'attributes': [], 'constructionOrder': [ '8f422c29094277568d01bde4' ] }, children: [ { value: 'titletext', porID: '5376f5329b6e80a8d7934c62' } ] } ] }, { porID: '32bb8c5780eb0cbd283bc7a0', metadata: { 'tag': 'body', 'attributes': [], 'constructionOrder': [ 'derp' ] }, children: [ { porID: 'derp', metadata: { 'tag': 'h1', 'attributes': [ {'name':"id",'value':"derp"},{'name':"class",'value':"herp"},{'name':"name",'value':"headerOne"} ], 'constructionOrder': [ '63572ec1ae7313a2e128e0fe', '5892268b7a3588982d7042eb', '058f9fbe9cc061d2b819c905' ] }, children: [ { value: 'Header ', porID: 'derp' }, { porID: '5892268b7a3588982d7042eb', metadata: { 'tag': 'span', 'attributes': [], 'constructionOrder': [] }, children: [] }, { value: ' afterSpan', porID: 'derp' } ] } ] } ] } ] };
        
        assert.equal(JSON.stringify(htmlWriter.getPORObjectFromRepo(pathToGenerationTest)), JSON.stringify(porObject));
    })
});

describe('Test conversion from por object to HTML string', function() {

    it('Convert por object of just a doctype definition', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'resources', 'sampleRepos', 'testHTMLJustDoctype');
        var porObj = htmlWriter.getPORObjectFromRepo(pathToGenerationTest);
        var porObjHTML = '<por-text por-id=testHTMLJustDoctype><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"></por-text><html><head></head><body></body></html>';

        assert.equal(htmlWriter.convertPORObjectToHTMLString(porObj), porObjHTML);

    });

    it('Convert por object of HTML with inline formatting', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'resources', 'sampleRepos', 'testHTMLInlineFormat');
        var porObj = htmlWriter.getPORObjectFromRepo(pathToGenerationTest);
        var porObjHTML = '<por-text por-id=testHTMLInlineFormat><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"></por-text><html><head><title por-id="id1"><por-text por-id=id1>Super basic formatted html</por-text></title></head><body><h1 por-id="id2"><por-text por-id=id2>preSpan</por-text><span por-id="id3"><por-text por-id=id3>inSpan</por-text></span><por-text por-id=id2>postSpan</por-text></h1></body></html>';

        assert.equal(htmlWriter.convertPORObjectToHTMLString(porObj), porObjHTML);

    });

    it('Convert por object of HTML with basic formatting', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'resources', 'sampleRepos', 'testHTMLBasicFormat');
        var porObj = htmlWriter.getPORObjectFromRepo(pathToGenerationTest);
        var porObjHTML = '<por-text por-id=testHTMLBasicFormat><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"></por-text><html><head><title por-id="id1"><por-text por-id=id1>\n\t\t\tSuper basic formatted html\n\t\t</por-text></title></head><body><h1 por-id="id2"><por-text por-id=id2>\n\t\t\tpreSpan\n\t\t\t</por-text><span por-id="id3"><por-text por-id=id3>\n\t\t\t\tinSpan\n\t\t\t</por-text></span><por-text por-id=id2>\n\t\t\tpostSpan\n\t\t</por-text></h1></body></html>';
        
        assert.equal(htmlWriter.convertPORObjectToHTMLString(porObj), porObjHTML);

    });

    it('Convert por object of a complex tree', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'testRepo', 'test');
        var porObj = htmlWriter.getPORObjectFromRepo(pathToGenerationTest);
        var porObjHTML = '<por-text por-id=test><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"></por-text><html><head lang="en"><meta charset="UTF-8"></meta><title><por-text por-id=5376f5329b6e80a8d7934c62>titletext</por-text></title></head><body><h1 id="derp" class="herp" name="headerOne"><por-text por-id=derp>Header </por-text><span></span><por-text por-id=derp> afterSpan</por-text></h1></body></html>';

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