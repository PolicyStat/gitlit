/**
 * Created by John Kulczak on 10/23/2014.
 */

var htmlWriter = require('../htmlWriter');
var assert = require('assert');
var fs = require("fs");

describe('Get string representation of JSON objects properly', function() {

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

    it('Text conversion', function() {
        var textObject = {
            value: "This is a test",
            porID: 1111
        };
        assert.equal(htmlWriter.convertTextNodeToHTMLString(textObject), '<por-text por-id=1111>This is a test</por-text>');
    });

});

describe('Test converting JSON object into a string', function() {

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

});

describe('Test initialization of local file', function() {
    it('Creat html from a complex tree', function() {
        htmlWriter.initializeFile('./generationTest/testRepo/test', './resources/htmlInitOutput.html');
        assert.doesNotThrow( function() {
            fileExists('./resources/htmlInitOutput.html');
        } , Error);
    })
})


function fileExists(fileLocation) {
    if (!fs.existsSync(fileLocation)) {
        throw new Error('No file found.');
    }
}