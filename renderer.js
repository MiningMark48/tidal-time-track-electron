// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer, remote} = require('electron');
const jquery = require('jquery');
const activeWin = require('active-win');
const storage = require('electron-json-storage');
const chart = require('electron-chartjs');

const colorgenerator = require('./colorgenerator');
const datahandler = require('./datahandler');
const textformatter = require('./textformatter');

const appname = document.querySelector('#appname');
const pauseButton = document.querySelector("#pauseButton");
const pieChart  = document.querySelector("#pieChart");
const table = document.querySelector('#infoTable').querySelector('tbody');
const timerClock = document.querySelector("#timerClock");

var interval = 1; //seconds
var naStr = "N/A";

var preferences = ipcRenderer.sendSync('getPreferences');
var chartRefresh = false;
var hasLoaded = false;
var isPaused = false;
var overallTime = 0;

var entries = [];
var entryIDs = []; 

var pieChartAct;

setInterval(function() {

  if (isPaused) return; 

  overallTime++;

  if (!hasLoaded) {
    updatePrefs();

    storage.get('entries', function(error, data) {
      if (error) throw error;
      var parsedData = JSON.parse(data);
      for (i = 0; i < parsedData.length; i++) {
        var key = parsedData[i];
        addEntry(key["appID"], key["appTitle"], key["appOwner"], key["appTime"]);
      }
    });
    hasLoaded = true;
  }

  if (preferences["general"]["show_timer"]) timerClock.textContent = textformatter.toHHMMSS(overallTime); 
  
  var objectInfo = activeWin.sync();
  appname.textContent = "Current Window: " + objectInfo["title"];
  
  if (entries === undefined || entryIDs === undefined) {
    entries = {};
    entryIDs = {};
  } 
  
  var testEntry = getNewEntry(objectInfo["id"], objectInfo["title"], objectInfo["owner"]["name"], 0);
  if (!entryIDs.includes(testEntry.appID)) {
    addEntry(testEntry.appID, testEntry.appTitle, testEntry.appOwner, 1);
  } else {
    var prevTime = entries[entryIDs.indexOf(testEntry.appID)].appTime;
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
    for ( var i = 0; i < entryIDs.length; i++){ 
        if ( entryIDs[i] === testEntryID) {
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
       if (entry.appTitle != undefined && isValidEntry(entry)) table.innerHTML = table.innerHTML.concat('<tr><td>' + (entry.appTitle === "" ? naStr : entry.appTitle) + '</td><td>' + (entry.appOwner === "" ? naStr : entry.appOwner) + '</td><td>' + textformatter.toHHMMSS(entry.appTime.toString()) + '</td></tr>');     
    });
}

function getNewEntry(id, title, owner, time) {
    var entry = {
        appID: id,
        appTitle: title,
        appOwner: owner,
        appTime: time
    }
    return entry;
}

function updateEntries() {
  datahandler.saveData(entries, entryIDs);
}

function refreshCharts() {
  renderPieChart();
}

function renderPieChart() {
  var ctx = pieChart.getContext('2d');

  var data = [];
  var labels = [];
  var colors = [];

  for (i = 0; i < entries.length; i++) {
    var time = entries[i]["appTime"];
    data.push(entries[i]["appTime"]);
    labels.push(entries[i]["appTitle"].substring(0, 15) + " - " + textformatter.toHHMMSS(entries[i]["appTime"]));
    colors.push(colorgenerator.getRandomColor());
  }

  if (pieChartAct != undefined) {
    pieChartAct.destroy();
  }

  pieChartAct = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: "Time Spent",
        backgroundColor: colors,
        data: data
      }]
    },
    options: {
      legend: {
        display: false
      },
      title: {
        display: false,
        text: 'Time Spent'
      },
      animation: {
        duration: 0
      }
    }
  });

}

function getPrefs() {
  preferences = ipcRenderer.sendSync('getPreferences');
}

function updatePrefs() {
  if (!preferences['general']['show_timer']) timerClock.textContent = "";
  chartRefresh = preferences['charts']['chart_refresh'];
  changeCSS();  

  console.log('Preferences were updated.')
}

function changeCSS() {
  var cssFile;
  var cssLinkIndex = 2;
  var theme = preferences["styles"]["theme"];

  switch (theme) {
    default:
    case 'dark':
      cssFile = "dark.css";
      break;
    case 'light':
      cssFile = "light.css";
      break;
  }

  var oldLink = document.getElementsByTagName("link").item(cssLinkIndex);

  if (oldLink.getAttribute('href') === ("css/" + cssFile)) return;

  var newLink = document.createElement("link");
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

ipcRenderer.on('preferencesUpdated', (e, preferences) => {
    getPrefs();
    console.log('Preferences were reloaded.');
    updatePrefs();
});

// Buttons
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