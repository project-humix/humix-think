/**
* © Copyright IBM Corp. 2016
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


var comms = require('./senseWS');
var WS = require('ws');

var humixdb = {};
var storage = {};
var moduleStatus = {};

function start(httpServer, RED, settings){

    console.log('registering sense..');
    storage = settings.storageModule;
    RED.comms["subscribe_sense"] = comms.subscribe;
    RED.comms["unsubscribe_sense"] = comms.unsubscribe;
    RED.comms["publish_sense"] = comms.publish;
    RED.comms["getAll"] = comms.getAll;
    RED.comms["syncCommandCache"] = comms.syncCommandCache;

    comms.start(httpServer, RED.settings);
    comms.subscribe('*', senseEventHandler);
}

function stop(){

    comms.unsubscribe('*', senseEventHandler);
    comms.stop();
}

function senseEventHandler (data) {
    try {
        var senseId = data.senseId,
            event = data.data;

        if (event.eventType === 'humix-think') {
            if (event.eventName === 'sense.status') {} else if (event.eventName === 'module.status') {



                var statusList = event.message;

                statusList.map(function (module) {
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

                    storage.registerModule(senseId, module.moduleName, moduleData);

                }
            }
        }
    } catch (e) {
        console.log(e);
    }
};

function getSenseStatus (req, res) {


    var senseId = req.params.senseId;
    var result = null;

    // get senseId status
    console.log('get sense status. sense id:' + senseId)
    var status = 'disconnected';
    var activeConnections = comms.activeConnections;

    activeConnections.map(function (ws) {

        if (ws.senseId === senseId && ws.readyState == WS.OPEN) {

            status = 'connected';
        }
    });

    result = {senseId: senseId, status: status};
    if(res)
        return res.send(result);
    else
        return result;
}

function getModuleStatus (req, res) {


    var senseId = req.params.senseId;
    var moduleId = req.params.moduleId;
    console.log('get module status. sense id:' + senseId + ', moduleid:'+moduleId);

    var key = senseId + "_" + moduleId;
    var status = moduleStatus[key];

    var senseStatus = getSenseStatus(req);

    if (senseStatus && senseStatus.status != 'connected'){

        status = 'unavailable';

    }else {

       if (!status) {
            status = 'disconnected';
       }

    }

    var result = {
        senseId: senseId,
        moduleId: moduleId,
        status: status
    };

    console.log('result:'+JSON.stringify(result));
    res.send(result);
    return;
}

function getAllModuleStatus (req, res) {


    var senseId = req.params.senseId;
    console.log('get all module status. sense id:' + senseId);

    var resultArr = [];

    for (var key in moduleStatus) {

        var moduleName = key.substring(key.indexOf('_') + 1);
        var status = moduleStatus[key];

        resultArr.push({moduleId: moduleName, status: status });
    }

    var result = {
        senseId: senseId,
        modules: resultArr

    };
    res.send(result);
    return;

}


module.exports = {
    start: start,
    stop: stop,
    getSenseStatus: getSenseStatus,
    getModuleStatus: getModuleStatus,
    getAllModuleStatus: getAllModuleStatus,

}