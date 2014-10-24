/**
 * Created by Sydney Satchwill on 10/23/2014.
 */


var htmlWriter = require('../htmlWriter');
var assert = require('assert');
var fs = require('fs');

/**
 * Need to refine these tests to work with new JSON structure

describe('Convert text nodes to por tags', function() {

    it('only text', function() {
        assert.equal(htmlWriter.convertText('./cli/tests/generationTest/testRepo/test/3e61894fe84fd31246460272/18eda53718376a1c58837e6e/5376f5329b6e80a8d7934c62/8f422c29094277568d01bde4.txt', '8f422c29094277568d01bde4.txt'), "<por-text por-id=8f422c29094277568d01bde4>titletext</por-text>\n");
    });
});


describe('Convert meta data files', function() {

    it('only text', function() {
        assert.equal(htmlWriter.convertMeta('./cli/tests/generationTest/testRepo/test/3e61894fe84fd31246460272/18eda53718376a1c58837e6e/5376f5329b6e80a8d7934c62/metadata.json'), "<title>\n");
    });
});


describe('Read a list of file names and write everything to one long string',  function() {

    it('only text', function() {
        assert.equal(htmlWriter.convertToString(['./cli/tests/generationTest/testRepo/test/3e61894fe84fd31246460272/18eda53718376a1c58837e6e/5376f5329b6e80a8d7934c62/8f422c29094277568d01bde4.txt', './cli/tests/generationTest/testRepo/test/3e61894fe84fd31246460272/18eda53718376a1c58837e6e/5376f5329b6e80a8d7934c62/metadata.json']), "<title>\n");
    });
});



describe('Initialize file and write HTML to it', function() {

    it('generated test Repo', function() {
        assert.equal(htmlWriter.initializeFile('./cli/tests/generationTest/testRepo/test', './cli/tests/resources/htmlInitOutput.html'), null);
        assert.doesNotThrow( function() {
        	fileExists('./cli/tests/resources/htmlInitOutput.html');
        } , Error);
    });
});


function fileExists(fileLocation) {
    if (!fs.existsSync(fileLocation)) {
        throw new Error('No file found.');
    }
}

**/
