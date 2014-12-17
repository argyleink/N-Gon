jadeFiles = [
  expand: true
  cwd:    "app/"
  src:    ["*.jade"]
  dest:   "dist/"
  ext:    ".html"
]

module.exports =
  debug:
    options:
      data:
        dev: true
      pretty: true

    files: jadeFiles

  release:
    options:
      data:
        dev: false

    files: jadeFiles