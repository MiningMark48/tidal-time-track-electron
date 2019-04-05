// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer, remote} = require('electron');
const jquery = require('jquery');
const activeWin = require('active-win');
const storage = require('electron-json-storage');
const chart = require('electron-chartjs');

const chartdefaults = require('./chartdefaults');
const colorgenerator = require('./colorgenerator');
const datahandler = require('./datahandler');
const textformatter = require('./textformatter');

const appname = document.querySelector('#appname');
const pauseButton = document.querySelector("#pauseButton");
const chartOne  = document.querySelector("#chartOne");
const chartTwo  = document.querySelector("#chartTwo");
const table = document.querySelector('#infoTable').querySelector('tbody');
const timerClock = document.querySelector("#timerClock");

var interval = 1; //seconds
var naStr = "N/A";

var preferences = ipcRenderer.sendSync('getPreferences');
var chartRefresh = false;
var entryIDDelete = 0;
var hasLoaded = false;
var isPaused = false;
var overallTime = 0;

var entries = [];
var entryIDs = []; 

var chartOneAct;
var chartTwoAct;

setInterval(function() {

  if (isPaused) return; 

  overallTime++;

  if (!hasLoaded) {
    updatePrefs();

    storage.get('entries', function(error, data) {
      if (error) throw error;
      let parsedData = JSON.parse(data);
      for (i = 0; i < parsedData.length; i++) {
        let key = parsedData[i];
        addEntry(key["appID"], key["appTitle"], key["appOwner"], key["appTime"]);
      }
    });
    hasLoaded = true;
  }

  if (preferences["general"]["show_timer"]) timerClock.textContent = textformatter.toHHMMSS(overallTime); 
  
  let objectInfo = activeWin.sync();
  appname.textContent = "Current Window: " + objectInfo["title"];
  
  if (entries === undefined || entryIDs === undefined) {
    entries = {};
    entryIDs = {};
  } 
  
  let testEntry = getNewEntry(objectInfo["id"], objectInfo["title"], objectInfo["owner"]["name"], 0);
  if (!entryIDs.includes(testEntry.appID)) {
    addEntry(testEntry.appID, testEntry.appTitle, testEntry.appOwner, 1);
  } else {
    let prevTime = entries[entryIDs.indexOf(testEntry.appID)].appTime;
    removeEntry(testEntry.appID);
    addEntry(testEntry.appID, testEntry.appTitle, testEntry.appOwner, (prevTime + 1));
  }

  updateTable();
  updateEntries();
//  console.log(entries);
    
    /*
	{
		title: 'Unicorns - Google Search',
		id: 5762,
		bounds: {
			x: 0,
			y: 0,
			height: 900,
			width: 1440
		},
		owner: {
			name: 'Google Chrome',
			processId: 310,
			bundleId: 'com.google.Chrome',
			path: '/Applications/Google Chrome.app'
		},
		memoryUsage: 11015432
	}
	*/

  if (chartRefresh) refreshCharts(); 

}, interval * 1000);

function addEntry(id, title, owner, time) {
  entries.push(getNewEntry(id, title, owner, time));
  entryIDs.push(id);
  updateEntries();
}

function removeEntry(testEntryID) {
  for ( i = 0; i < entryIDs.length; i++){ 
    if ( entryIDs[i] === parseInt(testEntryID)) {
      entries.splice(i, 1); 
      entryIDs.splice(i, 1); 
      updateEntries();
    }
  }
}

function isValidEntry(entry) {
  if (entry.appTitle === naStr && entry.appOwner === naStr && appTime === 0) return false;
  return true;
}

function updateTable() {
    table.innerHTML = "";
    entries.forEach(function(entry) {
       if (entry.appTitle != undefined && isValidEntry(entry)) table.innerHTML = table.innerHTML.concat('<tr id="' + entry.appID +'""><td>' + (entry.appTitle === "" ? naStr : entry.appTitle) + '</td><td>' + (entry.appOwner === "" ? naStr : entry.appOwner) + '</td><td>' + textformatter.toHHMMSS(entry.appTime.toString()) + '</td></tr>');     
    });
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

function deleteAllEntries() {
  entries = [];
  entryIDs = [];
  updateEntries();
  updateTable();
}

function updateEntries() {
  datahandler.saveData(entries, entryIDs);
}

function refreshCharts() {
  renderChartOne();
  renderChartTwo();
}

function renderChartOne() {
  if (chartOneAct != undefined) chartOneAct.destroy();
  let chartType = preferences["charts"]["chart_type_one"];
  if (canRenderChart(chartType)) chartOneAct = getChart(chartOne, chartType);
}

function renderChartTwo() {
  if (chartTwoAct != undefined) chartTwoAct.destroy();
  let chartType = preferences["charts"]["chart_type_two"];
  if (canRenderChart(chartType)) chartTwoAct = getChart(chartTwo, chartType);
}

function getChart(chartNum, chartType) {
  let ctx = chartNum.getContext('2d');

  let data = [];
  let labels = [];
  let colors = [];

  for (i = 0; i < entries.length; i++) {
    let time = entries[i]["appTime"];
    data.push(entries[i]["appTime"]);
    labels.push(entries[i]["appTitle"].substring(0, 15) + " - " + textformatter.toHHMMSS(entries[i]["appTime"]));
    colors.push(colorgenerator.getRandomColor());
  }

  let chartAnimationDuration = preferences["charts"]["chart_animationLength"];

  switch (chartType) {
    default:
    case 'pie':
      return chartdefaults.pie_doughnut(ctx, 'pie', data, labels, colors, chartAnimationDuration);
      break;
    case 'doughnut':
      return chartdefaults.pie_doughnut(ctx, 'doughnut', data, labels, colors, chartAnimationDuration);
      break;
    case 'bar':
      return chartdefaults.bar(ctx, data, labels, colors, chartAnimationDuration);
      break;
  }

}

function canRenderChart(chartType) {
  return (chartType != undefined && chartType != "");
}

function getPrefs() {
  preferences = ipcRenderer.sendSync('getPreferences');
}

function updatePrefs() {
  changeCSS();
  refreshCharts();
  if (!preferences['general']['show_timer']) timerClock.textContent = "";
  chartRefresh = preferences['charts']['chart_refresh'];
  
  console.log('Preferences were updated.')
}

function changeCSS() {
  let cssFile;
  let cssLinkIndex = 2;
  let theme = preferences["styles"]["theme"];

  switch (theme) {
    default:
    case 'dark':
      cssFile = "dark.css";
      break;
    case 'light':
      cssFile = "light.css";
      break;
  }

  let oldLink = document.getElementsByTagName("link").item(cssLinkIndex);

  if (oldLink.getAttribute('href') === ("css/" + cssFile)) return;

  let newLink = document.createElement("link");
  newLink.setAttribute("rel", "stylesheet");
  newLink.setAttribute("type", "text/css");
  newLink.setAttribute("href", "css/" + cssFile);

  document.getElementsByTagName("head").item(0).replaceChild(newLink, oldLink);
}

// IPC Messages
ipcRenderer.on('data', (event, arg) => {
  if (arg === "save") {
    updateEntries();
  } else if (arg === "load") {
    entries = datahandler.loadDataEntries();
    entryIDs = datahandler.loadDataEntryIDs();
  } else {
    console.log("MESSAGE: " + arg)
  }
});

ipcRenderer.on('preferencesUpdated', (event, preferences) => {
    getPrefs();
    console.log('Preferences were reloaded.');
    updatePrefs();
});

ipcRenderer.on('context-reply-delete', (event, arg) => {
  removeEntry(entryIDDelete);
  updateTable();
});

// Buttons
table.addEventListener('contextmenu', (event) => {
  let x = event.clientX;
  let y = event.clientY;
  entryIDDelete = document.elementFromPoint(x, y).parentElement.id;

  ipcRenderer.send('show-context-entry-delete');
});

document.querySelector("#refreshButton").addEventListener('click', (event) => {
  refreshCharts();
});

pauseButton.addEventListener('click', (event) => {
  isPaused = !isPaused;
  if (isPaused) {
    pauseButton.textContent = "Resume";
    pauseButton.classList.add("controlButtons-paused");
    timerClock.classList.add("timer-paused");
  } else {
    pauseButton.textContent = "Pause";
    pauseButton.classList.remove("controlButtons-paused");
    timerClock.classList.remove("timer-paused");
  }
});

document.querySelector("#deleteEntriesButton").addEventListener('click', (event) => {
  console.log("Deleting all (" + entries.length + ") entries...");
  ipcRenderer.send('delete-entries-dialog');
});

ipcRenderer.on('delete-entries-dialog-response', (event, index) => {
  let confirm;
  if (index === 0){
   confirm = true;
  } else {
    confirm = false;
  }

  if (confirm) { 
    deleteAllEntries();
    console.log("All entries deleted."); 
  } else {
    console.log("Canceled entry deletion.");
  }

});