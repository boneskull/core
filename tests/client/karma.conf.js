files = [
	MOCHA,
	MOCHA_ADAPTER,
	'../../node_modules/chai/chai.js',
	'**/*.spec.coffee'
];
reporters = ['dots'];
preprocessors = {
	'**/*.spec.coffee': 'coffee'
};
coverageReporter = {
	type: 'html',
	dir: '../coverage/'
};
