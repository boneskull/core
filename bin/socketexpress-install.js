#!/usr/bin/env node

var program = require('commander');

program
	.option('-c, --coffee', 'Set to output Coffeescript for generators')
	.option('-f, --frontend [type]', 'Set front-end type, can be ember, angular')
	.option('-s, --style [type]', 'Set CSS type, can be one or more stylus, sass, less')
	.option('-d, --database [type]', 'Set Database type, can be one or more mysql, sqlite, mongodb, couchdb, firebird, postgres, redis')
	.option('--html [type]', 'Set HTML framework, can be h5bp, foundation, bootstrap, groundwork')
	.parse(process.argv);

program.on('--help', function(){

});
