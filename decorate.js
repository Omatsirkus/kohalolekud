var gui = window.require('nw.gui')

module.exports.decorate = function decorate() {
  var win = gui.Window.get()
  var nativeMenuBar = new gui.Menu({ type: "menubar" })
  try {
    nativeMenuBar.createMacBuiltin(gui.App.manifest.name + ' ' + gui.App.manifest.version)
    win.menu = nativeMenuBar
  } catch (ex) {
    console.log(ex.message)
  }
}
