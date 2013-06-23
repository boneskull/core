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

    covervars:
      base   : 'tests/lib-cov'
      build  : '<%=covervars.base %>/build'
      reports: '<%=covervars.base %>/reports'

    watch:
      coffee:
        files: ['./src/**/*.coffee', './tests/**/*.spec.coffee']
        tasks: ['build']

    coffee:
      compile:
        options:
          bare: true
        expand : true
        cwd    : 'src'
        src    : '**/*.coffee'
        dest   : 'lib'
        ext    : '.js'

    clean:
      coverage: [
        '<%=covervars.base %>/*'
      ]

    instrument:
      files  : './lib/**/*.js'
      options:
        basePath: '<%=covervars.build %>/'

    reloadTasks:
      rootPath: '<%=covervars.build %>/lib/'

    storeCoverage:
      options:
        dir: '<%=covervars.reports %>/'

    makeReport:
      src    : '<%=covervars.reports %>/**/*.json'
      options:
        type : 'lcov',
        dir  : '<%=covervars.reports %>',
        print: 'detail'

    cafemocha:
      test:
        src    : './tests/server/**/*.spec.coffee'
        options:
          require    : ['./tests/common.coffee','./lib/']
          ignoreLeaks: false
          checkLeaks : true
          colors     : true
          ui         : 'bdd',
          reporter   : 'dot'

      coverage:
        src    : './tests/server/**/*.spec.coffee'
        options:
          require    : ['./tests/common.coffee','./<%=covervars.build %>/lib/']
          globals    : ['__coverage__']
          ignoreLeaks: false
          colors     : true
          ui         : 'bdd',
          reporter   : 'json-cov'
          coverage   :
            output: 'tests/lib-cov/coverage.html'

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
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-istanbul'

  grunt.registerTask 'test', ['cafemocha:test']
  grunt.registerTask 'cover', [
    'coffee', 'clean',
    'instrument',
    #'reloadTasks',
    'cafemocha:coverage',
    #'storeCoverage', 'makeReport'
  ]
  grunt.registerTask 'test:continuous', ['karma:continuous']

  grunt.registerTask 'build', ['coffee', 'test']
  grunt.registerTask 'releaseit', release

  grunt.registerTask 'default', ['watch']
