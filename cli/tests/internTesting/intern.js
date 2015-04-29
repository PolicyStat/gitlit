
// Configuation for Gitlit testing
define({
	// The port on which the instrumenting proxy will listen
	proxyPort: 9000,

	// A fully qualified URL to the Intern proxy
	proxyUrl: 'http://localhost:9000/',

	// Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
	// specified browser environments in the `environments` array below as well. See
	// https://code.google.com/p/selenium/wiki/DesiredCapabilities for standard Selenium capabilities and
	// https://saucelabs.com/docs/additional-config#desired-capabilities for Sauce Labs capabilities.
	// Note that the `build` capability will be filled in with the current commit ID from the Travis CI environment
	// automatically
	capabilities: {
		'selenium-version': '2.45.0'
	},

	// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
	// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
	// capabilities options specified for an environment will be copied as-is
	environments: [
		{ browserName: 'firefox', version: '33.0', platform: [ 'Linux' ] }
	],

	// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
	maxConcurrency: 3,

	tunnel: 'BrowserStackTunnel',

	// Name of the tunnel class to use for WebDriver tests
	/*tunnel: 'SauceLabsTunnel',

	tunnelOptions: {
        username: 'satchwsm',
        accessKey: 'd889193c-fe52-4c7c-85b4-ba8487e00f1f'
    },*/

	// The desired AMD loader to use when running unit tests (client.html/client.js). Omit to use the default Dojo
	// loader
	useLoader: {
		/*'host-node': 'dojo/dojo',
		'host-browser': 'node_modules/dojo/dojo.js'*/
	},

	// Configuration options for the module loader; any AMD configuration options supported by the specified AMD loader
	// can be used here
	loader: {
		// Packages that should be registered with the loader in each testing environment
		packages: [ { name: 'gitlit', location: '.' } ]
	},

	// Non-functional test suite(s) to run in each browser
	suites: [ /*'tests/internTesting/unit'*/ ],

	// Functional test suite(s) to run in each browser once non-functional tests are completed
	functionalSuites: [ 'tests/internTesting/functional' ],

	// A regular expression matching URLs to files that should not be included in code coverage analysis
	excludeInstrumentation: /^(?:tests|node_modules)\//
});