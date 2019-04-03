const {app, dialog, BrowserWindow, ipcMain, Menu, remote, Tray} = require('electron');
const path = require('path');
const windowStateKeeper = require('electron-window-state');
const debug = require('electron-debug');

const datahandler = require('./datahandler');

debug();

let mainWindow;
let appIcon = null;

function doReady() {
  createWindow();
  createMenus();
//  loadData();

}

function createWindow () {
    
  let mainWindowState = windowStateKeeper({
      defaultWidth: 1350,
      defaultHeight: 700,
  });

  mainWindow = new BrowserWindow({
      'x': mainWindowState.x,
      'y': mainWindowState.y,
      'width': mainWindowState.width,
      'height': mainWindowState.height,
      'minWidth': 1350,
      'minHeight': 700,
      'icon': './icon.png',
      webPreferences: {
        nodeIntegration: true
      }      
  })
  
  mainWindowState.manage(mainWindow);
  
  loadData();

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.on('minimize', function(event) {
    event.preventDefault();
    showTrayApp(mainWindow);
    mainWindow.hide();
  });
    
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
        { 
          label: "About",
          click: () => showAboutDialog()
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function showTrayApp(mainWin) {
  const iconName = 'icon.png';
  const iconPath = path.join(__dirname, iconName);
  appIcon = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        mainWin.show();
        appIcon.destroy();
      }
    },
    {
      type: 'separator'
    },
    { 
      label: 'Quit',
      click: () => {
        appIcon.destroy();
        mainWindow.close();
      }
    }
  ]);

  appIcon.setToolTip('Tidal Time Tracker');
  appIcon.setContextMenu(contextMenu);
}

function saveData() {
  mainWindow.webContents.send('data', 'save');
}

function loadData() {
  mainWindow.webContents.send('data', 'load');
}

function showAboutDialog() {
  let aboutDialogWindow = new BrowserWindow({
    'parent': mainWindow,
    'modal': true,
    'width': 600,
    'height': 300,
    'minWidth': 600,
    'minHeight': 300,
    webPreferences: {
      nodeIntegration: true
    }      
  })

  aboutDialogWindow.setMenu(null);
  aboutDialogWindow.setResizable(false);

  aboutDialogWindow.loadFile('about.html');

  aboutDialogWindow.on('closed', function () {
    aboutDialogWindow = null;
  })

}

app.on('ready', doReady);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  if (mainWindow === null) createWindow()
});

