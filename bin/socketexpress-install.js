#!/usr/bin/env node

var program = require('..');

program
	.option('--javascript [type]', 'Set javascript type, Coffeescript or vanila Javascript')
	.option('--frontend [type]', 'Set front-end type, current supports Ember.js and AngularJS')
	.parse(process.argv);

var pkgs = program.args;

if (!pkgs.length) {
	console.error('packages required');
	process.exit(1);
}

console.log();
if (program.force) console.log(' force: install');
pkgs.forEach(function (pkg) {
	console.log(' install : %s', pkg);
});
console.log();
