var apiRoutes = require('express').Router(),
    devices = require('./devices'),
    status = require('./status');


function init(adminApp) {


    // Devices
    apiRoutes.post('/registerDevice', devices.register);
    apiRoutes.delete('/devices/', devices.unregisterall);
    apiRoutes.delete('/devices/:senseId', devices.unregister);
    apiRoutes.get('/devices', devices.getAllDevices);
    apiRoutes.get('/devices/:senseId', devices.getDevice);
    apiRoutes.get('/devices/:senseId/modules', devices.getDeviceModules);
    apiRoutes.delete('/devices/:senseId/modules/:moduleId', devices.unregisterModule);
    apiRoutes.get('/devices/:senseId/modules/:moduleName/events', devices.getDeviceModuleEvents);
    apiRoutes.get('/devices/:senseId/modules/:moduleName/commands', devices.getDeviceModuleCommands);

    // Status
    apiRoutes.get('/status/:senseId', status.getSenseStatus);
    apiRoutes.get('/status/:senseId/modules', status.getAllModuleStatus);
    apiRoutes.get('/status/:senseId/modules/:moduleId', status.getModuleStatus);

    adminApp.use('/api', apiRoutes);
}

module.exports = {
    init: init
};