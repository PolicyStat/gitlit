/**
 * Created by Devon Timaeus on 10/11/2014.
 */
var parser = require('../htmlParser');
var fs = require('fs');
var Parser = require('parse5').Parser;
var parse5 = new Parser();
var assert = require('assert');

describe('Check POR-ids and id attributes', function() {

    it('Throw error on duplicate id attribute', function() {
        var faultyHTML = fs.readFileSync('./cli/tests/resources/duplicateIDs.html', 'utf8');
        var faultyDom = parse5.parse(faultyHTML);

        assert.throws(function (){
            parser.checkPORIds(faultyDom);
        }, ReferenceError);
    });
});
