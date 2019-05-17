const jsonExport = require('export-from-json');
const log = require('electron-log');
const storage = require('electron-json-storage');

module.exports.saveDataEntries = (entries, entryIDs) => {

  storage.set('entries', JSON.stringify(entries), (error) => {
    if (error) throw error;
  });

  storage.set('entryIDs', JSON.stringify(entryIDs), (error) => {
    if (error) throw error;
  });
}

module.exports.loadDataEntries = () => {
  storage.get('entries', (error, data) => {
    if (error) throw error;
//    console.log(data);
    return data;
  });
}

module.exports.loadDataEntryIDs = () => {
  storage.get('entryIDs', (error, data) => {
    if (error) throw error;
    return data;
  });
}

module.exports.saveDataBlacklist = (entries) => {
  storage.set('entryBlacklist', JSON.stringify(entries), (error) => {
    if (error) throw error;
  });
}

module.exports.loadDataBlacklist = () => {
  storage.get('entryBlacklist', (error, data) => {
    if (error) throw error;
    return data;
  });
}

module.exports.exportData = (data, filename, exportType) => {
  log.info("Exporting data as %c." + exportType, 'color: blue');
  jsonExport({ data: data, fileName: filename, exportType: exportType });
}
