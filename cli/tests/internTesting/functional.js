define([
    'intern!object',
    'intern/chai!assert',
    'require'
], function (registerSuite, assert, require) {
    registerSuite({
        name: 'diffDisplay',

        'greeting form': function () {

        	return this.remote
                .get(require.toUrl('/diffResources/diffDisplay.html'))
                .setFindTimeout(5000)
                .findByCssSelector('body.loaded')
                .findById('SaveButton')
                    .click()
                    .end()
                .findByCssSelector('a')
                    .click()
                    .end()
                .findByCssSelector('a')
                .getVisibleText()
                .then(function (text) {
                    assert.strictEqual(text, 'Downloaded',
                        'Link should say \'Downloaded\' after JSON has been downloaded');
                });

        }
    });
});
