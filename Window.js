'use strict'

const { BrowserWindow } = require('electron')
const screen = require('electron').remote

// default window settings
const defaultProps = {
  width: 500,
  height: 800,
  fullscreenable: false,
  resizable: false,
  show: false,
  webPreferences: {
      nodeIntegration: true
  }
}
  
class Window extends BrowserWindow {
  constructor ({ file, ...windowSettings }) {
    // calls new BrowserWindow with these props
    super({ ...defaultProps, ...windowSettings })

    // load the html and open devtools
    this.loadFile(file)
    // this.webContents.openDevTools()
    
  }

  // getDisplay(){
  //   let displayInfo = screen.getPrimaryDisplay()
  //   return [displayInfo.workAreaSize.width, displayInfo.workAreaSize.height]
  // }
}

module.exports = Window