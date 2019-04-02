const {app, BrowserWindow, ipcMain, Menu} = require('electron');
const windowStateKeeper = require('electron-window-state');
const debug = require('electron-debug');

const datahandler = require('./datahandler');

debug();

let mainWindow;

function doReady() {
  createWindow();
  createMenus();
//  loadData();
}

function createWindow () {
    
  let mainWindowState = windowStateKeeper({
      defaultWidth: 1000,
      defaultHeight: 800
  });

  mainWindow = new BrowserWindow({
      'x': mainWindowState.x,
      'y': mainWindowState.y,
      'width': mainWindowState.width,
      'height': mainWindowState.height,
      webPreferences: {
        nodeIntegration: true
      }      
  })
  
  mainWindowState.manage(mainWindow);
  
  loadData();

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  })
    
}

function createMenus() {
  const template = [
    {
      label: 'File',
      submenu: [
          { 
            label: "Save",
            accelerator: "CmdOrCtrl+S",
            click: () => saveData()
          },
          { 
            label: "Import",
            accelerator: "CmdOrCtrl+O",
            click: () => loadData()
          },
          { type: 'separator' },  
          { label: "Export As" },
          { role: 'close' }          
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: "TODO" }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function saveData() {
  mainWindow.webContents.send('data', 'save');
}

function loadData() {
  mainWindow.webContents.send('data', 'load');
}

app.on('ready', doReady)


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

