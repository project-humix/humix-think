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

        log.info('getSenseStatus');

        var senseId = req.params.senseId;
        var status = sense.getSenseStatus(senseId);
        log.info('sense status: ' + JSON.stringify(status));

        res.send(status);        
    },

    getAllModuleStatus: function (req, res) { 

        log.info('getAllModuleStatus');        

        var senseId = req.params.senseId;    
        var status = sense.getAllModuleStatus(senseId);
        log.info('all module status: ' + JSON.stringify(status));

        res.send(status);
    },

     getModuleStatus: function (req, res) { 

        log.info('getModuleStatus');        

        var senseId =  req.params.senseId;
        var moduleId = req.params.moduleId;
        var status = sense.getModuleStatus(senseId, moduleId);
        log.info('module status: ' + JSON.stringify(status));

        res.send(status);               
    },


}