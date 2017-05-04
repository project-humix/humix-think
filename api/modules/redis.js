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


var log = require('logule').init(module, 'Device'),
    async = require('async'),
    settings = require('../../humix-settings.js');
var Redis = require('ioredis');
var Promise = require("bluebird");
var humixdb;

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

function errMessage(err) {
    console.log('err occur :' + err);
}

function getSenseIdPrefix(senseId) {
    return 'humix:senseId:' + senseId;
}

function getSenseIDModuleIDPrefix(senseId, moduleId) {
    return 'humix:senseID:' + senseId + ':moduleID:' + moduleId;
}
module.exports = {
    register: function (req, res) {
        var senseId = req.body.senseId;

        if (!senseId) {
            return res
                .status(400)
                .send({error: 'Missing property: senseId'});
        }
        log.info('Registering device: ' + senseId);

        humixdb.exists(getSenseIdPrefix(senseId), function (err, rs) {
            if (err) {
                console.log('err occur : ' + err);
            } else {
                if (rs === 1) {
                    console.log('SenseId [' + senseId + '] already exist. Skip');
                } else {
                    humixdb
                        .set(getSenseIdPrefix(senseId), JSON.stringify(req.body), function (err) {
                            if (err) {
                                log.error('failed to register humix:' + senseId + " error:" + err);
                            } else {
                                log.info('humix:' + senseId + ' registered');
                            }
                        });
                }
            }
        });
    },

    unregister: function (req, res) {
        var senseId = req.params.senseId;
        log.info('Unregistering device: ' + senseId);
        humixdb.exists(getSenseIdPrefix(senseId), function (err, rs) {
            if (err) {
                console.log('err occur' + err);
            } else {
                if (rs === 1) {
                    humixdb
                        .del('humix:senseId:' + senseId, function (err, rs) {
                            if (err) {
                                errMessage(err);
                            }

                        });
                }
            }

        })
        // TODO Delete devices
    },
    getAllDevices: function (req, res) {
        var devices = [];
        log.info('get all devices invoked');
        humixdb.keys(getSenseIdPrefix('*'), function (err, rs) {
            if (err) {
                errMessage(err);
            } else {
                Promise
                    .map(rs, function (key) {
                        return new Promise(function (resolve, reject) {
                            humixdb
                                .get(key, function (err, rs) {
                                    if (err) {
                                        errMessage(err);
                                    } else {
                                        var data = JSON.parse(rs);
                                        var device = {
                                            senseId: data.senseId,
                                            senseIcon: data.senseIcon
                                        }
                                        devices.push(device);
                                        resolve();
                                    }
                                })
                        })
                    })
                    .then(function () {
                        res.send({
                            result: JSON.stringify(devices)
                        });
                    })

            }
        });

    },

    getDevice: function (req, res) {

        log.info('get device invoked');
        var devices = [];
        var senseId = req.params.senseId;
        humixdb.get(getSenseIdPrefix(senseId), function (err, rs) {
            if (err) {
                errMessage(err);
            } else {
                var data = JSON.parse(rs);
                var device = {
                    senseId: data.senseId,
                    senseIcon: data.senseIcon
                }
                devices.push(device);

                res.send({
                    result: JSON.stringify(devices)
                });
            }
        });

    },

    getDeviceModules: function (req, res) {
        log.debug('get device modules invoked');
        var modules = [];
        var senseId = req.params.senseId;
        humixdb.keys(getSenseIDModuleIDPrefix(senseId, '*'), function (err, rs) {
            if (err) {
                errMessage(err);
            } else {
                if (rs.length === 0) {

                    // do nothing

                } else {
                    Promise
                        .map(rs, function (key) {
                            return new Promise(function (resolve, reject) {
                                humixdb
                                    .get(key, function (err, rs) {
                                        if (err) {
                                            errMessage(err);
                                        } else {
                                            var data = JSON.parse(rs);
                                            var mod = data.moduleID;
                                            modules.push(mod);
                                            resolve();
                                        }
                                    })
                            })
                        })
                        .then(function () {
                            res.send({
                                result: JSON.stringify(modules)
                            });
                        })
                }
            }
        });
    },

    unregisterModule: function (req, res) {
        var senseId = req.params.senseId;
        var moduleId = req.params.moduleId;
        log.info('Unregistering module: [' + moduleId + '] for device: [' + senseId + ']');
        humixdb.del(getSenseIDModuleIDPrefix(senseId, moduleId), function (err, res) {
            if (err) {
                errMessage(err);
            } else {
                if (res === 1) {
                    console.log("Successfully deleted doc" + moduleId);

                } else {
                    console.log('fail to unregister ' + moduleId);
                }
            }

        });
    },

    getDeviceModuleEvents: function (req, res) {
        log.info('get device module events invoked');

        var senseId = req.params.senseId,
            moduleName = req.params.moduleName;
        var events = [];
        humixdb.get(getSenseIDModuleIDPrefix(senseId, moduleName), function (err, rs) {

            if (err) {
                errMessage(err);
            } else {
                if (rs === null) {
                    console.log('can not find the module :' + moduleName + ' of the :' + senseId);
                } else {
                    var data = JSON.parse(rs);
                    events = data.events;
                    console.log('got events :' + events);
                }
                res.send({
                    result: JSON.stringify(events)
                });
            }
        });
    },

    getDeviceModuleCommands: function (req, res) {
        log.info('get device module command invoked');
        var senseId = req.params.senseId,
            moduleName = req.params.moduleName;
        var commands = [];
        humixdb.get(getSenseIDModuleIDPrefix(senseId, moduleName), function (err, rs) {
            if (err) {
                errMessage(err);
            } else {
                if (rs === null) {
                    console.log('can not find the module :' + moduleName + ' of the :' + senseId);
                } else {
                    var data = JSON.parse(rs);
                    commands = data.commands;
                }
                res.send({
                    result: JSON.stringify(commands)
                });
            }
        });

    }
};