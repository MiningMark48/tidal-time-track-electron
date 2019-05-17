const {ipcRenderer, remote} = require('electron');
const jquery = require('jquery');
const storage = require('electron-json-storage');
const chart = require('electron-chartjs');

const chartdefaults = require('./util/chartdefaults');
const colorgenerator = require('./util/colorgenerator');
const csshandler = require('./util/csshandler');
const snackbarhandler = require('./util/snackbarhandler');
const statshandler = require('./util/statshandler')
const tablesorter = require('./util/tablesorter');
const textformatter = require('./util/textformatter');

const table = document.querySelector('#infoTable').querySelector('tbody');

const controlButtons  = document.getElementsByClassName('controlButtons');
const statsContainers  = document.getElementsByClassName('statsContainerItem');

var preferences = ipcRenderer.sendSync('getPreferences');

const naStr = "N/A";
const snackbarTime = 3;

var entries = [];
var entryIDs = [];
var tableSortDir = 'desc';
var tableSortIndex = 2;

function doLoad() {
  document.querySelector("#averageTime").textContent = textformatter.toHHMMSS(statshandler.getAverageTime(entries));
  let mostUsed = statshandler.getMostUsedApp(entries);
  document.querySelector("#mostUsedApp").textContent = mostUsed["title"].substring(0, 50) + " (" + textformatter.toHHMMSS(mostUsed["time"]) + ")";
  let leastUsed = statshandler.getLeastUsedApp(entries);
  document.querySelector("#leastUsedApp").textContent = leastUsed["title"].substring(0, 50) + " (" + textformatter.toHHMMSS(leastUsed["time"]) + ")";

  updateTable();

}

function getEntries() {
  storage.get('entries', function(error, data) {
    if (error) throw error;
    let parsedData = JSON.parse(data);
    for (i = 0; i < parsedData.length; i++) {
      let key = parsedData[i];
      addEntry(key["appID"], key["appTitle"], key["appOwner"], key["appTime"]);
    }
    doLoad();
  });
}

function addEntry(id, title, owner, time) {
  entries.push(getNewEntry(id, title, owner, time));
  entryIDs.push(id);
}

function getNewEntry(id, title, owner, time) {
  let entry = {
    appID: id,
    appTitle: title,
    appOwner: owner,
    appTime: time
  }
  return entry;
}

function updateTable() {
  table.innerHTML = "";
  entries.forEach(function(entry) {
    if (entry.appTitle != undefined && isValidEntry(entry)) table.innerHTML = table.innerHTML.concat('<tr id="' + entry.appID +'""><td>' + (entry.appTitle === "" ? naStr : entry.appTitle.substring(0, 100)) + '</td><td>' + (entry.appOwner === "" ? naStr : entry.appOwner) + '</td><td>' + textformatter.toHHMMSS(entry.appTime.toString()) + '</td></tr>');
  });
  tablesorter.sortTable(infoTable, tableSortIndex, tableSortDir);
}

function isValidEntry(entry) {
  if (entry.appTitle === naStr && entry.appOwner === naStr && appTime === 0) return false;
  return true;
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

  Array.prototype.slice.call(statsContainers).forEach(function(container) {
    csshandler.setCustomStyle('bg', container, prefStyles["styles_color_buttonBackground"], useCustom);
    csshandler.setCustomStyle('fc', container, prefStyles["styles_color_buttonFont"], useCustom);
  });

  Array.prototype.slice.call(controlButtons).forEach(function(button) {
    csshandler.setCustomStyle('bg', button, prefStyles["styles_color_buttonBackground"], useCustom);
    csshandler.setCustomStyle('fc', button, prefStyles["styles_color_buttonFont"], useCustom);
  });

}

// IPC Messages
ipcRenderer.on('do-initial-load', (event) => {
  changeCSS();
  getEntries();
});

ipcRenderer.on('preferencesUpdated', (event, preferences) => {
  getPrefs();
  console.log('Preferences were reloaded.');
  updatePrefs();
});

//Buttons
document.querySelector("#backButton").addEventListener('click', (event) => {
  ipcRenderer.send('back-to-main');
});

document.querySelector("#mostUsedButton").addEventListener('click', (event) => {
  tableSortDir = 'desc';
  tableSortIndex = 2;
  updateTable();
  snackbarhandler.show("Sorting by most time spent", snackbarTime);
});

document.querySelector("#leastUsedButton").addEventListener('click', (event) => {
  tableSortDir = 'asc';
  tableSortIndex = 2;
  updateTable();
  snackbarhandler.show("Sorting by least time spent", snackbarTime);
});
