module.exports = (grunt) ->
  
  require("matchdep").filterDev("grunt-*").forEach grunt.loadNpmTasks
  require("time-grunt")(grunt)

  # load tasks
  options = 
    config:
      src: "tasks/*.coffee"
  configs = require("load-grunt-configs")(grunt, options)

  grunt.initConfig configs
  
  # compile everything, run server, and watch
  grunt.registerTask "default", [
    "asciify:headline"
    "clean" 
    "concurrent:makeLibs" 
    "concurrent:stylusAndJade"
    "notify:appstarted"
    # "shell:open_app"
    "connect"
    "browserSync"
    "watch"
  ]

  # serve static dist/ directory
  grunt.registerTask "serve", [
    "asciify:headline"
    "shell:open_app"
    "connect"
    "watch"
  ]
  
  # compile everything for debug but don't watch
  grunt.registerTask "dev", [
    "clean"
    "concurrent:makeLibs" 
    "concurrent:stylusAndJade" 
  ]
  
  # for prod use, minify all js files, html is already compressed 
  grunt.registerTask "prod", [
    "clean"
    "uglify:libs"
    "stylus:compile" 
    "jade:release"
    "uncss"
    "uglify:prod"
    "imagemin"
    "svgmin"
    "manifest"
    "notify:prod"
    "connect"
    "watch"
  ]

  grunt.registerTask "heroku", [
    "clean"
    "copy" 
    "stylus:compile"
    "jade:release" 
    "uncss"
    "uglify:prod"
    "imagemin"
    "svgmin"
    "manifest"
    "asciify:build"
  ]
