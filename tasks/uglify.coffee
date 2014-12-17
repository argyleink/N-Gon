libsArray = [
  # grab each bower dep individually, doing this by hand is the best way I've found
  "app/js/bower/jquery/dist/jquery.js"
  "app/js/bower/jquery-hammerjs/jquery.hammer-full.js"
  "app/js/bower/velocity/velocity.js"
  "app/js/bower/velocity/velocity.ui.js"

  # then grab all single library items form the libs/ dir
  "app/js/libs/*.js"
]

module.exports =
  prod:
    files: 
      "dist/js/lib.min.js":         libsArray
      "dist/js/app.min.js":         [
        "app/js/*.js"
      ]

  libs:
    options:
      mangle: false
      compress: false
      beautify: true
    files:
      "dist/js/lib.min.js": libsArray