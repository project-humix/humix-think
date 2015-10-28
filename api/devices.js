var log = require('logule').init(module, 'Device'),
    redis = require('redis');
    client = redis.createClient();

client.on('error', function(err) {
    log.error(err);
});

module.exports = {
    register: function(req, res) {
        var senseId = req.body.senseId,
            senseIcon = req.body.senseIcon;

        if (!senseId || !senseIcon) {
            return res.status(400).send({error: 'Missing property: senseId: '+senseId+', senseIcon: '+senseIcon});
        }
        log.info('Registering device: '+JSON.stringify({senseId: senseId, senseIcon: senseIcon}));
        client.set(senseId, JSON.stringify({senseIcon: senseIcon}));
        res.send({result: 'OK'});
    },

    unregister: function(req, res) {
        var senseId = req.params.senseId;
        log.info('Unregistering device: '+senseId);
        client.del(senseId);
        res.send({result: 'OK'});
    },

    getDeviceList: function(req, res) {
        client.keys('*', function(err, reply) {
            if (err) {
                log.error(err);
                return res.status(500).send({error: err});
            }
            res.send({result: JSON.stringify(reply)});
        });
    },

    getDevice: function(req, res) {
        var senseId = req.params.senseId;
        client.get(senseId, function(err, reply) {
            if (err) {
                log.error(err);
                return res.status(500).send({error: err});
            }
            res.send({result: JSON.stringify(reply)});
        });
    }
};
