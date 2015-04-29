define([
    'intern!object',
    'intern/chai!assert',
    'require'
], function (registerSuite, assert, require) {
    registerSuite({
        name: 'diffDisplay',

        //Tests for diffs with no changes
        'save selections': function () {

        	return this.remote
                .get(require.toUrl('tests/internTesting/diffResources/noChanges/diffDisplay.html'))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementById('SaveButton')
                    .clickElement()
                    .end()
                .elementByCssSelector('a')
                .text()
                .then(function (text) {
                    assert.strictEqual(text, 'Click here to save selections',
                        'Link should say \'Click here to save selections\' after Save Selections button clicked');
                });

        },

        'json download': function () {

            return this.remote
                .get(require.toUrl('tests/internTesting/diffResources/noChanges/diffDisplay.html'))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementById('SaveButton')
                    .clickElement()
                    .end()
                .elementByCssSelector('a')
                    .clickElement()
                    .end()
                .elementByCssSelector('a')
                .text()
                .then(function (text) {
                    assert.strictEqual(text, 'Downloaded',
                        'Link should say \'Downloaded\' after JSON has been downloaded');
                });

        },

        //Tests for diffs with insertion change
        'save selections': function () {

            return this.remote
                .get(require.toUrl('tests/internTesting/diffResources/insertionChanges/diffDisplay.html'))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementById('SaveButton')
                    .clickElement()
                    .end()
                .elementByCssSelector('a')
                .text()
                .then(function (text) {
                    assert.strictEqual(text, 'Click here to save selections',
                        'Link should say \'Click here to save selections\' after Save Selections button clicked');
                });

        }, 

        'ins tag': function () {

            return this.remote
                .get(require.toUrl('tests/internTesting/diffResources/insertionChanges/diffDisplay.html'))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementByByCssSelector('#ins')
                .text()
                .then(function (text) {
                    assert.strictEqual(text, 'new added text',
                        'ins tag should contain \'new added text\'');
                });

        },

        'green highlight': function () {

            return this.remote
                .get(require.toUrl('tests/internTesting/diffResources/insertionChanges/diffDisplay.html'))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementByByCssSelector('span[style="background-color: #90EE90;"]')
                .text()
                .then(function (text) {
                    assert.strictEqual(text, 'new added text',
                        'span highlighted green should contain \'new added text\'');
                });


        'json download': function () {

            return this.remote
                .get(require.toUrl('tests/internTesting/diffResources/insertionChanges/diffDisplay.html'))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementById('SaveButton')
                    .clickElement()
                    .end()
                .elementByCssSelector('a')
                    .clickElement()
                    .end()
                .elementByCssSelector('a')
                .text()
                .then(function (text) {
                    assert.strictEqual(text, 'Downloaded',
                        'Link should say \'Downloaded\' after JSON has been downloaded');
                });

        },

        //Tests for diffs with deletion change
        'save selections': function () {

            return this.remote
                .get(require.toUrl('tests/internTesting/diffResources/deletionChanges/diffDisplay.html'))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementById('SaveButton')
                    .clickElement()
                    .end()
                .elementByCssSelector('a')
                .text()
                .then(function (text) {
                    assert.strictEqual(text, 'Click here to save selections',
                        'Link should say \'Click here to save selections\' after Save Selections button clicked');
                });

        }, 

        'del tag': function () {

            return this.remote
                .get(require.toUrl('tests/internTesting/diffResources/deletionChanges/diffDisplay.html'))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementByByCssSelector('#del')
                .text()
                .then(function (text) {
                    assert.strictEqual(text, 'after div',
                        'del tag should contain \'after div\'');
                });

        },

        'red highlight': function () {

            return this.remote
                .get(require.toUrl('tests/internTesting/diffResources/deletionChanges/diffDisplay.html'))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementByByCssSelector('span[style="background-color: #F00;"]')
                .text()
                .then(function (text) {
                    assert.strictEqual(text, 'after div',
                        'span highlighted red should contain \'after div\'');
                });


        'json download': function () {

            return this.remote
                .get(require.toUrl('tests/internTesting/diffResources/insertionChanges/diffDisplay.html'))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementById('SaveButton')
                    .clickElement()
                    .end()
                .elementByCssSelector('a')
                    .clickElement()
                    .end()
                .elementByCssSelector('a')
                .text()
                .then(function (text) {
                    assert.strictEqual(text, 'Downloaded',
                        'Link should say \'Downloaded\' after JSON has been downloaded');
                });

        };
    });
});
