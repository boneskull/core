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
      src:
        files: ['./src/**/*.coffee', './test/**/*.spec.js']
        tasks: ['build']

    mocha_istanbul:
      coveralls:
        src: 'test'
        options:
          coverage: true
          quiet: true
          reporter: 'min'
      coverage:
        src: 'test'
        options:
          reporter: 'min'


    coffee:
      src:
        options:
          bare: true
        expand : true
        cwd    : 'src'
        src    : '**/*.coffee'
        dest   : 'lib'
        ext    : '.js'

    mochaTest:
      test:
        src: ['./test/*.spec.js']
        options:
          require: ['./test/common.js']
          ui: 'exports'
          reporter: 'list'

  grunt.loadNpmTasks 'grunt-release'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-mocha-test'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-mocha-istanbul'

  grunt.event.on 'coverage', (lcov, done) ->
    require('coveralls').handleInput(lcov, (err) ->
      if (err)
        grunt.log.error(err)
        done(false)
      else
        done()

      return
    )
    return

  grunt.registerTask 'coveralls', ['coffee','mocha_istanbul:coveralls']
  grunt.registerTask 'coverage', ['coffee','mocha_istanbul:coverage']
  grunt.registerTask 'build', ['coffee','mochaTest:test']
  grunt.registerTask 'releaseit', release

  grunt.registerTask 'default', ['watch']
