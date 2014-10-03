/**
 * Created by Devon Timaeus on 9/30/2014.
 */

var test = require('unit.js');
var repoInit = require('../repoInit');

describe('Get extension of files properly', function() {

    it('non-HTML extension', function() {
        test.assert.equal(repoInit.getExtension('./resources/nonHTML.txt'), 'txt');
    });

    it('HTML extension', function() {
        test.assert.equal(repoInit.getExtension('./resources/testHTML.html'), 'html');
    });

    it('extension-less file', function(){
        test.assert.equal(repoInit.getExtension('./resources/noExtension'), '');
    });

});

describe('Get file contents', function() {

    it('Error on non-HTML file', function() {
        try {
            repoInit.getFileContents('./resources/nonHTML.txt');
            test.fail('Did not throw TypeError when file was .txt');
        } catch (err) {
            test.error(err).is(TypeError('Filetype not HTML'));
        }
    });

    it('Error on file with no extension', function(){
        try {
            repoInit.getFileContents('./resources/noExtension');
            test.fail('Did not throw TypeError when file was .txt');
        } catch (err) {
            test.error(err).is(TypeError('Filetype not HTML'));
        }
    });

    it('Getting HTML file contents', function() {
        test.string(repoInit.getFileContents('./resources/testHTML.html'));
    });

});

