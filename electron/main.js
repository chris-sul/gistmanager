const {app, BrowserWindow} = require('electron')
const url = require("url");
const path = require("path");

require('dotenv').config({path:__dirname +'/.env'});
console.log(process.env)

const {createAuthWindow} = require('./main/auth-process');
const authService = require('./services/auth-service');

let mainWindow

function createAppWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `/../dist/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

async function checkAuth() {
  try {
    await authService.refreshTokens();
    return createAppWindow();
  } catch (err) {
    createAuthWindow();
  }
}


app.on('ready', checkAuth)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

module.exports = {
  createAppWindow,
};