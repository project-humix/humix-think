var apiRoutes = require('express').Router(),
    devices = require('./devices');


function init(adminApp) {
    // Devices
    apiRoutes.post('/registerDevice', devices.register);
    apiRoutes.delete('/device/:senseId', devices.unregister);

    adminApp.use('/api', apiRoutes);
}

module.exports = {
    init: init
};
