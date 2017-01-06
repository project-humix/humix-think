/**
* © Copyright IBM Corp. 2016
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**/


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