// 1. core modules
var gui     = window.gui

var configuration = {
  "language": "estonian",
  "cards": ["groups", "mark", "thankyou"],
  "VERSION": gui.App.manifest.version,
  "ENTU_URI": 'https://omatsirkus.entu.ee/'
}

configuration['ENTU_API'] = configuration.ENTU_URI + 'api2/'
configuration['ENTU_API_AUTH'] = configuration.ENTU_API + 'user/auth'
configuration['ENTU_API_USER'] = configuration.ENTU_API + 'user'
configuration['ENTU_API_ENTITY'] = configuration.ENTU_API + 'entity'
configuration['ENTU_API_POST_FILE'] = configuration.ENTU_API + 'file'

module.exports = configuration