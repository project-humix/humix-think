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


(function() {
  'use strict';

  angular
      .module('public')
      .service('deviceList', deviceList);


  /** @ngInject */
  function deviceList($http, $log) {
    var devices = {};
    $http({
      method: 'GET',
      url: 'api/devices'
    }).then(function successCallback(response) {
        var data = angular.fromJson(response.data.result);
        data.forEach(function(obj){
          devices[obj.senseId] = obj.senseIcon;
        });
      }, function errorCallback(response) {
        $log.info(response);
    });

    this.getDevices = getDevices;
    this.setDevice = setDevice;
    this.delDevice = delDevice;

    function getDevices() {
      return devices;
    }

    function setDevice(senseId, iconId) {
      // call the backend api here to store the data
      $http({
        method: 'POST',
        url: 'api/registerDevice',
        data: {'senseId':senseId, 'senseIcon': iconId}
      }).then(function successCallback(response) {
          $log.info(response);
        }, function errorCallback(response) {
          $log.info(response);
      });
      devices[senseId] = iconId;
    }

    function delDevice(senseId) {
      // call the backend api here to delete the data
      $http({
        method: 'DELETE',
        url: 'api/devices/'+ senseId
      });

      delete devices[senseId];
    }
  }

})();