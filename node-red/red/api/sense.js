var comms = require('./comms_sense');
// var comms_sense = require('./comms');

/* TODO : replace with cloudant
    redis = require('redis'),
    client = redis.createClient();
*/
var settings = require('../../../bluemix-settings.js'),
    nano = require('nano')(settings.couchUrl);

var humixdb;

var senseEventHandler = function(data) {
    try {
        console.log('receive module registration event:'+JSON.stringify(data));
        console.log('registration event message:'+JSON.stringify(data.data));
        var senseId = data.senseId,
            event = data.data;
        console.log('event.eventType:'+ event.eventType);

        if (event.eventType === 'humix-think') {
            console.log('receive module registration:'+JSON.stringify(data));
            if (event.eventName === 'registerModule') {
                var module = event.message;
                if (module) {

                    var moduleData = {

                        senseID: senseId,
                        moduleID : module.moduleName,
                        commands: module.commands,
                        events: module.events
                    }


                    humixdb.view('module', 'get_module_by_senseID',{key:senseId}, function(err, docs){

                        if(err){
                            console.log('Failed to check module ['+module.moduleName+'], error:'+err);
                        }
                        else{
                            console.log('doc:'+JSON.stringify(docs));
                            if(docs.rows.length == 0 ){

                                humixdb.insert(moduleData, function(err){

                                    if(err){
                                        console.log('Failed to register module ['+module.moduleName+'], error:'+err);
                                    }
                                    else{
                                        console.log('Module []'+module.moduleName+'] registered successfully');
                                    }
                                });

                            }else{
                                console.log('Module ['+module.moduleName+'] already registered. Skip !');
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

module.exports = {
    start: function() {

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
                "get_module_by_senseID_and_moduleID":{
                    "map": "function(doc){ \n  if(doc.senseID && doc.moduleID ){\n   emit([doc.senseID,doc.moduleID], doc);\n  } \n}"
                }
            }
        };
        nano.db.create('humix', function(err, body) {
            if (!err) {
                console.log('database humix created!');
            }else{

                console.log('database humix already exist!');
            }
        });

        humixdb = nano.db.use('humix');

        humixdb.get('_design/module', function(err, body) {
            if (!err) {
                console.log('design doc already created');
            }else{
                humixdb.insert(designDoc,'_design/module',function(err){
                    if(err){
                        console.log('failed to create design doc');
                    }else{
                        console.log('design doc created');
                    }
                });
            }
        });

        console.log('subscription start');
        comms.subscribe('*', senseEventHandler);
    },
    stop: function() {
        comms.unsubscribe('*', senseEventHandler);
    }
};
