// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {ipcRenderer, remote} = require('electron');
const activeWin = require('active-win');
const chart = require('electron-chartjs');
const jquery = require('jquery');
const log = require('electron-log');
const storage = require('electron-json-storage');

const chartdefaults = require('./util/chartdefaults');
const colorgenerator = require('./util/colorgenerator');
const csshandler = require('./util/csshandler');
const datahandler = require('./util/datahandler');
const snackbarhandler = require('./util/snackbarhandler');
const tablesorter = require('./util/tablesorter');
const textformatter = require('./util/textformatter');
const timeanddate = require('./util/timeanddate');

const controlButtons  = document.getElementsByClassName('controlButtons');
const appname = document.querySelector('#appname');
const chartOne  = document.querySelector('#chartOne');
const chartTwo  = document.querySelector('#chartTwo');
const pauseButton = document.querySelector('#pauseButton');
const snackbar = document.querySelector('#snackbar');
const table = document.querySelector('#infoTable').querySelector('tbody');
const tableHead = document.querySelector("#infoTable").querySelector('thead');
const timerClock = document.querySelector("#timerClock");

const interval = 1; //seconds
const naStr = "N/A";
const snackbarTime = 3;

var preferences = ipcRenderer.sendSync('getPreferences');
var chartRefresh = false;
var entryIDContextSelect = 0;
var hasLoaded = false;
var isPaused = false;
var overallTime = 0;

var tableSortDir = 'asc';
var tableSortIndex = 2;

var entries = [];
var entryIDs = [];
var entryColors = [];
var entriesBlacklist = [];

var chartOneAct;
var chartTwoAct;

setInterval(() => {

  if (isPaused) return;

  overallTime++;

  if (!hasLoaded) {
    updatePrefs();

    storage.get('entries', (error, data) => {
      if (error) throw error;
      let parsedData = JSON.parse(data);
      for (i = 0; i < parsedData.length; i++) {
        let key = parsedData[i];
        addEntry(key["appID"], key["appTitle"], key["appOwner"], key["appTime"]);
      }
      log.info("%cExisting entries loaded.", 'color: green');
    });

    storage.get('entryBlacklist', (error, data) => {
      if (error) throw error;
      let parsedData = JSON.parse(data);
      for (i = 0; i < parsedData.length; i++) {
        let key = parsedData[i];
        blacklistEntry(key);
      }
      log.info("%cExisting blacklist loaded.", 'color: green');
    });

    hasLoaded = true;
  }

  if (preferences["general"]["show_timer"]) timerClock.textContent = textformatter.toHHMMSS(overallTime);

  let objectInfo = activeWin.sync();
  appname.textContent = objectInfo["title"].substring(0, 40) + " || " + objectInfo["id"];

  if (entries === undefined || entryIDs === undefined) {
    entries = [];
    entryIDs = [];
  }

  let testEntry = getNewEntry(objectInfo["id"], objectInfo["title"], objectInfo["owner"]["name"], 0);
  if (!entriesBlacklist.includes(testEntry.appID.toString())) {
    if (!entryIDs.includes(testEntry.appID)) {
      addEntry(testEntry.appID, testEntry.appTitle, testEntry.appOwner, 1);
      entryColors.push(colorgenerator.getRandomColor());
    } else {
      let prevTime = entries[entryIDs.indexOf(testEntry.appID)].appTime;
      removeEntry(testEntry.appID);
      addEntry(testEntry.appID, testEntry.appTitle, testEntry.appOwner, (prevTime + 1));
    }
  }

  updateTable();
  updateEntries();

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

function blacklistEntry(testEntryID) {
  entriesBlacklist.push(testEntryID.toString());
}

function clearBlacklist() {
  entriesBlacklist = [];
}

function isValidEntry(entry) {
  if (entry.appTitle === naStr && entry.appOwner === naStr && appTime === 0) return false;
  return true;
}

function updateTable() {
  table.innerHTML = "";
  entries.forEach((entry) => {
    if (entry.appTitle != undefined && isValidEntry(entry)) table.innerHTML = table.innerHTML.concat('<tr id="' + entry.appID +'""><td>' + (entry.appTitle === "" ? naStr : entry.appTitle.substring(0, 100)) + '</td><td>' + (entry.appOwner === "" ? naStr : entry.appOwner) + '</td><td>' + textformatter.toHHMMSS(entry.appTime.toString()) + '</td></tr>');
  });
  tablesorter.sortTable(infoTable, tableSortIndex, tableSortDir);
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
  datahandler.saveDataEntries(entries, entryIDs);
  datahandler.saveDataBlacklist(entriesBlacklist);
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

  if (!preferences["charts"]["chart_colors"]) colors = entryColors;

  for (i = 0; i < entries.length; i++) {
    let time = entries[i]["appTime"];
    data.push(entries[i]["appTime"]);
    labels.push(entries[i]["appTitle"].substring(0, 15) + " - " + textformatter.toHHMMSS(entries[i]["appTime"]));

    for (j = 0; j < (entries.length - colors.length); j++) {
      colors.push(colorgenerator.getRandomColor());
    }
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
    case 'line':
      return chartdefaults.line(ctx, data, labels, colors, colors[0], chartAnimationDuration);
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

  log.info("%cPreferences were updated.", 'color: green');
}

function changeCSS() {
  let prefStyles = preferences["styles"];
  let useCustom = (prefStyles["theme"] === 'custom');

  if(!useCustom) csshandler.changeCSS(prefStyles["theme"]);

  csshandler.setCustomStyle('bg', document.body, prefStyles["styles_color_background"], useCustom);
  csshandler.setCustomStyle('bg', tableHead, prefStyles["styles_color_thBackground"], useCustom);
  csshandler.setCustomStyle('bg', table, prefStyles["styles_color_tbBackground"], useCustom);
  csshandler.setCustomStyle('fc', document.body, prefStyles["styles_color_font"], useCustom);
  csshandler.setCustomStyle('fc', tableHead, prefStyles["styles_color_thFont"], useCustom);
  csshandler.setCustomStyle('fc', table, prefStyles["styles_color_tbFont"], useCustom);

  Array.prototype.slice.call(controlButtons).forEach((button) => {
    // csshandler.setCustomStyle('bg', button, prefStyles["styles_color_buttonBackground"], useCustom);
    csshandler.setCustomStyle('fc', button, prefStyles["styles_color_buttonFont"], useCustom);
  });
}

// IPC Messages
ipcRenderer.on('do-initial-load', (event) => {
  updatePrefs();
});

ipcRenderer.on('data', (event, arg) => {
  switch (arg) {
    default:
      log.error("Unknown Data Argument: ", arg);
      break;
    case 'save':
      updateEntries();
      break;
    case 'load':
      entries = datahandler.loadDataEntries();
      entryIDs = datahandler.loadDataEntryIDs();
      entriesBlacklist = datahandler.loadDataBlacklist();
      break;
  }
});

ipcRenderer.on('import-data', (event, arg) => {
  deleteAllEntries();
  let parsedData = JSON.parse(arg);
  for (i = 0; i < parsedData.length; i++) {
    let key = parsedData[i];
    addEntry(key["appID"], key["appTitle"], key["appOwner"], key["appTime"]);
  }
  snackbarhandler.show("Imported entry data", snackbarTime);
  log.info("%cImported entry data.", 'color: green');
});

ipcRenderer.on('export-data', (event, arg) => {
  let date = timeanddate.getDateToday();
  let filename = 'entries_' + date;
  datahandler.exportData(JSON.stringify(entries), filename, arg);
});

ipcRenderer.on('preferencesUpdated', (event, preferences) => {
    getPrefs();
    // console.log('Preferences were reloaded.');
    updatePrefs();
});

ipcRenderer.on('context-reply-delete', (event, arg) => {
  removeEntry(entryIDContextSelect);
  updateTable();
});

ipcRenderer.on('context-reply-blacklist', (event, arg) => {
  removeEntry(entryIDContextSelect);
  blacklistEntry(entryIDContextSelect);
  updateTable();
  snackbarhandler.show("Entry blacklisted", snackbarTime);
});

ipcRenderer.on('context-reply-blacklistClear', (event, arg) => {
  clearBlacklist();
  snackbarhandler.show("Entry blacklist cleared", snackbarTime);
});

ipcRenderer.on('theme-import', (event, arg) => {
  let data = JSON.parse(arg);
  let tempPrefs = preferences;
  tempPrefs['styles']['styles_color_background'] = data['styles_color_background'];
  // tempPrefs['styles']['styles_color_buttonBackground'] = data['styles_color_buttonBackground'];
  tempPrefs['styles']['styles_color_buttonFont'] = data['styles_color_buttonFont'];
  tempPrefs['styles']['styles_color_font'] = data['styles_color_font'];
  tempPrefs['styles']['styles_color_tbBackground'] = data['styles_color_tbBackground'];
  tempPrefs['styles']['styles_color_tbFont'] = data['styles_color_tbFont'];
  tempPrefs['styles']['styles_color_thBackground'] = data['styles_color_thBackground'];
  tempPrefs['styles']['styles_color_thFont'] = data['styles_color_thFont'];

  ipcRenderer.sendSync('setPreferences', tempPrefs);
  changeCSS();
  snackbarhandler.show("Imported custom theme", snackbarTime);
  log.info("%cImported custom theme.", 'color: green');
});

ipcRenderer.on('theme-export', (event) => {
  let styles = preferences['styles'];
  let data = {
    styles_color_background: styles["styles_color_background"],
    // styles_color_buttonBackground: styles["styles_color_buttonBackground"],
    styles_color_buttonFont: styles["styles_color_buttonFont"],
    styles_color_font: styles["styles_color_font"],
    styles_color_tbBackground: styles["styles_color_tbBackground"],
    styles_color_tbFont: styles["styles_color_tbFont"],
    styles_color_thBackground: styles["styles_color_thBackground"],
    styles_color_thFont: styles["styles_color_thFont"]
  };
  datahandler.exportData(data, 'custom_theme', 'json');
});

  //AutoUpdate Messages
ipcRenderer.on('auto-update', (event, message) => {
  snackbarhandler.show(message, snackbarTime);
});

//Table Sort Control
document.querySelector("#tableColumn0").addEventListener('click', (event) => {
  tableSortDir = (tableSortDir === 'desc') ? 'asc' : 'desc';
  tableSortIndex = 0;
  updateTable();
});

document.querySelector("#tableColumn1").addEventListener('click', (event) => {
  tableSortDir = (tableSortDir === 'desc') ? 'asc' : 'desc';
  tableSortIndex = 1;
  updateTable();
});

document.querySelector("#tableColumn2").addEventListener('click', (event) => {
  tableSortDir = (tableSortDir === 'desc') ? 'asc' : 'desc';
  tableSortIndex = 2;
  updateTable();
});

// Buttons
table.addEventListener('contextmenu', (event) => {
  let x = event.clientX;
  let y = event.clientY;
  entryIDContextSelect = document.elementFromPoint(x, y).parentElement.id;

  ipcRenderer.send('show-context-entry');
});

document.querySelector("#refreshButton").addEventListener('click', (event) => {
  refreshCharts();
  snackbarhandler.show("Charts refreshed", snackbarTime);
});

pauseButton.addEventListener('click', (event) => {
  isPaused = !isPaused;
  let tooltip = document.querySelector("#pauseButtonTooltip");
  let tableDiv = document.querySelector("#tableDiv");
  if (isPaused) {
    pauseButton.innerHTML = "<i class='fas fa-play'></i>";
    tooltip.textContent = "Resume Tracking";
    pauseButton.style = "";
    pauseButton.classList.add("controlButtons-paused");
    timerClock.classList.add("timer-paused");
    tableDiv.classList.add("table-paused");
    snackbarhandler.show("Paused Tracking", snackbarTime);
  } else {
    pauseButton.innerHTML = "<i class='fas fa-pause'></i>";
    tooltip.textContent = "Pause Tracking";
    pauseButton.classList.remove("controlButtons-paused");
    timerClock.classList.remove("timer-paused");
    tableDiv.classList.remove("table-paused");
    changeCSS();
    snackbarhandler.show("Resumed Tracking", snackbarTime);
  }
});

document.querySelector("#deleteEntriesButton").addEventListener('click', (event) => {
  log.info("Deleting all (" + entries.length + ") entries...");
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
    snackbarhandler.show("All entries deleted", snackbarTime);
    log.info("All entries deleted.");
  } else {
    log.info("Canceled entry deletion.");
  }

});

document.querySelector("#statsButton").addEventListener('click', (event) => {
  snackbarhandler.show("Loading statistics...", snackbarTime);
  ipcRenderer.send('show-statistics', entries);
});
