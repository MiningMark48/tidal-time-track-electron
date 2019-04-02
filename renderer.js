// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer} = require('electron');
const jquery = require('jquery');
const activeWin = require('active-win');

const storage = require('electron-json-storage');

const datahandler = require('./datahandler')
const textformatter = require('./textformatter')

const appname = document.querySelector('#appname');
const table = document.querySelector('#infoTable').querySelector('tbody');

var entries = [];
var entryIDs = [];

var naStr = "N/A"; 

var hasLoaded = false;

setInterval(function() {
  var objectInfo = activeWin.sync();
  appname.textContent = "Current ID: " + objectInfo["id"];

  if (!hasLoaded) {
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
  
  if (entries === undefined || entryIDs === undefined) {
    entries = {};
    entryIDs = {};
  } 
  
  var testEntry = getNewEntry(objectInfo["id"], objectInfo["title"], objectInfo["owner"]["name"], 0);
  if (!entryIDs.includes(testEntry.appID)) {
    addEntry(testEntry.appID, testEntry.appTitle, testEntry.appOwner, 0);
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
    
}, 1000);

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
       if (entry.appTitle != undefined && isValidEntry(entry)) table.innerHTML = table.innerHTML.concat('<tr><td>' + (entry.appTitle === "" ? naStr : entry.appTitle) + '</td><td>' + (entry.appOwner === "" ? "N/A" : entry.appOwner) + '</td><td>' + textformatter.toHHMMSS(entry.appTime.toString()) + '</td></tr>');     
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
