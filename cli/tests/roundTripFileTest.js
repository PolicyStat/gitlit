/**
 * Created by Devon Timaeus on 11/11/2014.
 */

var htmlWriter = require('../htmlWriter');
var repoInit = require("../repoInit.js");
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

