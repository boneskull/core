module.exports = (grunt) ->

  release = (type = 'develop') ->
    switch type
      when 'master'
        grunt.task.run('release')
      else
        grunt.config.set('release',
          options:
            tag     : false
            pushTags: false
            npm     : false
        )

        grunt.task.run('release')

    return

  grunt.initConfig

    pkg: grunt.file.readJSON 'package.json'

    watch:
      coffee:
        files: ['./src/**/*.coffee', './tests/**/*.spec.coffee']
        tasks: ['build']

    coffee:
      src:
        options:
          bare: true
        expand : true
        cwd    : 'src'
        src    : '**/*.coffee'
        dest   : 'lib'
        ext    : '.js'
      tests:
        options:
          bare: true
        expand : true
        cwd    : 'tests'
        src    : ['*.coffee']
        dest   : 'tests'
        ext    : '.spec.js'


    mochaTest:
      test:
        src    : ['./tests/**/*.spec.coffee']
        options:
          require    : ['coffee-script','./tests/common.js']
          checkLeaks : true
          colors     : true
          ui         : 'exports',
          reporter   : 'list'

  grunt.loadNpmTasks 'grunt-release'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-contrib-clean'

  grunt.registerTask 'build', ['coffee','mochaTest:test']
  grunt.registerTask 'releaseit', release

  grunt.registerTask 'default', ['watch']
