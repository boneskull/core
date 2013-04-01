module.exports = (grunt) ->

  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    release:
      options:
        bump: false

    karma:
      options:
        configFile: 'karma.conf.js'
      unit:
        browsers: ['Firefox']
        singleRun: true
      continuous:
        browsers: ['PhantomJS']
        singleRun: false

  grunt.loadNpmTasks 'grunt-release'
  grunt.loadNpmTasks 'grunt-karma'

  grunt.registerTask 'test', ['karma:unit']
  grunt.registerTask 'test:continuous', ['karma:continuous']
  grunt.registerTask 'default'
