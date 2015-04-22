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
                .findById('nameField')
                    .click()
                    .type('Elaine')
                    .end()
                .findByCssSelector('#loginForm input[type=submit]')
                    .click()
                    .end()
                .findById('greeting')
                .getVisibleText()
                .then(function (text) {
                    assert.strictEqual(text, 'Hello, Elaine!',
                        'Greeting should be displayed when the form is submitted');
                });

        }
    });
});


/*define([
    'intern!object',
    'intern/chai!assert',
    'gitlit.js',
    'repoInit.js'
], function (registerSuite, assert, gitlit, repoInit) {
	registerSuite({
		name: 'gitlit',

		init: function() {
			assert.equal(gitlit.init(''), 'error: missing required argument \`file\'', 'Init with no arguments should return an error message');

		}


	});


});