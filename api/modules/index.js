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


var humix_setting = require("../../humix-settings");
var dbModule = require('./' + humix_setting.storage);

var storageModuleInterface = {
    register: dbModule.register,
    unregister: dbModule.unregister,
    unregisterall: dbModule.unregisterall,
    getAllDevices: dbModule.getAllDevices,
    getDevice: dbModule.getDevice,
    getDeviceModules: dbModule.getDeviceModules,
    unregisterModule: dbModule.unregisterModule,
    getDeviceModuleEvents: dbModule.getDeviceModuleEvents,
    getDeviceModuleCommands: dbModule.getDeviceModuleCommands
}


module.exports = storageModuleInterface;