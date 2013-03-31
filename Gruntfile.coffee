module.exports = (grunt) ->

  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    release:
      options:
        bump: false
        
    karma:
      unit:
        configFile: 'test/karma.conf.js'
      continuous:
        configFile: 'test/karma.conf.js'
        singleRun: true
        browsers: ['PhantomJS', 'Firefox']

  grunt.loadNpmTasks 'grunt-release'
  grunt.loadNpmTasks 'grunt-karma'

  grunt.registerTask 'test', ['karma:unit', 'karma:continuous']
  grunt.registerTask 'default'
