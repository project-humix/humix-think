var log = require('logule').init(module, 'Device'),
  async = require('async'),
  settings = require('../bluemix-settings.js'),
  nano = require('nano')(settings.couchUrl);

var humixdb = nano.db.use('humix');

var senseIdPrefix = 'SenseId:';

function SenseId(senseId) {
  return senseIdPrefix + senseId;
}

module.exports = {
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
    log.info('Registering device: ' + senseId);


    humixdb.view('module', 'get_senseIds', function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));

      var devices = [];

      var exist = false;

      if(docs){
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
            log.error('failed to register humix:' + senseId+ " error:" + err);
          } else {
            log.info('humix:' + senseId + ' registered');
          }
        });

      }

    });




  },

  unregister: function(req, res) {
    var senseId = req.params.senseId;
    log.info('Unregistering device: ' + senseId);

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
    log.info('Unregistering all devices');

  },

  getAllDevices: function(req, res) {

    log.info('get all devices invoked');

    humixdb.view('module', 'get_senseIds', function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));

      var devices = [];

      if(docs){
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

    log.info('get device invoked');

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
    log.info('get device modules invoked');

    var senseId = req.params.senseId;

    humixdb.view('module', 'get_module_by_senseID', {
      key: senseId
    }, function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));
      var modules = [];
      if(docs){
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
    log.info('Unregistering module: [' + moduleId + '] for device: [' + senseId + ']');

    humixdb.view('module', 'get_module_by_senseID_and_moduleID', function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));

      var exist = false;

      if(docs){
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
    log.info('get device module events invoked');

    var senseId = req.params.senseId,
      moduleName = req.params.moduleName;

    var keys = [senseId, moduleName];

    humixdb.view('module', 'get_module_by_senseID_and_moduleID', {
      key: keys
    }, function(err, docs) {

      console.log('doc:' + JSON.stringify(docs));

      var events = [];

      if(docs){
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

    log.info('get device module commands invoked');

    var senseId = req.params.senseId,
      moduleName = req.params.moduleName;
    var keys = [senseId, moduleName];

    humixdb.view('module', 'get_module_by_senseID_and_moduleID', {
      key: keys
    }, function(err, docs) {

      var commands = [];

      if(docs){
        docs.rows.forEach(function(doc) {

          if (doc.value)
            commands = doc.value.commands;

        });
      }
      res.send({
        result: JSON.stringify(commands)
      });
    });



  }
};
