var Redis = require('ioredis');
var Promise = require("bluebird");
var when = require('when');
var humixdb = null;
var appname;
var libraryCache = {};
var fs = require('fs');


function errMessage(err) {
    console.log('err occur :' + err);
}

function getSenseIdPrefix(senseId) {
    return 'humix:senseId:' + senseId;
}

function getSenseIDModuleIDPrefix(senseId, moduleId) {
    return 'humix:senseID:' + senseId + ':moduleID:' + moduleId;
}

function prepopulateFlows(resolve) {
    var key = appname + "/flow";

    humixdb.get(key, function (err, res) {
        if (err || res === null) {
            var promises = [];
            if (fs.existsSync(__dirname + "/defaults/flow.json")) {
                try {
                    var flow = fs.readFileSync(__dirname + "/defaults/flow.json", "utf8");
                    var flows = JSON.parse(flow);
                    console.log(">> Adding default flow");
                    promises.push(redisstorage.saveFlows(flows));
                } catch (err) {
                    console.log(">> Failed to save default flow");
                    console.log(err);
                }
            } else {
                console.log(">> No default flow found");
            }
            if (fs.existsSync(__dirname + "/defaults/flow_cred.json")) {
                try {
                    var cred = fs.readFileSync(__dirname + "/defaults/flow_cred.json", "utf8");
                    var creds = JSON.parse(cred);
                    console.log(">> Adding default credentials");
                    promises.push(redisstorage.saveCredentials(creds));
                } catch (err) {
                    console.log(">> Failed to save default credentials");
                    console.log(err);
                }
            } else {
                console.log(">> No default credentials found");
            }
            when
                .settle(promises)
                .then(function () {
                    resolve();
                });
        } else {
            resolve();
        }
    });
}

var ioRedisConfig = {};

var redisstorage = {

    init: function (_settings) {
        return when.promise(function (resolve, reject) {

            var redisConfig = _settings.redisConfig;
            var redisMode = redisConfig.mode || "single";
            var redisPort = redisConfig.redisPort || '6379';
            var redisIP = redisConfig.redisIP || '127.0.0.1';
            var redisSentinelArray = redisConfig.sentinelArray;
            var redisSentinelName = redisConfig.sentinelName;
            var dbSelect = redisConfig.dbSelect || "0";
            var redisPassword = redisConfig.redisPassword;

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

            var settings = _settings;
            appname = settings.appName; //what this?
            // database 0 for the node-red flows
            humixdb = new Redis(ioRedisConfig);
            humixdb.on('connect', function () {
                console.log('Connected to Redis Server');
                prepopulateFlows(resolve);
                humixdb.exists(appname + '/settings', function (err, res) {
                    if (res === 1) {
                        resolve();
                    }
                });
            })

        });

    },
    getFlows: function () {
        var key = appname + "/flow";
        return when.promise(function (resolve, reject) {
            humixdb
                .get(key, function (err, res) {
                    if (err || res === null) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve([]);
                        }
                    } else {
                        resolve(JSON.parse(res));
                    }
                });
        });
    },
    saveFlows: function (flows) {
        var key = appname + "/flow";
        return when.promise(function (resolve, reject) {

            humixdb
                .set(key, JSON.stringify(flows), function (err, db) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
        });
    },
    getCredentials: function () {
        var key = appname + "/credential";
        return when.promise(function (resolve, reject) {
            humixdb
                .get(key, function (err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        if (res === null) {
                            resolve({});
                        } else {
                            try {
                                res = JSON.parse(res);
                            } catch (error) {}
                            resolve(res);
                        }
                    }
                });
        });
    },
    saveCredentials: function (credentials) {
        var key = appname + "/credential";
        return when.promise(function (resolve, reject) {
            try {
                credentials = JSON.stringify(credentials);
            } catch (error) {}
            humixdb
                .set(key, credentials, function (err, db) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
        });
    },
    getSettings: function () {
        var key = appname + "/settings";
        return when.promise(function (resolve, reject) {
            humixdb
                .get(key, function (err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        if (res === null) {
                            resolve({});
                        } else {
                            try {
                                res = JSON.parse(res);
                            } catch (error) {}

                            resolve(res);
                        }
                    }
                });
        });
    },
    saveSettings: function (settings) {
        var key = appname + "/settings";
        return when.promise(function (resolve, reject) {
            try {
                settings = JSON.stringigy(settings);
            } catch (error) {}
            humixdb
                .set(key, JSON.stringify(settings), function (err, db) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                        console.log('reso suces')
                    }
                });
        });
    },
    getAllFlows: function () {

        return new Promise(function (resolve, reject) {

            humixdb
                .keys(appname + '/*/flow*', function (err, res) {
                    if (err) {

                        reject();
                    } else {
                        var result = {};
                        res.forEach(function (value) {
                            var p = value.split("/");
                            var path = p
                                .slice(3)
                                .join("/");
                            var parts = path.split("/");

                            var ref = result;
                            for (var j = 0; j < parts.length - 1; j++) {
                                ref['d'] = ref['d'] || {};

                                ref['d'][parts[j]] = ref['d'][parts[j]] || {};

                                ref = ref['d'][parts[j]];

                            }
                            ref['f'] = ref['f'] || [];

                            ref['f'].push(parts.slice(-1)[0]);
                        })

                        resolve(result);
                    }
                });

        });
    },
    getFlow: function (fn) {
        if (fn.substr(0) != "/") {
            fn = "/" + fn;
        }

        var key = appname + "/lib/flow" + fn;

        return when.promise(function (resolve, reject) {
            humixdb
                .get(key, function (err, res) {
                    if (err) {
                        reject(err);
                    } else {

                        resolve(JSON.parse(res));
                    }
                });
        });
    },
    saveFlow: function (fn, data) {
        if (fn.substr(0) != "/") {
            fn = "/" + fn;
        }
        var key = appname + "/lib/flow" + fn;
        return when.promise(function (resolve, reject) {
            humixdb
                .set(key, JSON.stringify(data), function (err, res) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });

        });
    },
    getLibraryEntry: function (type, path) {
        var key = appname + "/lib/" + type + (path.substr(0) != "/"
            ? "/"
            : "") + path;
        if (libraryCache[key]) {
            return when.resolve(libraryCache[key]);
        }

        return when.promise(function (resolve, reject) {
            humixdb
                .get(key, function (err, res) {
                    if (err || res === null) {
                        if (path.substr(-1) == "/") {
                            path = path.substr(0, path.length - 1);
                        }
                        var tempArray = [];
                        humixdb.keys('*/lib/[^f]*', function (err, res) {

                            Promise
                                .map(res, function (value) {
                                    return new Promise(function (resolve, reject) {
                                        var p = value.split("/");
                                        var pathParts = p.slice(3, -1);
                                        for (var i = 0; i < pathParts.length; i++) {
                                            if (p[0] === appname && p[2] === type && pathParts.slice(0, i).join('/') === path) {
                                                var data = {
                                                    value: {
                                                        dir: pathParts.slice(i, i + 1)[0]
                                                    }
                                                }
                                                tempArray.push(data);
                                            }

                                        }
                                        var meta = {};
                                        humixdb.get(value, function (err, res) {
                                            if (err) {
                                                reject(err);
                                            }
                                            var keyMeta = JSON
                                                .parse(res)
                                                .meta;
                                            for (var key in keyMeta) {
                                                meta[key] = keyMeta[key];
                                            }
                                            meta.fn = p.slice(-1)[0];
                                            if (p[0] === appname && p[2] === type && pathParts.join("/") === path) {
                                                tempArray.push(meta);
                                            }
                                            resolve();
                                        });
                                    });

                                })
                                .then(function () {
                                    var dirs = [];
                                    var files = [];
                                    for (var i = 0; i < tempArray.length; i++) {

                                        var value = tempArray[i].value;

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
                                });
                        });
                    } else {
                        libraryCache[key] = JSON
                            .parse(res)
                            .body;
                        resolve(JSON.parse(res).body);
                    }
                });
        });
    },
    saveLibraryEntry: function (type, path, meta, body) {
        if (path.substr(0) != "/") {
            path = "/" + path;
        }
        var key = appname + "/lib/" + type + path;
        return when.promise(function (resolve, reject) {
            var doc = {

                meta: meta,
                body: body
            };
            humixdb.get(key, function (err, d) {
                humixdb
                    .set(key, JSON.stringify(doc), function (err, d) {
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

    /*  Humix Device Related API */

    register: function (req, res) {
        var senseId = req.body.senseId;

        if (!senseId) {
            return res
                .status(400)
                .send({error: 'Missing property: senseId'});
        }
        console.log('Registering device: ' + senseId);

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
                                console.log('failed to register humix:' + senseId + " error:" + err);
                            } else {
                                console.log('humix:' + senseId + ' registered');
                            }
                        });
                }
            }
        });
    },

    unregister: function (req, res) {
        var senseId = req.params.senseId;
        console.log('Unregistering device: ' + senseId);
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
        console.log('get all devices invoked');
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

        console.log('get device invoked');
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
        console.log('get device modules invoked');
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
        console.log('Unregistering module: [' + moduleId + '] for device: [' + senseId + ']');
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
        console.log('get device module events invoked');

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
        console.log('get device module command invoked');
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

    },

    registerModule: function (senseId, moduleName, moduleData){

        humixdb.set(getSenseIDModuleIDPrefix(senseId, moduleName), JSON.stringify(moduleData), function (err, res) {
            if (err) {
                errMessage(err);
            } else {
                console.log('module registration success');
            }
        });
    }

}

module.exports = redisstorage;