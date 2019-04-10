const {ipcRenderer, remote} = require('electron');
const jquery = require('jquery');

const csshandler = require('./util/csshandler');

var preferences = ipcRenderer.sendSync('getPreferences');

function doLoad() {
  document.querySelector("#versionElectron").textContent = process.versions.electron;
}

function getPrefs() {
  preferences = ipcRenderer.sendSync('getPreferences');
}

function updatePrefs() {
  changeCSS();
  console.log('Preferences were updated.')
}

function changeCSS() {
  csshandler.changeCSS(preferences["styles"]["theme"]);
}

// IPC Messages
ipcRenderer.on('do-initial-load', (event) => {
  changeCSS();
  doLoad();
});

ipcRenderer.on('preferencesUpdated', (event, preferences) => {
    getPrefs();
    console.log('Preferences were reloaded.');
    updatePrefs();
});
