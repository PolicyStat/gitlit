/**
 * Created by John Kulczak on 10/23/2014.
 */

var htmlWriter = require('../htmlWriter');
var assert = require('assert');

describe('Get string representation of JSON objects properly', function() {

    it('Metadata conversion no attributes', function() {
        var jsonMeta = '{\"name\":\"test\", \"tag\":\"head\", \"attributes\":[]}';
        var metaObject = JSON.parse(jsonMeta);
        assert.equal(htmlWriter.convertJSON(metaObject), '<head>\n');
    });

    it('Metadata conversion with attributes', function() {
        var jsonMeta = '{\"name\":\"test\", \"tag\":\"head\", \"attributes\":[{\"name\":\"id\",\"value\":\"test1\"},{\"name\":\"class\",\"value\":\"test2\"}]}';
        var metaObject = JSON.parse(jsonMeta);
        assert.equal(htmlWriter.convertJSON(metaObject), '<head id="test1" class="test2">\n');
    });

    it('Text conversion', function() {
        var jsonText = '{\"name\":\"1111\", \"text\":\"This is a test\"}';
        var textObject = JSON.parse(jsonText);
        assert.equal(htmlWriter.convertJSON(textObject), '<por-text por-id=1111>This is a test</por-text>');
    });

});

describe('Test converting JSON object into a string', function() {

    it('Create html string from simple tree', function() {
        var metaNode = '{\"name\":\"test1\", \"tag\":\"head\", \"attributes\":[], \"childNodes\":[]}';
        var metaObject = JSON.parse(metaNode);
        metaObject.childNodes.push(JSON.parse('{\"name\":\"1234\", \"text\":\"Hello!\"}'));
        
        assert.equal(htmlWriter.convertToString(metaObject), '<head>\n<por-text por-id=1234>Hello!</por-text></head>\n');
    });

});