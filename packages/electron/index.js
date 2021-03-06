'use strict'

// const { app, session, shell, BrowserWindow, Menu } = require('electron')
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
const mkdirp = require('mkdirp')
// const defaultMenu = require('electron-default-menu')

const archipel = require('./lib/archipel.js')

const isDev = process.env.NODE_ENV === 'development'

const pathPrefix = process.env.ARCHIPEL_APP_PATH || isDev ? path.join(__dirname, '../app') : __dirname

const libraryPath = path.join(app.getPath('appData'), 'archipel', 'library')

// const menu = defaultMenu(app, shell)
// menu[menu.length - 1].submenu.push({
//   label: 'Doctor',
//   click: () => {
//     win.webContents.openDevTools({ mode: 'detach' })
//   }
// })

let win

app.on('ready', () => {
  // var cspHeader = {'Content-Security-Policy': `default-src: 'self'`}
  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({cancel: false, responseHeaders: Object.assign({}, details.responseHeaders, cspHeader)})
  // })
  mkdirp(libraryPath, err => {
    if (err) return console.error('cannot create library path: ' + libraryPath, err)
    let config = {
      library: { path: libraryPath }
    }
    archipel(config, websocketUrl => open(websocketUrl))
  })
})

function open (websocketUrl) {
  process.env.ARCHIPEL_WEBSOCKET_URL = websocketUrl
  win = new BrowserWindow({
    // Extending the size of the browserwindow to make sure that the developer bar is visible.
    width: 1280 + (isDev ? 50 : 0),
    height: 768 + (isDev ? 200 : 0),
    titleBarStyle: 'hiddenInset',
    minWidth: 640,
    minHeight: 395,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, './preload.js'),
      additionalArguments: [websocketUrl]
    }
  })
  if (isDev) {
    require('./lib/development.js')(app, win)
  }
  win.loadURL(`file://${pathPrefix}/dist/index.html`)

  // Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
  Menu.setApplicationMenu(null)

  if (isDev) {
    win.webContents.openDevTools()
  }
}

app.on('will-finish-launching', () => {
  app.on('open-url', (_, url) => win.webContents.send('link', url))
  app.on('open-file', (_, path) => win.webContents.send('file', path))
})

app.on('window-all-closed', () => {
  app.quit()
})

// todo: port to electron 4
// const quit = app.makeSingleInstance(() => {
  // if (!win) return
  // if (win.isMinimized()) win.restore()
  // win.focus()
// })

// if (quit) app.quit()

