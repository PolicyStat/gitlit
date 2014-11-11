/**
 * Created by Devon Timaeus on 9/30/2014.
 */

var repoInit = require('../repoInit');
var assert = require('assert');
var path = require("path");

describe('Get extension of files properly', function() {

    it('non-HTML extension', function() {
        assert.equal(repoInit.getExtension('./cli/tests/resources/nonHTML.txt'), 'txt');
    });

    it('HTML extension', function() {
        assert.equal(repoInit.getExtension('./cli/tests/resources/testHTML.html'), 'html');
    });

    it('extension-less file', function(){
        assert.equal(repoInit.getExtension('./cli/tests/resources/noExtension'), '');
    });

});

describe('Get file contents', function() {

    it('Error on non-HTML file', function() {
        assert.throws(function (){
            repoInit.getFileContents('./cli/tests/resources/nonHTML.txt');
        }, TypeError);

    });

    it('Error on file with no extension', function(){
        assert.throws(function (){
            repoInit.getFileContents('./cli/tests/resources/noExtension');
        }, TypeError);
    });

    it('Getting HTML file contents', function() {
        assert.ok(typeof repoInit.getFileContents('./cli/tests/resources/testHTML.html') == "string");
    });

});

