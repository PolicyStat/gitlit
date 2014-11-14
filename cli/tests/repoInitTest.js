/**
 * Created by Devon Timaeus on 9/30/2014.
 */

var repoInit = require('../repoInit');
var assert = require('assert');
var path = require("path");

describe('Get extension of files properly', function() {

    it('non-HTML extension', function() {
        var currentPath = __dirname;
        var pathToFile = path.join(currentPath, 'resources', 'nonHTML.txt');
        assert.equal(repoInit.getExtension(pathToFile), 'txt');
    });

    it('HTML extension', function() {
        var currentPath = __dirname;
        var pathToFile = path.join(currentPath, 'resources', 'testHTML.html');
        assert.equal(repoInit.getExtension(pathToFile), 'html');
    });

    it('extension-less file', function(){
        var currentPath = __dirname;
        var pathToFile = path.join(currentPath, 'resources', 'noExtension');
        assert.equal(repoInit.getExtension(pathToFile), '');
    });

});

describe('Get file contents', function() {

    it('Error on non-HTML file', function() {
        assert.throws(function (){
            var currentPath = __dirname;
            var pathToFile = path.join(currentPath, 'resources', 'nonHTML.txt');
            repoInit.getFileContents(pathToFile);
        }, TypeError);

    });

    it('Error on file with no extension', function(){
        assert.throws(function (){
            var currentPath = __dirname;
            var pathToFile = path.join(currentPath, 'resources', 'noExtension');
            repoInit.getFileContents(pathToFile);
        }, TypeError);
    });

    it('Getting HTML file contents', function() {
        var currentPath = __dirname;
        var pathToFile = path.join(currentPath, 'resources', 'testHTML.html');
        assert.ok(typeof repoInit.getFileContents(pathToFile) == "string");
    });

});

