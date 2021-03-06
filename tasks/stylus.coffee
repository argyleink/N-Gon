stylusFiles = [
  "dist/styles/master.css":   "app/styles/master.styl"
  "dist/styles/ios.css":      "app/styles/stylus/ios.styl"
]

autoprefixerPlugin = [
  () -> require('autoprefixer-stylus')(
    browsers: 'last 2 versions', 'ie 8', 'ie 9'
  )
]

module.exports =
  compile:
    options:
      compress:       true
      linenos:        false
      "include css":  true
      use: autoprefixerPlugin

    files: stylusFiles

  debug:
    options:
      compress:       false
      linenos:        true
      "include css":  true
      use: autoprefixerPlugin

    files: stylusFiles
