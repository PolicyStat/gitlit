/**
 * Created by Devon Timaeus on 11/11/2014.
 */

var htmlWriter = require('../htmlWriter');
var repoInit = require("../repoInit.js");
var parser = require('../htmlParser');
var assert = require('assert');
var path = require("path");
var fs = require("fs");

describe('Round Trip Testing:', function () {

    it('Complex object with attributes', function () {
        var porObject = {
            porID: "test",
            metadata: {'constructionOrder': ["doctype", "3e61894fe84fd31246460272"]},
            children: [
                {value: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">', porID: "doctype"},
                {porID: "3e61894fe84fd31246460272",
                    metadata: { 'tag': 'html',
                        'attributes': [
                            {"name": "por-id", "value": "3e61894fe84fd31246460272"}
                        ],
                        'constructionOrder': [ '18eda53718376a1c58837e6e', '32bb8c5780eb0cbd283bc7a0' ] },
                    children: [
                        { porID: '18eda53718376a1c58837e6e',
                            metadata: { 'tag': 'head',
                                'attributes': [
                                    {'name': "lang", 'value': "en"},
                                    {"name": "por-id", "value": "18eda53718376a1c58837e6e"}
                                ],
                                'constructionOrder': [ '9e2928948e789fe743dd9761', '5376f5329b6e80a8d7934c62' ] },
                            children: [
                                { porID: '9e2928948e789fe743dd9761',
                                    metadata: { 'tag': 'meta', 'attributes': [
                                        {'name': "charset", 'value': "UTF-8"},
                                        {"name": "por-id", "value": "9e2928948e789fe743dd9761"}
                                    ], 'constructionOrder': [] },
                                    children: [] },
                                { porID: '5376f5329b6e80a8d7934c62',
                                    metadata: { 'tag': 'title', 'attributes': [
                                        {"name": "por-id", "value": "5376f5329b6e80a8d7934c62"}
                                    ], 'constructionOrder': [ '8f422c29094277568d01bde4' ] },
                                    children: [
                                        { value: 'titletext', porID: '8f422c29094277568d01bde4' }
                                    ] }
                            ] },
                        { porID: '32bb8c5780eb0cbd283bc7a0',
                            metadata: { 'tag': 'body', 'attributes': [
                                {"name": "por-id", "value": "32bb8c5780eb0cbd283bc7a0"}
                            ], 'constructionOrder': [ 'derp' ] },
                            children: [
                                { porID: 'derp',
                                    metadata: { 'tag': 'h1',
                                        'attributes': [
                                            {'name': "id", 'value': "derp"},
                                            {'name': "class", 'value': "herp"},
                                            {'name': "name", 'value': "headerOne"},
                                            {"name": "por-id", "value": "derp"}
                                        ],
                                        'constructionOrder': [ '63572ec1ae7313a2e128e0fe',
                                            '5892268b7a3588982d7042eb',
                                            '058f9fbe9cc061d2b819c905' ] },
                                    children: [
                                        { value: 'Header ', porID: '63572ec1ae7313a2e128e0fe' },
                                        { porID: '5892268b7a3588982d7042eb',
                                            metadata: { 'tag': 'span', 'attributes': [
                                                {"name": "por-id", "value": "5892268b7a3588982d7042eb"}
                                            ], 'constructionOrder': [] },
                                            children: [] },
                                        { value: ' afterSpan', porID: '058f9fbe9cc061d2b819c905' }
                                    ] }
                            ] }
                    ] }
            ] };
        testRoundTripOnObject(porObject, 'baseOutputFile.html', 'roundTripBasic', 'roundTripOutput_Base.html');

    });

    it('Object with basic formatting', function () {
        var porObject = {porID: "testHTMLBasicFormat", metadata: {"constructionOrder": ["doctype", "95920963fa52e944add2f34d"]},
            children: [
                {value: "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">", porID: "doctype"},
                {porID: "95920963fa52e944add2f34d",
                    metadata: {"tag": "html", "attributes": [
                        {"name": "por-id", "value": "95920963fa52e944add2f34d"}
                    ], "constructionOrder": ["c2df015809050d95722c5129", "550eec4fd617089ec34b5821"]},
                    children: [
                        {porID: "c2df015809050d95722c5129",
                            metadata: {"tag": "head", "attributes": [
                                {"name": "por-id", "value": "c2df015809050d95722c5129"}
                            ], "constructionOrder": ["id1"]},
                            children: [
                                {porID: "id1",
                                    metadata: {"tag": "title", "attributes": [
                                        {"name": "por-id", "value": "id1"}
                                    ], "constructionOrder": ["5b778ad71fe839df5eb628bb"]},
                                    children: [
                                        {value: "\r\n\t\t\tSuper basic formatted html\r\n\t\t", porID: "5b778ad71fe839df5eb628bb"}
                                    ]
                                }
                            ]
                        },
                        {porID: "550eec4fd617089ec34b5821",
                            metadata: {"tag": "body", "attributes": [
                                {"name": "por-id", "value": "550eec4fd617089ec34b5821"}
                            ], "constructionOrder": ["id2"]},
                            children: [
                                {porID: "id2",
                                    metadata: {"tag": "h1", "attributes": [
                                        {"name": "por-id", "value": "id2"}
                                    ], "constructionOrder": ["a93d4b97d1eac9e23e5b3ef0", "id3", "36c77f6633e16fd853ac652f"]},
                                    children: [
                                        {value: "\r\n\t\t\tpreSpan\r\n\t\t\t", porID: "a93d4b97d1eac9e23e5b3ef0"},
                                        {porID: "id3",
                                            metadata: {"tag": "span", "attributes": [
                                                {"name": "por-id", "value": "id3"}
                                            ], "constructionOrder": ["ebc3ea2cad0c915fc83463ed"]},
                                            children: [
                                                {value: "\r\n\t\t\t\tinSpan\r\n\t\t\t", porID: "ebc3ea2cad0c915fc83463ed"}
                                            ]},
                                        {value: "\r\n\t\t\tpostSpan\r\n\t\t", porID: "36c77f6633e16fd853ac652f"}
                                    ]
                                }
                            ]
                        }
                    ]}
            ]};
        testRoundTripOnObject(porObject, 'formattingOutputFile.html', 'roundTripFormatting', 'roundTripOutput_Formatting.html');

    });

    it('Just Doctype definition', function () {
        var porObject = {porID: "testHTMLJustDoctype", metadata: {"constructionOrder": ["doctype", "09f35ea82117f977494710ac"]}, children: [
            {value: "<!DOCTYPE html PUBLIC \"-//W3C//DTD XHTML 1.0 Strict//EN\" \"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd\">", porID: "doctype"},
            {porID: "09f35ea82117f977494710ac", metadata: {"tag": "html", "attributes": [
                {"name": "por-id", "value": "09f35ea82117f977494710ac"}
            ], "constructionOrder": ["977dbd0a1f8cca2919295e9a", "e7a54ae48ddaf227fbe4676d"]}, children: [
                {porID: "977dbd0a1f8cca2919295e9a", metadata: {"tag": "head", "attributes": [
                    {"name": "por-id", "value": "977dbd0a1f8cca2919295e9a"}
                ], "constructionOrder": []}, children: []},
                {porID: "e7a54ae48ddaf227fbe4676d", metadata: {"tag": "body", "attributes": [
                    {"name": "por-id", "value": "e7a54ae48ddaf227fbe4676d"}
                ], "constructionOrder": []}, children: []}
            ]}
        ]};
        testRoundTripOnObject(porObject, 'doctypeOnly.html', 'roundTripDoctypeOnly', 'roundTripOutput_DoctypeOnly.html');

    });

});

function testRoundTripOnObject(porObject, baseFileName, repoName, roundTrippedFileName) {
    var currentPath = __dirname;
    var pathToGeneratedFile = path.join(currentPath, 'resources', 'roundTripTesting', baseFileName);

    htmlWriter.writePORObjectToHTMLFile(porObject, pathToGeneratedFile);
    assert.ok(fs.existsSync(pathToGeneratedFile));

    //Now that we have a file that was made from a POR object, if we run this through the whole
    //round-trip, it should be the same before and after.
    var pathToRepoOutput = path.join(currentPath, 'resources', 'roundTripTesting');

    repoInit.initializeRepository(pathToGeneratedFile, pathToRepoOutput, repoName);
    pathToRepoOutput = path.join(pathToRepoOutput, repoName);
    assert.ok(fs.existsSync(pathToRepoOutput));

    var pathToRoundTripFile = path.join(currentPath, 'resources', 'roundTripTesting', roundTrippedFileName);
    htmlWriter.generateFile(pathToRepoOutput, pathToRoundTripFile);
    assert.ok(fs.existsSync(pathToRoundTripFile));

    var roundTripContents = repoInit.getFileContents(pathToRoundTripFile);
    var baseContents = repoInit.getFileContents(pathToGeneratedFile);
    assert.equal(baseContents, roundTripContents);

}



describe("First tests: Reading the file", function() {

    it("Grabbing file extension", function() {
        var currentPath = __dirname;
        var pathToGeneratedFile = path.join(currentPath, 'conversionTest', 'testFullConversion.html');
        assert.equal(repoInit.getExtension(pathToGeneratedFile), 'html');
    });

    it("Getting file contents", function() {
        var currentPath = __dirname;
        var pathToGeneratedFile = path.join(currentPath, 'conversionTest', 'testFullConversion.html');
        var fileContents = repoInit.getFileContents(pathToGeneratedFile);
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
    var currentPath = __dirname;
    var pathToGeneratedFile = path.join(currentPath, 'conversionTest', 'testFullConversion.html');
    var fileContents = repoInit.getFileContents(pathToGeneratedFile);
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
    var currentPath = __dirname;
    var pathToGeneratedFile = path.join(currentPath, 'conversionTest', 'testFullConversion.html');
    var pathToGeneratedRepo = path.join(currentPath, 'conversionTest');
    repoInit.initializeRepository(pathToGeneratedFile, pathToGeneratedRepo, 'testRepo');

    it("Checking that the directory was created", function() {
        assert.ok(fs.existsSync(pathToGeneratedRepo + "/testRepo"));
        assert.equal(fs.readdirSync(pathToGeneratedRepo + "/testRepo").length, 3);
        assert.ok(fs.existsSync(pathToGeneratedRepo + "/testRepo/metadata.json"));
    });

    it("Checking the contents of several files in the directory", function() {
        assert.ok(JSON.parse(fs.readFileSync(pathToGeneratedRepo + "/testRepo/metadata.json")).constructionOrder);

        assert.ok(fs.existsSync(pathToGeneratedRepo + "/testRepo/doctype.txt"));
        assert.equal(fs.readFileSync(pathToGeneratedRepo + "/testRepo/doctype.txt", "utf-8").substring(0, 9), '<!DOCTYPE');

        assert.ok(fs.existsSync(pathToGeneratedRepo + "/testRepo/html"));
        assert.ok(fs.existsSync(pathToGeneratedRepo + "/testRepo/html/head"));
        assert.ok(fs.existsSync(pathToGeneratedRepo + "/testRepo/html/head/title"));
        assert.ok(fs.existsSync(pathToGeneratedRepo + "/testRepo/html/head/title/metadata.json"));

        assert.equal(JSON.parse(fs.readFileSync(pathToGeneratedRepo + "/testRepo/html/head/title/metadata.json")).tag, "title");
    });
});

describe("Test writing repo directory back into HTML file", function() {
    var currentPath = __dirname;
    var pathToGeneratedRepo = path.join(currentPath, 'conversionTest');
    htmlWriter.generateFile(pathToGeneratedRepo + "/testRepo", pathToGeneratedRepo + "/testFile.html");

    it("Checking that the html file was created", function() {
        assert.ok(fs.existsSync(pathToGeneratedRepo + "/testFile.html"));
    });

    it("Checking the contents of the html file", function() {
        var fileContents = fs.readFileSync(pathToGeneratedRepo + "/testFile.html", "utf-8");
        fileString = fileContents.replace(/\n| {2,}/g,'');

        var testFileString = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
        testFileString += '<html id="html"><head id="head" lang="en"><meta id="meta" charset="UTF-8"><title id="title">Title Here</title></head><body></body></html>';

        assert.equal(fileString, testFileString);
    });
});

describe("Sending the new HTML file back through repo/html generation", function() {
    var currentPath = __dirname;
    var pathToGeneratedFile = path.join(currentPath, 'conversionTest', 'testFile.html');
    var pathToGeneratedRepo = path.join(currentPath, 'conversionTest');
    repoInit.initializeRepository(pathToGeneratedFile, pathToGeneratedRepo, 'testRepoRepeat');
    htmlWriter.generateFile(pathToGeneratedRepo + "/testRepoRepeat", pathToGeneratedRepo + "/testFileRepeat.html");

    it("Checking that the html file was created", function() {
        assert.ok(fs.existsSync("./cli/tests/conversionTest/testFileRepeat.html"));
    });

    it("Checking the contents of the html file", function() {
        var oldFileContents = fs.readFileSync(pathToGeneratedRepo + "/testFile.html", "utf-8");
        var newFileContents = fs.readFileSync(pathToGeneratedRepo + "/testFileRepeat.html", "utf-8");
        assert.equal(oldFileContents, newFileContents);
    });
});


describe("Testing second file sent through repo/html writers", function() {
    var currentPath = __dirname;
    var pathToGeneratedFile = path.join(currentPath, 'conversionTest', 'testFullConversion2.html');
    var pathToGeneratedRepo = path.join(currentPath, 'conversionTest');
    repoInit.initializeRepository(pathToGeneratedFile, pathToGeneratedRepo, 'testRepo2');
    htmlWriter.generateFile(pathToGeneratedRepo + "/testRepo2", pathToGeneratedRepo + "/testFile2.html");

    it("Checking that the html file was created", function() {
        assert.ok(fs.existsSync(pathToGeneratedRepo + "/testFile2.html"));
    });

    // Parser should correctly put the hr tag inside the body tag
    it("Checking the contents of the html file", function() {
        var fileContents = fs.readFileSync(pathToGeneratedRepo + "/testFile2.html", "utf-8");
        fileString = fileContents.replace(/\n| {2,}/g,'');

        var testFile2String = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
        testFile2String += '<html><head></head><body><hr><h1 class="header" style="color:green">Header</h1></body></html>';

        assert.equal(fileString, testFile2String);
    });
});


describe("Testing third file sent through repo/html writers", function() {
    var currentPath = __dirname;
    var pathToGeneratedFile = path.join(currentPath, 'conversionTest', 'testFullConversion3.html');
    var pathToGeneratedRepo = path.join(currentPath, 'conversionTest');
    repoInit.initializeRepository(pathToGeneratedFile, pathToGeneratedRepo, 'testRepo3');
    htmlWriter.generateFile(pathToGeneratedRepo + "/testRepo3", pathToGeneratedRepo + "/testFile3.html");

    it("Checking that the html file was created", function() {
        assert.ok(fs.existsSync(pathToGeneratedRepo + "/testFile3.html"));
    });

    // Parser should correctly put the div tags and everything inside under a body tag
    it("Checking the contents of the html file", function() {
        var fileContents = fs.readFileSync(pathToGeneratedRepo + "/testFile3.html", "utf-8");
        fileString = fileContents.replace(/\n| {2,}/g,'');

        var testFile3String = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
        testFile3String += '<html><head></head><body><div><span>Span Text</span><br><h3 id="headerTwo" class="test">Underline</h3></div></body></html>';

        assert.equal(fileString, testFile3String);
    });
});