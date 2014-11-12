/**
 * Created by John Kulczak on 10/23/2014.
 */

var htmlWriter = require('../htmlWriter');
var assert = require('assert');
var path = require("path");
var fs = require("fs");

describe('Get opening tag data from JSON objects properly', function () {

    it('Metadata conversion no attributes', function () {
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

    it('Metadata conversion with attributes', function () {
        var metadata = {
            tag: "head",
            attributes: [
                {name: "id", value: "test1"},
                {name: "class", value: "test2"}
            ]
        };
        var tagObject = {
            metadata: metadata,
            children: [],
            porID: ""
        };

        assert.equal(htmlWriter.extractOpeningTag(tagObject), '<head id="test1" class="test2">');
    });

    it('Metadata conversion with special tags', function () {
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

describe('Get text conversion of POR objects', function () {

    it('Text conversion with porID', function () {
        var textObject = {
            value: "This is a test",
            porID: 1111
        };

        // Since we don't want to insert tags into the HTML, we should just have the text here
        assert.equal(htmlWriter.convertTextNodeToHTMLString(textObject), 'This is a test');
    });

    it('Text conversion with no POR ID', function () {
        var textObject = {
            value: "Psychic Octo Robot."
        };
        assert.equal(htmlWriter.convertTextNodeToHTMLString(textObject), 'Psychic Octo Robot.');
    });

});

describe('Test converting POR object into a string', function () {

    it('Create html string from tree with only tags', function () {
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

    it('Create html string from simple tree', function () {
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

    it('Create html string from tree with two tags', function () {
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
            attributes: [
                {name: "id", value: "newSpan"}
            ]
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


    it('Convert por object of a complex tree', function () {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'testRepo', 'test');
        var porObj = htmlWriter.getPORObjectFromRepo(pathToGenerationTest);
        var porObjHTML = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n' +
            '<html>\n  \n  <head lang="en">\n    <meta charset="UTF-8"></meta>\n    <title>titletext</title>\n  </head>' +
            '\n  \n  <body>\n    <h1 id="derp" class="herp" name="headerOne">Header <span>' +
            '</span> afterSpan</h1>\n  </body>\n\n</html>';

        assert.equal(htmlWriter.convertPORObjectToHTMLString(porObj), porObjHTML);

    });

    it('Convert por object', function () {
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

describe('Test creation of por object from repo', function () {

    it('Create por object from HTML with very basic formatting', function () {
        var porObject = {porID: "testHTMLBasicFormat", metadata: {"constructionOrder": ["doctype", "95920963fa52e944add2f34d"]},
            children: [
                {value: "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">", porID: "testHTMLBasicFormat"},
                {porID: "95920963fa52e944add2f34d",
                    metadata: {"tag": "html", "attributes": [], "constructionOrder": ["c2df015809050d95722c5129", "550eec4fd617089ec34b5821"]},
                    children: [
                        {porID: "c2df015809050d95722c5129",
                            metadata: {"tag": "head", "attributes": [], "constructionOrder": ["id1"]},
                            children: [
                                {porID: "id1",
                                    metadata: {"tag": "title", "attributes": [
                                        {"name": "por-id", "value": "id1"}
                                    ], "constructionOrder": ["5b778ad71fe839df5eb628bb"]},
                                    children: [
                                        {value: "\n\t\t\tSuper basic formatted html\n\t\t", porID: "id1"}
                                    ]
                                }
                            ]
                        },
                        {porID: "550eec4fd617089ec34b5821",
                            metadata: {"tag": "body", "attributes": [], "constructionOrder": ["id2"]},
                            children: [
                                {porID: "id2",
                                    metadata: {"tag": "h1", "attributes": [
                                        {"name": "por-id", "value": "id2"}
                                    ], "constructionOrder": ["a93d4b97d1eac9e23e5b3ef0", "id3", "36c77f6633e16fd853ac652f"]},
                                    children: [
                                        {value: "\n\t\t\tpreSpan\n\t\t\t", porID: "id2"},
                                        {porID: "id3",
                                            metadata: {"tag": "span", "attributes": [
                                                {"name": "por-id", "value": "id3"}
                                            ], "constructionOrder": ["ebc3ea2cad0c915fc83463ed"]},
                                            children: [
                                                {value: "\n\t\t\t\tinSpan\n\t\t\t", porID: "id3"}
                                            ]},
                                        {value: "\n\t\t\tpostSpan\n\t\t", porID: "id2"}
                                    ]
                                }
                            ]
                        }
                    ]}
            ]};
        var currentPath = __dirname;

        var pathToGenerationTest = path.join(currentPath, 'resources', 'sampleRepos', 'testHTMLBasicFormat');
        assert.equal(JSON.stringify(htmlWriter.getPORObjectFromRepo(pathToGenerationTest)), JSON.stringify(porObject));
    });

    it('Create por object from a document with inline format', function () {
        var porObject = {porID: "testHTMLInlineFormat", metadata: {"constructionOrder": ["doctype", "7db330ba8e9beece5062fd2e"]}, children: [
            {value: "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">", porID: "testHTMLInlineFormat"},
            {porID: "7db330ba8e9beece5062fd2e", metadata: {"tag": "html", "attributes": [], "constructionOrder": ["0a7e9b49533fc5f65d6686c8", "a826d5b54fd832d759250004"]}, children: [
                {porID: "0a7e9b49533fc5f65d6686c8", metadata: {"tag": "head", "attributes": [], "constructionOrder": ["id1"]}, children: [
                    {porID: "id1", metadata: {"tag": "title", "attributes": [
                        {"name": "por-id", "value": "id1"}
                    ], "constructionOrder": ["4fdbbfa4a09f4e32914448f5"]}, children: [
                        {value: "Super basic formatted html", porID: "id1"}
                    ]}
                ]},
                {porID: "a826d5b54fd832d759250004", metadata: {"tag": "body", "attributes": [], "constructionOrder": ["id2"]}, children: [
                    {porID: "id2", metadata: {"tag": "h1", "attributes": [
                        {"name": "por-id", "value": "id2"}
                    ], "constructionOrder": ["e9702122daa7d73cbadee71e", "id3", "b6d8eb2a78c4c6ebabe06038"]}, children: [
                        {value: "preSpan", porID: "id2"},
                        {porID: "id3", metadata: {"tag": "span", "attributes": [
                            {"name": "por-id", "value": "id3"}
                        ], "constructionOrder": ["0c206a96c11299af9acc8319"]}, children: [
                            {value: "inSpan", porID: "id3"}
                        ]},
                        {value: "postSpan", porID: "id2"}
                    ]}
                ]}
            ]}
        ]};
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'resources', 'sampleRepos', 'testHTMLInlineFormat');
        assert.equal(JSON.stringify(htmlWriter.getPORObjectFromRepo(pathToGenerationTest)), JSON.stringify(porObject));
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

    it('Create por object from a document with only a doctype definition', function () {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'resources', 'sampleRepos', 'testHTMLJustDoctype');

        var porObject = {porID: "testHTMLJustDoctype", metadata: {"constructionOrder": ["doctype", "09f35ea82117f977494710ac"]}, children: [
            {value: "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">", porID: "testHTMLJustDoctype"},
            {porID: "09f35ea82117f977494710ac", metadata: {"tag": "html", "attributes": [], "constructionOrder": ["977dbd0a1f8cca2919295e9a", "e7a54ae48ddaf227fbe4676d"]}, children: [
                {porID: "977dbd0a1f8cca2919295e9a", metadata: {"tag": "head", "attributes": [], "constructionOrder": []}, children: []},
                {porID: "e7a54ae48ddaf227fbe4676d", metadata: {"tag": "body", "attributes": [], "constructionOrder": []}, children: []}
            ]}
        ]};
        assert.equal(JSON.stringify(htmlWriter.getPORObjectFromRepo(pathToGenerationTest)), JSON.stringify(porObject));
    });

    it('Create por object from a complex tree', function () {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'testRepo', 'test');

        var porObject = {
            porID: "test",
            metadata: {'constructionOrder': ["doctype", "3e61894fe84fd31246460272"]},
            children: [
                {value: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">', porID: "test"},
                {porID: "3e61894fe84fd31246460272",
                    metadata: { 'tag': 'html',
                        'attributes': [],
                        'constructionOrder': [ '18eda53718376a1c58837e6e', '32bb8c5780eb0cbd283bc7a0' ] },
                    children: [
                        { porID: '18eda53718376a1c58837e6e',
                            metadata: { 'tag': 'head',
                                'attributes': [
                                    {'name': "lang", 'value': "en"}
                                ],
                                'constructionOrder': [ '9e2928948e789fe743dd9761', '5376f5329b6e80a8d7934c62' ] },
                            children: [
                                { porID: '9e2928948e789fe743dd9761',
                                    metadata: { 'tag': 'meta', 'attributes': [
                                        {'name': "charset", 'value': "UTF-8"}
                                    ], 'constructionOrder': [] },
                                    children: [] },
                                { porID: '5376f5329b6e80a8d7934c62',
                                    metadata: { 'tag': 'title', 'attributes': [], 'constructionOrder': [ '8f422c29094277568d01bde4' ] },
                                    children: [
                                        { value: 'titletext', porID: '5376f5329b6e80a8d7934c62' }
                                    ] }
                            ] },
                        { porID: '32bb8c5780eb0cbd283bc7a0',
                            metadata: { 'tag': 'body', 'attributes': [], 'constructionOrder': [ 'derp' ] },
                            children: [
                                { porID: 'derp',
                                    metadata: { 'tag': 'h1',
                                        'attributes': [
                                            {'name': "id", 'value': "derp"},
                                            {'name': "class", 'value': "herp"},
                                            {'name': "name", 'value': "headerOne"}
                                        ],
                                        'constructionOrder': [ '63572ec1ae7313a2e128e0fe',
                                            '5892268b7a3588982d7042eb',
                                            '058f9fbe9cc061d2b819c905' ] },
                                    children: [
                                        { value: 'Header ', porID: 'derp' },
                                        { porID: '5892268b7a3588982d7042eb',
                                            metadata: { 'tag': 'span', 'attributes': [], 'constructionOrder': [] },
                                            children: [] },
                                        { value: ' afterSpan', porID: 'derp' }
                                    ] }
                            ] }
                    ] }
            ] };
        assert.equal(JSON.stringify(htmlWriter.getPORObjectFromRepo(pathToGenerationTest)), JSON.stringify(porObject));
    })
});

describe('Test write of local file', function() {

    it("Throw error if directory doesn't exist", function() {
        assert.throws( function() {
            htmlWriter.generateFile("./brokenPath", "testRepo");
        } , URIError);
    });

    it('Check file created during write operation', function() {
        var currentPath = __dirname;
        var pathToGenerationTest = path.join(currentPath, 'generationTest', 'testRepo');
        var pathToOutputHTML = path.join(currentPath, 'resources', 'htmlInitOutput.html');
        htmlWriter.generateFile(pathToGenerationTest, pathToOutputHTML);
        assert.doesNotThrow( function() {
            fileExists(pathToOutputHTML);
        } , Error);
    });

    it('Create html from a simple POR repository', function() {
        var currentPath = __dirname;
        var pathToSmallTest = path.join(currentPath, 'generationTest', 'smallRepo');
        var pathToOutputHTML = path.join(currentPath, 'generationTest', 'smallOutput.html');

        assert.ok(htmlWriter.generateFile(pathToSmallTest, pathToOutputHTML));
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