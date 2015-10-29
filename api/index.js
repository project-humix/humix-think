var apiRoutes = require('express').Router(),
    devices = require('./devices');


function init(adminApp) {
    // Devices
    apiRoutes.post  ('/registerDevice',     devices.register);
    apiRoutes.delete('/devices/',           devices.unregisterall);
    apiRoutes.delete('/devices/:senseId',   devices.unregister);
    apiRoutes.get   ('/devices',            devices.getAllDevices);
    apiRoutes.get   ('/devices/:senseId',   devices.getDevice);
    apiRoutes.get   ('/devices/:senseId/modules',   devices.getDeviceModules);
    apiRoutes.get   ('/devices/:senseId/modules/:moduleName/events',   devices.getDeviceModuleEvents);
    apiRoutes.get   ('/devices/:senseId/modules/:moduleName/commands',   devices.getDeviceModuleCommands);

    adminApp.use('/api', apiRoutes);
}

module.exports = {
    init: init
};
