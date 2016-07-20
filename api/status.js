var log = require('logule').init(module, 'Status');

module.exports = {

    getSenseStatus: function(req, res) {

        log.info('getSenseStatus');

        var senseId = req.params.senseId;

        // get senseId status
        var result = {
            senseId: senseId,
            status: 'connected'
        };

        res.send(result);        
    },

    getAllModuleStatus: function (req, res) { 

        log.info('getAllModuleStatus');        

        var senseId = req.params.senseId;
        
        var result = {
            senseId: senseId,
            modules: [
                { moduleId: 'module1', status: 'connected' },
                { moduleId: 'module2', status: 'connected' },
                { moduleId: 'module3', status: 'disconnected' }
            ]

        };
        
        res.send(result);
    },

     getModuleStatus: function (req, res) { 

        log.info('getModuleStatus');        

        var senseId =  req.params.senseId;
        var moduleId = req.params.moduleId;

        var result = {
            senseId: senseId,
            moduleId: moduleId,
            status: 'connected'
        };
        
        res.send(result);         
         
    },


}