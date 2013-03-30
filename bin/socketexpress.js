#!/usr/bin/env node

var
	program = require('commander');

program
	.usage('[command] [options]')
	.command('new <name> <args...>', 'Create a new Socket Express app')
	.action(function(name, args){

	})
	.command('generate <type> <args...>', 'Create a new Socket Express app')
	.action(function(type, args){

	})
	.parse(process.argv);

program.on('--help', function(){
	console.log('  Examples:');
	console.log('');
	console.log('    $ sx init app');
	console.log('    $ sx init app --coffee --frontend ember');
	console.log('    $ sx init app --frontend angular --html h5bp');
	console.log('');
	console.log('    $ sx generate model User name:string email:string');
	console.log('    $ sx generate controller User');
	console.log('    $ sx generate crud User');
	console.log('');
});
