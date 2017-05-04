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
var settings = require('../humix-settings.js');
var Redis = require('ioredis');
var Promise = require("bluebird");
var humixdb;

var moduleStatus = {};
var syncCommandCache = {};

function errMessage(err) {
    console.log('err occur :' + err);
}

function getSenseIdPrefix(senseId) {
    return 'humix:senseId:' + senseId;
}

function getSenseIDModuleIDPrefix(senseId, moduleId) {
    return 'humix:senseID:' + senseId + ':moduleID:' + moduleId;
}
var senseEventHandler = function (data) {
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

                    humixdb.set(getSenseIDModuleIDPrefix(senseId, module.moduleName), JSON.stringify(moduleData), function (err, res) {
                        if (err) {
                            errMessage(err);
                        } else {
                            console.log('module registration success');
                        }
                    });
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
};

var getSenseStatus = function (senseId) {

    // get senseId status

    var status = 'disconnected';
    var activeConnections = comms.activeConnections;

    activeConnections.map(function (ws) {

        if (ws.senseId === senseId && ws.readyState == WS.OPEN) {

            status = 'connected';
        }
    });

    return {senseId: senseId, status: status};
}

var getModuleStatus = function (senseId, moduleId) {

    var key = senseId + "_" + moduleId;
    var status = moduleStatus[key];

    var senseStatus = this.getSenseStatus(senseId);

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

    return result;
}

var getAllModuleStatus = function (senseId) {

    var resultArr = [];

    for (var key in moduleStatus) {

        var moduleName = key.substring(key.indexOf("_") + 1);
        var status = moduleStatus[key];

        resultArr.push({moduleId: moduleName, status: status});
    }

    var result = {
        senseId: senseId,
        modules: resultArr

    };

    return result;

}

module.exports = {
    start: function (httpServer, RED) {

        console.log('registering sense..');
        RED.comms["subscribe_sense"] = comms.subscribe;
        RED.comms["unsubscribe_sense"] = comms.unsubscribe;
        RED.comms["publish_sense"] = comms.publish;
        RED.comms["getAll"] = comms.getAll;
        RED.comms["syncCommandCache"] = comms.syncCommandCache;

        comms.start(httpServer, RED.settings);
        var redisConfig = settings.redisConfig;
        var redisMode = redisConfig.mode || "single";
        var redisPort = redisConfig.redisPort || '6379';
        var redisIP = redisConfig.redisIP || '127.0.0.1';
        var redisSentinelArray = redisConfig.sentinelArray;
        var redisSentinelName = redisConfig.sentinelName;
        var dbSelect = redisConfig.dbSelect || "0";
        var redisPassword = redisConfig.redisPassword;
        var ioRedisConfig = {}
        if (redisMode == 'single') {
            ioRedisConfig = {
                port: redisPort, // Redis port
                host: redisIP, // Redis host
                db: dbSelect,
                password: redisPassword
            }
        } else if (redisMode == 'sentinel') {
            ioRedisConfig = {
                port: redisPort, // Redis port
                host: redisIP, // Redis host
                db: dbSelect,
                password: redisPassword,
                sentinels: redisSentinelArray,
                name: redisSentinelName
            }
        }
        humixdb = new Redis(ioRedisConfig);

        comms.subscribe('*', senseEventHandler);
    },
    stop: function () {
        comms.unsubscribe('*', senseEventHandler);
        comms.stop();
    },

    //    syncCommandCache: syncCommandCache,
    getSenseStatus: getSenseStatus,
    getModuleStatus: getModuleStatus,
    getAllModuleStatus: getAllModuleStatus,
    ws: comms
};