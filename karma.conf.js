files = [
	MOCHA,
	MOCHA_ADAPTER,
	'node_modules/chai/chai.js',
	'test/*.coffee'
];
reporters = ['dots'];
preprocessors = {
	'**/*.coffee': 'coffee'
};
coverageReporter = {
	type: 'html',
	dir: 'coverage/'
};
