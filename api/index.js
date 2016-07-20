var apiRoutes = require('express').Router(),
    devices = require('./devices');
   // weather = require('./weather');


function init(adminApp) {
    // Devices
    apiRoutes.post  ('/registerDevice',     devices.register);
    apiRoutes.delete('/devices/',           devices.unregisterall);
    apiRoutes.delete('/devices/:senseId',   devices.unregister);
    apiRoutes.get   ('/devices',            devices.getAllDevices);
    apiRoutes.get   ('/devices/:senseId',   devices.getDevice);
    apiRoutes.get   ('/devices/:senseId/status',   devices.getDeviceStatus);
    apiRoutes.get   ('/devices/:senseId/modules',   devices.getDeviceModules);
    apiRoutes.get   ('/devices/:senseId/modules/:moduleName/events',   devices.getDeviceModuleEvents);
    apiRoutes.get   ('/devices/:senseId/modules/:moduleName/commands',   devices.getDeviceModuleCommands);

    // Weather
    /*
    apiRoutes.get   ('/weather/dashboard/:city',   weather.dashboard);
    apiRoutes.get   ('/weather/sensor',            weather.sensor);
    apiRoutes.get   ('/weather/forecast/:city',   weather.forecast);
    apiRoutes.get   ('/weather/wps/:city', weather.wps);
    */

    adminApp.use('/api', apiRoutes);
}

module.exports = {
    init: init
};
