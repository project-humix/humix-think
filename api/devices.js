var log = require('logule').init(module, 'Device'),
    redis = require('redis'),
    async = require('async'),
    client = redis.createClient();

client.on('error', function(err) {
    log.error(err);
});

var senseIdPrefix = 'SenseId:';
function SenseId(senseId) {
    return senseIdPrefix+senseId;
}

module.exports = {
    register: function(req, res) {
        var senseId = req.body.senseId;

        if (!senseId) {
            return res.status(400).send({error: 'Missing property: senseId'});
        }
        var data = [];
        Object.keys(req.body).forEach(function(key) {
            if (key !== 'senseId') {
                data.push(key);
                data.push(req.body[key]);
            }
        });
        log.info('Registering device: '+senseId);
        client.hmset(SenseId(senseId), data, function(err) {
            if (err) {
                log.error(err);
                return res.status(500).send({error: err});
            }
            res.send({result: 'OK'});
        });
    },

    unregister: function(req, res) {
        var senseId = req.params.senseId;
        log.info('Unregistering device: '+senseId);
        client.hdel(SenseId(senseId), function(err) {
            if (err) {
                log.error(err);
                return res.status(500).send({error: err});
            }
            res.send({result: 'OK'});
        });
    },

    unregisterall: function(req, res) {
        log.info('Unregistering all devices');
        client.keys(senseIdPrefix+'*', function(err, reply) {
            if (err) {
                log.error(err);
                return res.status(500).send({error: err});
            }
            async.each(reply, function(key, callback) {
                client.del(key, function(err) {
                    if (err) {
                        log.error(err);
                        return callback(err);
                    }
                    callback();
                });
            }, function(err) {
                if (err) {
                    return res.status(500).send({error: err});
                }
                res.send({result: 'OK'});
            });
        });
    },

    getAllDevices: function(req, res) {
        client.keys(senseIdPrefix+'*', function(err, reply) {
            if (err) {
                log.error(err);
                return res.status(500).send({error: err});
            }
            async.concat(reply, function(key, callback) {
                client.hgetall(key, function(err, reply) {
                    if (err) {
                        log.error(err);
                        return callback(err);
                    }
                    if (!reply) {
                        return callback(null, []);
                    }
                    var item = { senseId: key.split(':')[1] };
                    Object.keys(reply).forEach(function(itemKey) {
                        item[itemKey] = reply[itemKey];
                    });
                    callback(null, [item]);
                });
            }, function(err, result) {
                if (err) {
                    return res.status(500).send({error: err});
                }
                res.send({result: JSON.stringify(result)});
            });
        });
    },

    getDevice: function(req, res) {
        var senseId = req.params.senseId;
        client.hgetall(senseId, function(err, reply) {
            if (err) {
                log.error(err);
                return res.status(500).send({error: err});
            }
            res.send({result: reply ? JSON.stringify(reply) : null});
        });
    },

    getDeviceModules: function(req, res) {
        var senseId = req.params.senseId;
        client.keys('module:*:'+senseId, function(err, reply) {
            if (err) {
                log.error(err);
                return res.status(500).send({error: err});
            }
            var list = [];
            reply.forEach(function(key) {
                list.push(key.split(':')[1]);
            });
            res.send({result: JSON.stringify(list)});
        });
    },

    getDeviceModuleEvents: function(req, res) {
        var senseId = req.params.senseId,
            moduleName = req.params.moduleName;
        client.hgetall('module:'+moduleName+':'+senseId, function(err, reply) {
            if (err) {
                log.error(err);
                return res.status(500).send({error: err});
            }
            if (!reply) {
                return res.send({result: []});
            }
            res.send({result: JSON.stringify(reply.events.split(','))});
        });
    },

    getDeviceModuleCommands: function(req, res) {
        var senseId = req.params.senseId,
            moduleName = req.params.moduleName;
        client.hgetall('module:'+moduleName+':'+senseId, function(err, reply) {
            if (err) {
                log.error(err);
                return res.status(500).send({error: err});
            }
            if (!reply) {
                return res.send({result: []});
            }
            res.send({result: JSON.stringify(reply.commands.split(','))});
        });
    }
};
