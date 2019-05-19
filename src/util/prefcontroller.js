const {ipcRenderer, remote} = require('electron');
const log = require('electron-log');

const csshandler = require('./csshandler');

var preferences = ipcRenderer.sendSync('getPreferences');

setupCSS();

function getPrefs() {
  preferences = ipcRenderer.sendSync('getPreferences');
}

function updatePrefs() {
  // setupCSS();
  changeCSS();
  log.info("%cPreferences were updated.", 'color: green');
}

function setupCSS() {
  let head = document.getElementsByTagName('head')[0]; 
  let link = document.createElement('link'); 

  link.rel = 'stylesheet';  
  link.type = 'text/css'; 
  link.href = '../../../src/css/' + preferences["styles"]["theme"] + '.css';
  head.appendChild(link);

  let link2 = document.createElement('link');
  link2.rel = 'stylesheet';  
  link2.type = 'text/css'; 
  link2.href = '../../../src/css/prefs.css';
  head.appendChild(link2);
}

function changeCSS() {
  let prefStyles = preferences["styles"];
  let useCustom = (prefStyles["theme"] === 'custom');

  if(!useCustom) setupCSS();

  let elementMain = document.getElementsByClassName("main")[0];
  let elementSidebar = document.getElementsByClassName("sidebar")[0];
  let elementSelect = document.getElementsByTagName("select")[0];

  csshandler.setCustomStyle('bg', elementMain, prefStyles["styles_color_background"], useCustom);
  csshandler.setCustomStyle('bg', elementSidebar, prefStyles["styles_color_thBackground"], useCustom);
  csshandler.setCustomStyle('bg', elementSelect, prefStyles["styles_color_tbBackground"], useCustom);
  csshandler.setCustomStyle('fc', elementMain, prefStyles["styles_color_font"], useCustom);
  csshandler.setCustomStyle('fc', elementSidebar, prefStyles["styles_color_thFont"], useCustom);
  csshandler.setCustomStyle('fc', elementSelect, prefStyles["styles_color_tbFont"], useCustom);
}

// IPC Messages
ipcRenderer.on('do-initial-load', (event) => {
  getPrefs();
  updatePrefs();
});

ipcRenderer.on('preferencesUpdated', (event, preferences) => {
  getPrefs();
  updatePrefs();
});

