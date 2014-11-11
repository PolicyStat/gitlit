/**
 * Created by Devon Timaeus on 11/11/2014.
 */

var htmlWriter = require('../htmlWriter');
var assert = require('assert');
var path = require("path");
var fs = require("fs");

describe('Round Trip Testing:', function () {

    it('When run on output of write function, round trip works', function () {
        var currentPath = __dirname;
        var pathToGeneratedFile = path.join(currentPath, 'resources', 'roundTripTesting', 'baseOutputFile.html');

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

        htmlWriter.writeHTMLFile(porObject, pathToGeneratedFile);

        assert.ok(fs.existsSync(pathToGeneratedFile));
    });

});

