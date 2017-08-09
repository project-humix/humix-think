/**
 * Copyright 2014 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var nano = require('nano');
var when = require('when');
var util = require('util');
var fs = require('fs');

var settings;
var appname;
var humixdb = null;
var currentFlowRev = null;
var currentSettingsRev = null;
var currentCredRev = null;

var libraryCache = {};

function SenseId(senseId) {
  return senseIdPrefix + senseId;
}

function prepopulateFlows(resolve, reject) {
  var key = appname + "/" + "flow";
  humixdb.get(key, function(err, doc) {
    if (err) {
      var promises = [];
      if (fs.existsSync(__dirname + "/defaults/flow.json")) {
        try {
          var flows = require(__dirname + "/defaults/flow.json");
          console.log(">> Adding default flow");
          promises.push(couchstorage.saveFlows(flows));
        } catch (err) {
          console.error(`>> Failed to load existing flows: ${err}`);
        }
      } else {
        console.log(">> No default flow found");
      }
      if (fs.existsSync(__dirname + "/defaults/flow_cred.json")) {
        try {
          var creds = require(__dirname + "/defaults/flow_cred.json");
          console.log(">> Adding default credentials");
          // console.log('default credential is :' + JSON.stringify(cred));
          promises.push(couchstorage.saveCredentials(creds));
        } catch (err) {
          console.error(`>> Failed to load existing credentials ${err}`);
        }
      } else {
        console.log('>> No default credentials found');
      }
      when.settle(promises).then(function() {
        resolve();
      })
      .catch(function(err) {
        console.error('failed to save flows/credentials');
        reject(err);
      });
    } else {
      resolve();
    }
  });
}


var couchstorage = {
  init: function(_settings) {
    settings = _settings;
    var couchDb = nano(settings.couchUrl);
    appname = settings.appName;
    var dbname = appname+'-db' || 'nodered';
    console.log('dbname is : ' + dbname);

    return when.promise(function(resolve, reject) {
      couchDb.db.get(dbname, function(err, body) {
      if (err) {
        couchDb.db.create(dbname, function(err, body) {
          if (err) {
            reject(`Failed to create database: ${err}`);
          } else {
            humixdb = couchDb.use(dbname);
            humixdb.insert({
              views: {
                flow_entries_by_app_and_type: {
                  map: function(doc) {
                    var p = doc._id.split("/");
                    if (p.length > 2 && p[2] == "flow") {
                      var meta = {
                        path: p.slice(3).join("/")
                      };
                      emit([p[0], p[2]], meta);
                    }
                  }
                },
                lib_entries_by_app_and_type: {
                  map: function(doc) {
                    var p = doc._id.split("/");
                    if (p.length > 2) {
                      if (p[2] != "flow") {
                        var pathParts = p.slice(3, -1);
                        for (var i = 0; i < pathParts.length; i++) {
                          emit([p[0], p[2], pathParts.slice(0, i).join("/")], {
                            dir: pathParts.slice(i, i + 1)[0]
                          });
                        }
                        var meta = {};
                        for (var key in doc.meta) {
                          meta[key] = doc.meta[key];
                        }
                        meta.fn = p.slice(-1)[0];
                        emit([p[0], p[2], pathParts.join("/")], meta);
                      }
                    }
                  }
                }
              }
            }, "_design/library", function(err, b) {
              if (err) {
                reject(`Failed to create view: ${err}`);
              } else {
                prepopulateFlows(resolve, reject);
              }
            });

            var designDoc = {
              _id: '_design/module',
              views: {
                get_senseIds: {
                  map: 'function(doc){ \n  if(doc.senseId && doc.senseIcon){\n   emit(doc.senseId, {senseId:doc.senseId,senseIcon:doc.senseIcon});\n  } \n}'
                },
                get_module_by_senseID: {
                  map: 'function(doc){ \n  if(doc.senseID){\n   emit(doc.senseID, doc.moduleID);\n  } \n}'
                },
                get_module_by_senseID_and_moduleID: {
                  map: 'function(doc){ \n  if(doc.senseID && doc.moduleID ){\n   emit([doc.senseID,doc.moduleID], doc);\n  } \n}'
                }
              }
            };

            humixdb.get('_design/module', function(err, body) {
              if (!err) {
                console.log('design doc already created');
              } else {
                humixdb.insert(designDoc, '_design/module', function(err) {
                  if (err) {
                    console.error('failed to create design doc');
                  } else {
                    console.log('design doc created');
                  }
                });
              }
            });
          }
        });
      } else {
        humixdb = couchDb.use(dbname);
        prepopulateFlows(resolve, reject);
      }
      });
    });
  },


  getFlows: function() {
    var key = appname + "/" + "flow";
    return when.promise(function(resolve, reject) {
      humixdb.get(key, function(err, doc) {
        if (err) {
          if (err.status_code != 404) {
            reject(err.toString());
          } else {
            resolve([]);
          }
        } else {
          currentFlowRev = doc._rev;
          resolve(doc.flow);
        }
      });
    });
  },

  saveFlows: function(flows) {
    var key = appname + "/" + "flow";
    return when.promise(function(resolve, reject) {
      var doc = {
        _id: key,
        flow: flows
      };
      if (currentFlowRev) {
         doc._rev = currentFlowRev;
      }
      humixdb.insert(doc, function(err, db) {
        if (err) {
           reject(err.toString());
        } else {
           currentFlowRev = db.rev;
           resolve();
        }
      });
    });
  },

  getCredentials: function() {
    var key = appname + "/" + "credential";
    return when.promise(function(resolve, reject) {
      humixdb.get(key, function(err, doc) {
        if (err) {
           if (err.status_code != 404) {
              reject(err.toString());
           } else {
              resolve({});
           }
        } else {
          currentCredRev = doc._rev;
          resolve(doc.credentials);
        }
      });
    });
  },

  saveCredentials: function(credentials) {
    var key = appname + "/" + "credential";
    return when.promise(function(resolve, reject) {
      var doc = {
        _id: key,
        credentials: credentials
      };
      if (currentCredRev) {
        doc._rev = currentCredRev;
      }
      humixdb.insert(doc, function(err, db) {
        if (err) {
          reject(err.toString());
        } else {
          currentCredRev = db.rev;
          resolve();
        }
      });
    });
  },

  getSettings: function() {
    var key = appname + "/" + "settings";
    return when.promise(function(resolve, reject) {
      humixdb.get(key, function(err, doc) {
        if (err) {
          if (err.status_code != 404) {
            reject(err.toString());
          } else {
            resolve({});
          }
        } else {
          currentSettingsRev = doc._rev;
          resolve(doc.settings);
        }
      });
    });
  },

  saveSettings: function(settings) {
    var key = appname + "/" + "settings";
    return when.promise(function(resolve, reject) {
      var doc = {
        _id: key,
        settings: settings
      };
      if (currentSettingsRev) {
        doc._rev = currentSettingsRev;
      }
      humixdb.insert(doc, function(err, db) {
        if (err) {
           reject(err.toString());
        } else {
          currentSettingsRev = db.rev;
          resolve();
        }
      });
    });
  },

  getAllFlows: function() {
    var key = [appname, "flow"];
    return when.promise(function(resolve, reject) {
      humixdb.view('library', 'flow_entries_by_app_and_type', {
        key: key
      }, function(e, data) {
        if (e) {
           reject(e.toString());
        } else {
          var result = {};
          for (var i = 0; i < data.rows.length; i++) {
            var doc = data.rows[i];
            var path = doc.value.path;
            var parts = path.split("/");
            var ref = result;
            for (var j = 0; j < parts.length - 1; j++) {
              ref['d'] = ref['d'] || {};
              ref['d'][parts[j]] = ref['d'][parts[j]] || {};
              ref = ref['d'][parts[j]];
            }
            ref['f'] = ref['f'] || [];
            ref['f'].push(parts.slice(-1)[0]);
          }
          resolve(result);
        }
      });
    });
  },

  getFlow: function(fn) {
    if (fn.substr(0) != "/") {
      fn = "/" + fn;
    }
    var key = appname + "/lib/flow" + fn;
    return when.promise(function(resolve, reject) {
      humixdb.get(key, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.data);
        }
      });
    });
  },

  saveFlow: function(fn, data) {
    if (fn.substr(0) != "/") {
      fn = "/" + fn;
    }
    var key = appname + "/lib/flow" + fn;
    return when.promise(function(resolve, reject) {
      var doc = {
        _id: key,
        data: data
      };
      humixdb.get(key, function(err, d) {
        if (d) {
          doc._rev = d._rev;
        }
        humixdb.insert(doc, function(err, d) {
          if (err) {
            reject(err);
          } else {
                  resolve();
          }
        });
      });
    });
  },

  getLibraryEntry: function(type, path) {
    var key = appname + "/lib/" + type + (path.substr(0) != "/" ? "/" : "") + path;
    if (libraryCache[key]) {
      return when.resolve(libraryCache[key]);
    }

    return when.promise(function(resolve, reject) {
      humixdb.get(key, function(err, doc) {
        if (err) {
          if (path.substr(-1) == "/") {
            path = path.substr(0, path.length - 1);
          }
          var qkey = [appname, type, path];
          humixdb.view('library', 'lib_entries_by_app_and_type', {
            key: qkey
          }, function(e, data) {
            if (e) {
              reject(e);
            } else {
              var dirs = [];
              var files = [];
              for (var i = 0; i < data.rows.length; i++) {
                var row = data.rows[i];
                var value = row.value;

                if (value.dir) {
                  if (dirs.indexOf(value.dir) == -1) {
                    dirs.push(value.dir);
                  }
                } else {
                  files.push(value);
                }
              }
              libraryCache[key] = dirs.concat(files);
              resolve(libraryCache[key]);
            }
          });
        } else {
          libraryCache[key] = doc.body;
          resolve(doc.body);
        }
      });
    });
  },

  saveLibraryEntry: function(type, path, meta, body) {
    if (path.substr(0) != "/") {
      path = "/" + path;
    }
    var key = appname + "/lib/" + type + path;
    return when.promise(function(resolve, reject) {
      var doc = {
        _id: key,
        meta: meta,
        body: body
      };
      humixdb.get(key, function(err, d) {
        if (d) {
          doc._rev = d._rev;
        }
        humixdb.insert(doc, function(err, d) {
          if (err) {
            reject(err);
          } else {
            var p = path.split("/");
            for (var i = 0; i < p.length; i++) {
              delete libraryCache[appname + "/lib/" + type + (p.slice(0, i).join("/"))]
            }
            libraryCache[key] = body;
            resolve();
          }
        });
      });

    });
  },

  // Humix Device API related functions

  register: function(req, res) {
    var senseId = req.body.senseId;

    if (!senseId) {
      return res.status(400).send({
        error: 'Missing property: senseId'
      });
    }
    var data = [];
    Object.keys(req.body).forEach(function(key) {
      if (key !== 'senseId') {
        data.push(key);
        data.push(req.body[key]);
      }
    });
    console.log('Registering device: ' + senseId);


    humixdb.view('module', 'get_senseIds', function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));

      var devices = [];

      var exist = false;

      if (docs) {
        for (var i = 0; i < docs.rows.length; i++) {

          var id = docs.rows[i].value;
          console.log('checking id :' + JSON.stringify(id));
          if (id.senseId == senseId) {
            exist = true;
            console.log('SenseId [' + senseId + '] already exist. Skip');
            break;
          }

        }
      }

      if (!exist) {
        humixdb.insert(req.body, function(err) {
          if (err) {
            console.log('failed to register humix:' + senseId + " error:" + err);
          } else {
            console.log('humix:' + senseId + ' registered');
          }
        });

      }

    });




  },

  unregister: function(req, res) {
    var senseId = req.params.senseId;
    console.log('Unregistering device: ' + senseId);

    // TODO Delete devices
    humixdb.view('module', 'get_senseIds', function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));

      var devices = [];
      var exist = false;

      for (var i = 0; i < docs.rows.length; i++) {

        var id = docs.rows[i].value;
        console.log('docs.rows[i]' + JSON.stringify(docs.rows[i]));
        console.log('checking id :' + JSON.stringify(id));
        if (id.senseId == senseId) {
          var docUniqueId = docs.rows[i].id;
          console.log('SenseId [' + senseId + '] exist. try to delete...' + docUniqueId);

          humixdb.get(docUniqueId, function(err, body) {
            if (!err) {
              var latestRev = body._rev;
              console.log('latestRev=' + latestRev);
              humixdb.destroy(docUniqueId, latestRev, function(err, body, header) {
                if (!err) {
                  console.log("Successfully deleted doc", docUniqueId);
                  res.send('success');
                }
              });
            }
          })
        }
      }
    });
  },

  unregisterall: function(req, res) {
    console.log('Unregistering all devices');
  },

  getAllDevices: function(req, res) {

    console.log('get all devices invoked');

    humixdb.view('module', 'get_senseIds', function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));

      var devices = [];

      if (docs) {
        docs.rows.forEach(function(doc) {
          devices.push(doc.value);

        });
      }
      res.send({
        result: JSON.stringify(devices)
      });
    });

  },

  getDevice: function(req, res) {

    console.log('get device invoked');

    var senseId = req.params.senseId;

    humixdb.view('module', 'get_senseIds', {
      key: senseId
    }, function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));

      var devices = [];
      docs.rows.forEach(function(doc) {
        devices.push(doc.value);

      });
      res.send({
        result: JSON.stringify(devices)
      });
    });

  },

  getDeviceModules: function(req, res) {
    console.log('get device modules invoked');

    var senseId = req.params.senseId;

    humixdb.view('module', 'get_module_by_senseID', {
      key: senseId
    }, function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));
      var modules = [];
      if (docs) {
        docs.rows.forEach(function(doc) {
          modules.push(doc.value);

        });
      }
      res.send({
        result: JSON.stringify(modules)
      });
    });

  },

  unregisterModule: function(req, res) {
    var senseId = req.params.senseId;
    var moduleId = req.params.moduleId;
    console.log('Unregistering module: [' + moduleId + '] for device: [' + senseId + ']');

    humixdb.view('module', 'get_module_by_senseID_and_moduleID', function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));

      var exist = false;

      if (docs) {
        for (var i = 0; i < docs.rows.length; i++) {

          var id = docs.rows[i].value;

          if (id.senseID == senseId && id.moduleID == moduleId) {
            var docUniqueId = docs.rows[i].id;
            console.log('SenseId:ModuleId [' + senseId + ':' + moduleId + '] exist. try to delete...' + docUniqueId);

            humixdb.get(docUniqueId, function(err, body) {
              if (!err) {
                var latestRev = body._rev;
                console.log('latestRev=' + latestRev);
                humixdb.destroy(docUniqueId, latestRev, function(err, body, header) {
                  if (!err) {
                    console.log("Successfully deleted doc", docUniqueId);
                    res.send('success');
                  }
                });
              }
            })

          }

        }
      } // if docs
    });

  },

  getDeviceModuleEvents: function(req, res) {
    console.log('get device module events invoked');

    var senseId = req.params.senseId,
    moduleName = req.params.moduleName;

    var keys = [senseId, moduleName];

    humixdb.view('module', 'get_module_by_senseID_and_moduleID', {
      key: keys
    }, function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));

      var events = [];

      if (docs) {
        docs.rows.forEach(function(doc) {

          if (doc.value)
            events = doc.value.events;

        });
      }
      res.send({
        result: JSON.stringify(events)
      });
    });

  },

  getDeviceModuleCommands: function(req, res) {

    console.log('get device module commands invoked');

    var senseId = req.params.senseId,
    moduleName = req.params.moduleName;
    var keys = [senseId, moduleName];

    humixdb.view('module', 'get_module_by_senseID_and_moduleID', {
      key: keys
    }, function(err, docs) {

      var commands = [];

      if (docs) {
        docs.rows.forEach(function(doc) {

          if (doc.value) {
            commands = doc.value.commands;
          }

        });
      }
      res.send({
        result: JSON.stringify(commands)
      });
    });
  },
  registerModule: function (senseId, moduleName, moduleData){

    var keys = [senseId, moduleName];

    humixdb.view('module', 'get_module_by_senseID_and_moduleID', {
      key: keys
    }, function(err, docs) {

      if (err) {
        console.log('Failed to check module [' + moduleName + '], error:' + err);
      } else {
        console.log('doc:' + JSON.stringify(docs));
        if (docs.rows.length == 0) {

          humixdb.insert(moduleData, function(err) {

            if (err) {
              console.log('Failed to register module [' + moduleName + '], error:' + err);
            } else {
              console.log('Module [' + moduleName + '] registered successfully');
            }
          });

        } else {
          //console.log('Module ['+module.moduleName+'] already registered. Skip !');

          var id = docs.rows[0].id;
          var rev = docs.rows[0].value._rev;
          if (id && rev) {

            moduleData._rev = rev;
            moduleData._id = id;

            console.log('updating existing module:' + moduleData);
            humixdb.insert(moduleData, function(err) {

              if (err) {
                console.log('Failed to register module [' + moduleName + '], error:' + err);
              } else {
                console.log('Module [' + moduleName + '] registered successfully');
              }
            });
          }
        }
      }

    });

  }
};

module.exports = couchstorage;
