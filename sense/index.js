var comms = require('./senseWS');
var WS = require('ws');
var settings = require('../bluemix-settings.js'),
    nano = require('nano')(settings.couchUrl);

var humixdb;
var moduleStatus = {};
var syncCommandCache = {};

var senseEventHandler = function(data) {
    try {
        var senseId = data.senseId,
            event = data.data;


        if (event.eventType === 'humix-think') {
            if (event.eventName === 'sense.status') {


            } else if (event.eventName === 'module.status') {

                var statusList = event.message;


                statusList.map(function(module) {
                    var key = senseId + "_" + module.moduleId;
                    moduleStatus[key] = module.status;

                });

            }
            if (event.eventName === 'registerModule') {
                console.log('receive module registration:' + JSON.stringify(data));
                var module = event.message;
                if (module) {

                    var moduleData = {

                        senseID: senseId,
                        moduleID: module.moduleName,
                        commands: module.commands,
                        events: module.events
                    }



                    var keys = [senseId, module.moduleName];

                    humixdb.view('module', 'get_module_by_senseID_and_moduleID', {
                        key: keys
                    }, function(err, docs) {

                        if (err) {
                            console.log('Failed to check module [' + module.moduleName + '], error:' + err);
                        } else {
                            console.log('doc:' + JSON.stringify(docs));
                            if (docs.rows.length == 0) {

                                humixdb.insert(moduleData, function(err) {

                                    if (err) {
                                        console.log('Failed to register module [' + module.moduleName + '], error:' + err);
                                    } else {
                                        console.log('Module [' + module.moduleName + '] registered successfully');
                                    }
                                });

                            } else {
                                //console.log('Module ['+module.moduleName+'] already registered. Skip !');

                                var id = docs.rows[0].id;
                                var rev = docs.rows[0].value._rev;
                                if (id && rev) {

                                    moduleData._rev = rev;
                                    moduleData._id = id;

                                    console.log('updating existing module:' + JSON.stringify(moduleData));
                                    humixdb.insert(moduleData, function(err) {

                                        if (err) {
                                            console.log('Failed to register module [' + module.moduleName + '], error:' + err);
                                        } else {
                                            console.log('Module [' + module.moduleName + '] registered successfully');
                                        }
                                    });
                                }
                            }
                        }

                    });





                    /*
                    client.hmset('module:'+module.moduleName+':'+senseId, moduleData, function(err) {
                        if (err) { console.log(err); }
                    });
                    */
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
};

var getSenseStatus = function(senseId) {

    // get senseId status

    var status = 'disconnected';
    var activeConnections = comms.activeConnections;

    activeConnections.map(function(ws) {


        if (ws.senseId === senseId && ws.readyState == WS.OPEN) {

            status = 'connected';
        }
    });


    return {
        senseId: senseId,
        status: status
    };
}

var getModuleStatus = function(senseId, moduleId) {

    var key = senseId + "_" + moduleId;
    var status = moduleStatus[key];

    if (!status) {

        status = 'disconnected';
    }

    var result = {
        senseId: senseId,
        moduleId: moduleId,
        status: status
    };

    return result;
}


var getAllModuleStatus = function(senseId) {

    var resultArr = [];

    for (var key in moduleStatus) {

        var moduleName = key.substring(key.indexOf("_") + 1);
        var status = moduleStatus[key];

        resultArr.push({
            moduleId: moduleName,
            status: status
        });
    }

    var result = {
        senseId: senseId,
        modules: resultArr

    };

    return result;

}

module.exports = {
    start: function(httpServer, RED) {



        RED.comms["subscribe_sense"] = comms.subscribe;
        RED.comms["unsubscribe_sense"] = comms.unsubscribe;
        RED.comms["publish_sense"] = comms.publish;
        RED.comms["getAll"] = comms.getAll;
        RED.comms["syncCommandCache"] = comms.syncCommandCache;

        comms.start(httpServer, RED.settings);

        console.log('create db and view on cloudant');

        var designDoc = {
            "_id": "_design/module",
            "views": {
                "get_senseIds": {
                    "map": "function(doc){ \n  if(doc.senseId && doc.senseIcon){\n   emit(doc.senseId, {senseId:doc.senseId,senseIcon:doc.senseIcon});\n  } \n}"
                },
                "get_module_by_senseID": {
                    "map": "function(doc){ \n  if(doc.senseID){\n   emit(doc.senseID, doc.moduleID);\n  } \n}"
                },
                "get_module_by_senseID_and_moduleID": {
                    "map": "function(doc){ \n  if(doc.senseID && doc.moduleID ){\n   emit([doc.senseID,doc.moduleID], doc);\n  } \n}"
                }
            }
        };
        nano.db.create('humix', function(err, body) {
            if (!err) {
                console.log('database humix created!');
            } else {

                console.log('database humix already exist!');
            }
        });

        humixdb = nano.db.use('humix');

        humixdb.get('_design/module', function(err, body) {
            if (!err) {
                console.log('design doc already created');
            } else {
                humixdb.insert(designDoc, '_design/module', function(err) {
                    if (err) {
                        console.log('failed to create design doc');
                    } else {
                        console.log('design doc created');
                    }
                });
            }
        });


        comms.subscribe('*', senseEventHandler);
    },
    stop: function() {
        comms.unsubscribe('*', senseEventHandler);
        comms.stop();
    },

    //    syncCommandCache: syncCommandCache,
    getSenseStatus: getSenseStatus,
    getModuleStatus: getModuleStatus,
    getAllModuleStatus: getAllModuleStatus,
    ws: comms
};