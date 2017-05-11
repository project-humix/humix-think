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
    sense = require('../sense');


var logger = {};

function getSenseStatus (req, res) {


    var senseId = req.params.senseId;
    var status = sense.getSenseStatus(senseId);
    logger.debug('sense status: ' + JSON.stringify(status));

    res.send(status);
};

function getAllModuleStatus (req, res) {


    var senseId = req.params.senseId;
    var status = sense.getAllModuleStatus(senseId);
    logger.debug('all module status: ' + JSON.stringify(status));

    res.send(status);
}

function getModuleStatus (req, res) {


    var senseId = req.params.senseId;
    var moduleId = req.params.moduleId;
    var status = sense.getModuleStatus(senseId, moduleId);
    logger.debug('module status: ' + JSON.stringify(status));

    res.send(status);
}



function init(adminApp, settings, alogger) {

    //modules.init(settings);
    //var modules = settings.storageModule;
    //console.log('modules:'+JSON.stringify(modules));
    //status.init(modules);
    // Devices

    logger = alogger;
    var storage = settings.storageModule;

    apiRoutes.post('/registerDevice', storage.register);

    apiRoutes.delete('/devices/:senseId', storage.unregister);
    apiRoutes.get('/devices', storage.getAllDevices);
    apiRoutes.get('/devices/:senseId', storage.getDevice);
    apiRoutes.get('/devices/:senseId/modules', storage.getDeviceModules);
    apiRoutes.delete('/devices/:senseId/modules/:moduleId', storage.unregisterModule);
    apiRoutes.get('/devices/:senseId/modules/:moduleName/events', storage.getDeviceModuleEvents);
    apiRoutes.get('/devices/:senseId/modules/:moduleName/commands', storage.getDeviceModuleCommands);

    // Status
    apiRoutes.get('/status/:senseId', sense.getSenseStatus);
    apiRoutes.get('/status/:senseId/modules', sense.getAllModuleStatus);
    apiRoutes.get('/status/:senseId/modules/:moduleId', sense.getModuleStatus);

    adminApp.use('/api', apiRoutes);
}


module.exports = {
    init: init
};