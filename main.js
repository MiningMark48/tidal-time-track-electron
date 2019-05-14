const {app, dialog, BrowserWindow, globalShortcut, ipcMain, Menu, MenuItem, remote, Tray} = require('electron');
const fs = require('fs');
const path = require('path');
const windowStateKeeper = require('electron-window-state');
const debug = require('electron-debug');
const jsonExport = require('export-from-json');
const log = require('electron-log');

const datahandler = require('./src/util/datahandler');
const preferences = require('./src/preferences');

debug();

var mainWindow;
var appIcon = null;

function doReady() {
  setupLogging();
  createWindow();
  createMenus();
//  loadData();
}

function setupLogging() {
  log.transports.console.format = '{h}:{i}:{s} > {text}';
  log.transports.file.fileName = './logs/log.log';
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
  });

  mainWindowState.manage(mainWindow);

  loadData();

  mainWindow.loadFile('./src/signin.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.on('minimize', function(event) {
    if (preferences.value("general.minimize_to_tray")) {
      event.preventDefault();
      showTrayApp(mainWindow);
      mainWindow.hide();
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('do-initial-load');
  });

}

function createMenus() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: "Save Data",
          accelerator: "CmdOrCtrl+S",
          click: () => saveData()
        },
        {
          label: "Import Data...",
          accelerator: "CmdOrCtrl+O",
          click: () => importData()
        },
        {
          label: "Export Data As",
          submenu: [
            {
              label: 'Plain Text',
              click: () => exportData('txt')
            },
            {
              label: 'JSON',
              click: () => exportData('json')
            },
            {
              label: 'CSV',
              click: () => exportData('csv')
            },
            {
              label: 'XLS',
              click: () => exportData('xls')
            }
          ]
        },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: "Import Theme...",
          click: () => importTheme()
        },
        {
          label: "Export Theme...",
          click: () => exportTheme()
        },
        { type: 'separator' },
        {
          label: "Preferences",
          accelerator: "CmdOrCtrl+Shift+P",
          click: () => showPreferencesDialog()
        }
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

  appIcon.on('click', function(event) {
    mainWin.show();
    appIcon.destroy();
  });

  appIcon.setToolTip('Tidal Time Tracker');
  appIcon.setContextMenu(contextMenu);
}

function saveData() {
  mainWindow.webContents.send('data', 'save');
}

function loadData() {
  mainWindow.webContents.send('data', 'load');
}

function importData() {
  const options = {
    title: 'Import',
    properties: [ 'openFile' ],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  }
  dialog.showOpenDialog(options, (files) => {
    if (files) {
      fs.readFile(files[0], 'utf-8', (err, data) => {
        if (err) return;
        mainWindow.webContents.send('import-data', data);
      });
    }
  });
}

function exportData(type) {
  mainWindow.webContents.send('export-data', type);
}

function importTheme() {
  const options = {
    title: 'Import',
    properties: [ 'openFile' ],
    filters: [{ name: 'JSON', extensions: ['json'] }]
  }
  dialog.showOpenDialog(options, (files) => {
    if (files) {
      fs.readFile(files[0], 'utf-8', (err, data) => {
        if (err) return;
        mainWindow.webContents.send('theme-import', data);
      });
    }
  });
}

function exportTheme() {
  mainWindow.webContents.send('theme-export');
}

function showPreferencesDialog() {
  preferences.show();
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
  });

  aboutDialogWindow.setMenu(null);
  aboutDialogWindow.setResizable(false);

  aboutDialogWindow.loadFile('./src/about.html');

  aboutDialogWindow.on('closed', function () {
    aboutDialogWindow = null;
  })

  aboutDialogWindow.webContents.on('did-finish-load', () => {
    aboutDialogWindow.webContents.send('do-initial-load');
  });

}

app.on('ready', doReady);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});

app.on('activate', function () {
  if (mainWindow === null) createWindow()
});

preferences.on('save', (preferences) => {
  console.log("Preferences were saved.", JSON.stringify(preferences, null, 4));
});

ipcMain.on('show-context-entry', (event) => {
  const menuEntry = Menu.buildFromTemplate([
    {
      label: 'Delete Entry',
      click: () => {
        event.sender.send('context-reply-delete');
      }
    }
  ]);
  const win = BrowserWindow.fromWebContents(event.sender);
  menuEntry.popup(win);
});

ipcMain.on('delete-entries-dialog', (event) => {
  const options = {
    type: 'info',
    title: 'Are you sure?',
    message: 'Are you sure you would like to delete all entries? \nThis action cannot be undone.',
    buttons: [ 'Yes', 'No' ]
  }
  dialog.showMessageBox(options, (index) => {
    event.sender.send('delete-entries-dialog-response', index);
  })
});

ipcMain.on('show-statistics', (event, args) => {
  mainWindow.loadFile('./src/stats.html');

  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'close' },
        { type: 'separator' },
        {
          label: "Preferences",
          accelerator: "CmdOrCtrl+Shift+P",
          click: () => showPreferencesDialog()
        }
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

});

//From Stats
ipcMain.on('back-to-main', (event) => {
  mainWindow.loadFile('./src/index.html');
  createMenus();
});
