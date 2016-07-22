var log = require('logule').init(module, 'Status');

var senseWS = require('../node-red/red/api/comms_sense.js');

var sense;

module.exports = {
    init: function (AdminApp) {
        if (AdminApp) { 
            sense = AdminApp.RED.sense;
        }   
    },

    getSenseStatus: function(req, res) {


        var senseId = req.params.senseId;
        var status = sense.getSenseStatus(senseId);
        log.debug('sense status: ' + JSON.stringify(status));

        res.send(status);        
    },

    getAllModuleStatus: function (req, res) { 


        var senseId = req.params.senseId;    
        var status = sense.getAllModuleStatus(senseId);
        log.debug('all module status: ' + JSON.stringify(status));

        res.send(status);
    },

     getModuleStatus: function (req, res) { 


        var senseId =  req.params.senseId;
        var moduleId = req.params.moduleId;
        var status = sense.getModuleStatus(senseId, moduleId);
        log.debug('module status: ' + JSON.stringify(status));

        res.send(status);               
    },


}
