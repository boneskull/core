#!/usr/bin/env node

var
	program = require('commander');

program
	.version('0.0.1')
	.command('init [name]', 'Create a new Socket Express app')
	.parse(process.argv);

program.on('init', function(name){

});
