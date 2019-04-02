const storage = require('electron-json-storage');

module.exports.saveData = function(entries, entryIDs) {
  
  storage.set('entries', JSON.stringify(entries), function(error) {
    if (error) throw error;
  });
  
  storage.set('entryIDs', JSON.stringify(entryIDs), function(error) {
    if (error) throw error;
  });
}

module.exports.loadDataEntries = function() {
  storage.get('entries', function(error, data) {
    if (error) throw error;
//    console.log(data);
    return data;
  });
}

module.exports.loadDataEntryIDs = function() {
  storage.get('entryIDs', function(error, data) {
    if (error) throw error;
    return data;
  });
}

module.exports.exportData = function() {
  console.log("Export!");
}