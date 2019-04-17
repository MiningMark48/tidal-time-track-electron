const {ipcRenderer, remote} = require('electron');
const jquery = require('jquery');

const csshandler = require('./util/csshandler');

var preferences = ipcRenderer.sendSync('getPreferences');

var version;

function doLoad() {
  document.querySelector("#versionElectron").textContent = process.versions.electron;
  document.querySelector("#versionApp").textContent = remote.app.getVersion();
}

function getPrefs() {
  preferences = ipcRenderer.sendSync('getPreferences');
}

function updatePrefs() {
  changeCSS();
  console.log('Preferences were updated.')
}

function changeCSS() {
  let prefStyles = preferences["styles"];
  let useCustom = (prefStyles["theme"] === 'custom');

  if(!useCustom) csshandler.changeCSS(prefStyles["theme"]);

  csshandler.setCustomStyle('bg', document.body, prefStyles["styles_color_background"], useCustom);
  csshandler.setCustomStyle('fc', document.body, prefStyles["styles_color_font"], useCustom);

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
