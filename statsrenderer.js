const {ipcRenderer, remote} = require('electron');
const jquery = require('jquery');
const storage = require('electron-json-storage');
const chart = require('electron-chartjs');

const chartdefaults = require('./util/chartdefaults');
const colorgenerator = require('./util/colorgenerator');
const csshandler = require('./util/csshandler');
const statshandler = require('./util/statshandler')
const textformatter = require('./util/textformatter');

var naStr = "N/A";

var preferences = ipcRenderer.sendSync('getPreferences');

var entries = [];
var entryIDs = [];

function doLoad() {
  document.querySelector("#averageTime").textContent = textformatter.toHHMMSS(statshandler.getAverageTime(entries));
  let mostUsed = statshandler.getMostUsedApp(entries);
  document.querySelector("#mostUsedApp").textContent = mostUsed["title"].substring(0, 50) + " (" + textformatter.toHHMMSS(mostUsed["time"]) + ")";
  let leastUsed = statshandler.getLeastUsedApp(entries);
  document.querySelector("#leastUsedApp").textContent = leastUsed["title"].substring(0, 50) + " (" + textformatter.toHHMMSS(leastUsed["time"]) + ")";
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
