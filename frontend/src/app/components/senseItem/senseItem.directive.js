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
    .directive('ngSenseItem', ngSenseItem);

  /** @ngInject */
  function ngSenseItem() {
    var directive = {
      restrict: 'A',
      replace: true,
      template: function (elem, attrs) {
        if (attrs.gridView == "true") {
            return '<div ng-include src="dynamicTemplateUrl"></div>';
        }
        else {
            return '<tbody ng-include src="dynamicTemplateUrl"></tbody>';
        }
      },
      scope: {
          senseId: '@',
          imgId: '@',
          deviceStatus: '='
      },
      link: function(scope, element, attrs) {
        scope.dynamicTemplateUrl = 'app/components/senseItem/senseItem-list.html';
        scope.sense = {};

        attrs.$observe('senseId', function(senseId) {
          scope.sense.senseId = senseId;
          scope.getModules();
          scope.getSenseStatus();

        });

        attrs.$observe('imgId', function(imgId) {
          scope.sense.imgId = imgId;
        });

        attrs.$observe('gridView', function(gridView) {
          scope.gridView = gridView;
          if (scope.gridView == "true") {
              scope.dynamicTemplateUrl = 'app/components/senseItem/senseItem-grid.html';
          }
          else {
              scope.dynamicTemplateUrl = 'app/components/senseItem/senseItem-list.html';
          }
        });
      },
      controller: senseItemController,
      controllerAs: 'senseItemController',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function senseItemController(deviceList, status, moduleList, $interval, $scope) {
      $scope.logButtonText = 'View';
      $scope.expandButtonText = '+';
      $scope.showModules = false;
      $scope.showLogViewer = false;

      $interval(getSenseStatus, 10000);

      function getSenseStatus() {
        status.SenseStatus.get({senseId: $scope.sense.senseId}, function(response) {
          $scope.sense.deviceStatus = response.status;
        });
      }

      $scope.getSenseStatus = getSenseStatus;

      $scope.getModules = function () {
        moduleList.Modules.get({senseId: $scope.sense.senseId}, function(response) {
          $scope.modules = angular.fromJson(response.result);
          $scope.moduleCount = $scope.modules.length;
        });
      };

      $scope.displayModules = function () {
          if ($scope.expandButtonText == '+') {
            $scope.expandButtonText = '-';
          } else if ($scope.expandButtonText == '-') {
            $scope.expandButtonText = '+';
          }
          $scope.showModules = !$scope.showModules;
      };

      $scope.displayLog = function () {
          if ($scope.logButtonText == 'View') {
            $scope.logButtonText = 'Hide';
          } else {
            $scope.logButtonText = 'View';
          }
          $scope.showLogViewer = !$scope.showLogViewer;
      };

      $scope.deleteSense = function(senseId) {
        if (confirm("Do you want to delete " + senseId + " ?")) {
          deviceList.delDevice(senseId);
        }
      }
    }
  }

})();
