'use strict';

/* global Applab */

/**
 * Namespace for app storage.
 */
var AppStorage = module.exports;

/**
 * Reads the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {function(Object)} onSuccess Function to call on success with the
       value retrieved from storage.
 * @param {function(string)} onError Function to call on error with error msg.
 */
AppStorage.getKeyValue = function(key, onSuccess, onError) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleGetKeyValue.bind(req, onSuccess, onError);
  var url = '/v3/shared-properties/' + Applab.channelId + '/' + key;
  req.open('GET', url, true);
  req.send();
};

var handleGetKeyValue = function(onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status === 404) {
    onSuccess(undefined);
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error reading value: unexpected http status ' + this.status);
    return;
  }
  var value = JSON.parse(this.responseText);
  onSuccess(value);
};

/**
 * Saves the value associated with the key, accessible to all users of the app.
 * @param {string} key The name of the key.
 * @param {Object} value The value to associate with the key.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call on error with error msg.
 */
AppStorage.setKeyValue = function(key, value, onSuccess, onError) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleSetKeyValue.bind(req, onSuccess, onError);
  var url = '/v3/shared-properties/' + Applab.channelId + '/' + key;
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(value));
};

var handleSetKeyValue = function(onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error writing value: unexpected http status ' + this.status);
    return;
  }
  onSuccess();
};

/**
 * Creates a new record in the specified table, accessible to all users.
 * @param {string} tableName The name of the table to read from.
 * @param {Object} record Object containing other properties to store
 *     on the record.
 * @param {function(Object)} onSuccess Function to call with the new record.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.createRecord = function(tableName, record, onSuccess, onError) {
  if (!tableName) {
    onError('error creating record: missing required parameter "tableName"');
    return;
  }
  if (record.id) {
    onError('error creating record: record must not have an "id" property');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleCreateRecord.bind(req, onSuccess, onError);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' + tableName;
  req.open('POST', url, true);
  req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  req.send(JSON.stringify(record));
};

var handleCreateRecord = function(onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error creating record: unexpected http status ' + this.status);
    return;
  }
  var record = JSON.parse(this.responseText);
  onSuccess(record);
};

/**
 * Reads records which match the searchParams specified by the user,
 * and passes them to onSuccess.
 * @param {string} tableName The name of the table to read from.
 * @param {string} searchParams.id Optional id of record to read.
 * @param {Object} searchParams Other search criteria. Only records
 *     whose contents match all criteria will be returned.
 * @param {function(Array)} onSuccess Function to call with an array of record
       objects.
 * @param {function(string)} onError Function to call with an error message
 *     in case of failure.
 */
AppStorage.readRecords = function(tableName, searchParams, onSuccess, onError) {
  if (!tableName) {
    onError('error reading records: missing required parameter "tableName"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleReadRecords.bind(req,
      searchParams, onSuccess, onError);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' + tableName;
  req.open('GET', url, true);
  req.send();

};

var handleReadRecords = function(searchParams, onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error reading records: unexpected http status ' + this.status);
    return;
  }
  var records = JSON.parse(this.responseText);
  records = records.filter(function(record) {
    for (var prop in searchParams) {
      if (record[prop] !== searchParams[prop]) {
        return false;
      }
    }
    return true;
  });
  onSuccess(records);
};

/**
 * Updates a record in a table, accessible to all users.
 * @param {string} tableName The name of the table to update.
 * @param {string} record.id The id of the row to update.
 * @param {Object} record Object containing other properties to update
 *     on the record.
 * @param {function(Object, boolean)} onComplete Function to call on success,
 *     or if the record id is not found.
 * @param {function(string)} onError Function to call with an error message
 *     in case of other types of failures.
 */
AppStorage.updateRecord = function(tableName, record, onComplete, onError) {
  if (!tableName) {
    onError('error updating record: missing required parameter "tableName"');
    return;
  }
  var recordId = record.id;
  if (!recordId) {
    onError('error updating record: missing required property "id"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleUpdateRecord.bind(req, tableName, record, onComplete, onError);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' +
      tableName + '/' + recordId;
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(record));
};

var handleUpdateRecord = function(tableName, record, onComplete, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status === 404) {
    onComplete(null, false);
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error updating record: unexpected http status ' + this.status);
    return;
  }
  onComplete(record, true);
};

/**
 * Deletes a record from the specified table.
 * @param {string} tableName The name of the table to delete from.
 * @param {string} record.id The id of the record to delete.
 * @param {Object} record Object whose other properties are ignored.
 * @param {function(boolean)} onComplete Function to call on success, or if the
 *     record id is not found.
 * @param {function(string)} onError Function to call with an error message
 *     in case of other types of failures.
 */
AppStorage.deleteRecord = function(tableName, record, onComplete, onError) {
  if (!tableName) {
    onError('error deleting record: missing required parameter "tableName"');
    return;
  }
  var recordId = record.id;
  if (!recordId) {
    onError('error deleting record: missing required property "id"');
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handleDeleteRecord.bind(req, tableName, record, onComplete, onError);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' +
      tableName + '/' + recordId + '/delete';
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(JSON.stringify(record));
};

var handleDeleteRecord = function(tableName, record, onComplete, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }
  if (this.status === 404) {
    onComplete(false);
    return;
  }
  if (this.status < 200 || this.status >= 300) {
    onError('error deleting record: unexpected http status ' + this.status);
    return;
  }
  onComplete(true);
};

/**
 * This is a partial implementation of onRecordEvent in the following ways:
 * 1. it polls instead of properly listening for notifications when data changes;
 * 2. it only issues callbacks when records are created (not updated or deleted);
 * 3. it assumes that record ids are strictly increasing. This is not currently true but
 *    would become so if we decide to implement
 *    https://www.pivotaltracker.com/story/show/110169770
 * @param tableName Table to listen to.
 * @param onRecord Callback to call when a record is added to the table.
 * @param onError Callback to call with an error to show to the user.
 */
AppStorage.onRecordEvent = function(tableName, onRecord, onError) {
  if (!tableName) {
    onError('Error listening for record events: missing required parameter "tableName"');
    return;
  }

  if (!addRecordListener(tableName, onRecord)) {
    onError('You are already listening for events on table "' + tableName + '". ' +
      'only on event handler can be registered per table.');
  }
};

var RECORD_INTERVAL = 1000; // 1 second

/**
 *  @type {Object} Map from tableName to callback
 */
var recordListeners = {};

/**
 * @typedef {Object.<number, string>} IdToJsonMap Map from record id
 * to a JSON.stringified copy of the corresponding record.
 */

/**
 * @type {Object.<string, IdToJsonMap>} Map from tableName to a
 * IdToJsonMap of its previous contents.
 */
var idToJsonMaps = {};

var recordIntervalId = null;

var RecordEventType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
};

/**
 * Returns true if adding the listener succeeded, or false if
 * a listener already existed for the specified table.
 */
function addRecordListener(tableName, callback) {
  if (typeof recordListeners[tableName] === 'function') {
    return false;
  }

  recordListeners[tableName] = callback;
  idToJsonMaps[tableName] = {};

  if (recordIntervalId === null) {
    recordIntervalId = setInterval(function recordListener() {
      for (var tableName in recordListeners) {
        fetchNewRecords(tableName);
      }
    }, RECORD_INTERVAL);
  }
  return true;
}

function fetchNewRecords(tableName) {
  var req = new XMLHttpRequest();
  req.onreadystatechange = reportRecords.bind(req, tableName);
  var url = '/v3/shared-tables/' + Applab.channelId + '/' + tableName;
  req.open('GET', url, true);
  req.send();
}

function reportRecords(tableName) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }

  if (this.status < 200 || this.status >= 300) {
    // ignore errors
    return;
  }

  var callback = recordListeners[tableName];
  var records = JSON.parse(this.responseText);

  // Set up some maps to help with analysis
  var oldIdToJsonMap = idToJsonMaps[tableName];
  var newIdToJsonMap = {};
  var newIdToRecordMap = {};
  for (var i = 0; i < records.length; i++) {
    var record = records[i];
    newIdToRecordMap[record.id] = record;
    newIdToJsonMap[record.id] = JSON.stringify(record);
  }

  // Iterate over all records (including old ones) so that deletes can be detected.
  var allRecordIds = Object.keys($.extend({}, oldIdToJsonMap, newIdToJsonMap));
  for (var j = 0; j < allRecordIds.length; j++) {
    var id = allRecordIds[j];
    reportRecord(callback, id, newIdToRecordMap[id], oldIdToJsonMap[id], newIdToJsonMap[id]);
  }

  // Update the map for this table to reflect the new records.
  idToJsonMaps[tableName] = newIdToJsonMap;
}

function reportRecord(callback, id, record, oldJson, newJson) {
  if (newJson) {
    if (!oldJson) {
      callback(record, RecordEventType.CREATE);
    } else if (oldJson != newJson) {
      callback(record, RecordEventType.UPDATE);
    }
  } else {
    if (oldJson) {
      // Provide only the id of the deleted record.
      callback({id: id}, RecordEventType.DELETE);
    }
  }
}

AppStorage.clearRecordListeners = function () {
  if (recordIntervalId) {
    clearInterval(recordIntervalId);
    recordIntervalId = null;
  }
  recordListeners = {};
  idToJsonMaps = {};
};

/**
 * Populates a channel with table data for one or more tables
 * @param {string} jsonData The json data that represents the tables in the format of:
 *   {
 *     "table_name": [{ "name": "Trevor", "age": 30 }, { "name": "Hadi", "age": 72}],
 *     "table_name2": [{ "city": "Seattle", "state": "WA" }, { "city": "Chicago", "state": "IL"}]
 *   }
 * @param {bool} overwrite Whether to overwrite a table if it already exists.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.populateTable = function (jsonData, overwrite, onSuccess, onError) {
  if (!jsonData || !jsonData.length) {
    return;
  }
  var req = new XMLHttpRequest();
  req.onreadystatechange = handlePopulateTable.bind(req, onSuccess, onError);
  var url = '/v3/shared-tables/' + Applab.channelId;
  if (overwrite) {
    url += "?overwrite=1";
  }
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(jsonData);
};

var handlePopulateTable = function (onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }

  if (this.status != 200) {
    if (onError) {
      onError('error populating tables: unexpected http status ' + this.status);
    }
    return;
  }
  if (onSuccess) {
    onSuccess();
  }
};

/**
 * Populates the key/value store with initial data
 * @param {string} jsonData The json data that represents the tables in the format of:
 *   {
 *     "click_count": 5,
 *     "button_color": "blue"
 *   }
 * @param {bool} overwrite Whether to overwrite a table if it already exists.
 * @param {function()} onSuccess Function to call on success.
 * @param {function(string)} onError Function to call with an error message
 *    in case of failure.
 */
AppStorage.populateKeyValue = function (jsonData, overwrite, onSuccess, onError) {
  if (!jsonData || !jsonData.length) {
    return;
  }
  var req = new XMLHttpRequest();

  req.onreadystatechange = handlePopulateKeyValue.bind(req, onSuccess, onError);
  var url = '/v3/shared-properties/' + Applab.channelId;

  if (overwrite) {
    url += "?overwrite=1";
  }
  req.open('POST', url, true);
  req.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
  req.send(jsonData);
};

var handlePopulateKeyValue = function (onSuccess, onError) {
  var done = XMLHttpRequest.DONE || 4;
  if (this.readyState !== done) {
    return;
  }

  if (this.status != 200) {
    if (onError) {
      onError('error populating kv: unexpected http status ' + this.status);
    }
    return;
  }
  if (onSuccess) {
    onSuccess();
  }
};
