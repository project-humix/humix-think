var log = require('logule').init(module, 'Status');

var sense = require('../sense'),
    senseWS = sense.ws;

module.exports = {

    getSenseStatus: function(req, res) {


        var senseId = req.params.senseId;
        var status = sense.getSenseStatus(senseId);
        log.debug('sense status: ' + JSON.stringify(status));

        res.send(status);
    },

    getAllModuleStatus: function(req, res) {


        var senseId = req.params.senseId;
        var status = sense.getAllModuleStatus(senseId);
        log.debug('all module status: ' + JSON.stringify(status));

        res.send(status);
    },

    getModuleStatus: function(req, res) {


        var senseId = req.params.senseId;
        var moduleId = req.params.moduleId;
        var status = sense.getModuleStatus(senseId, moduleId);
        log.debug('module status: ' + JSON.stringify(status));

        res.send(status);
    },


}