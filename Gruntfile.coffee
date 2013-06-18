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
        tasks: ['coffee', 'test']

    coffee:
      compile:
        options:
          bare: true
        expand: true
        cwd   : 'src'
        src   : '**/*.coffee'
        dest  : 'lib'
        ext   : '.js'

    cafemocha:
      test:
        src    : './tests/server/**/*.spec.coffee'
        options:
          require    : ['./lib/']
          ignoreLeaks: false
          colors     : true
          ui         : 'bdd',
          reporter   : 'dot'
          coverage   : true

    karma:
      options   :
        configFile: 'tests/client/karma.conf.js'
      unit      :
        browsers : ['Firefox']
        singleRun: true
      continuous:
        browsers : ['Firefox', 'Chrome']
        singleRun: false

  grunt.loadNpmTasks 'grunt-release'
  grunt.loadNpmTasks 'grunt-karma'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-cafe-mocha'

  grunt.registerTask 'test', ['cafemocha']
  grunt.registerTask 'test:continuous', ['karma:continuous']

  grunt.registerTask 'releaseit', release

  grunt.registerTask 'default', ['watch']
