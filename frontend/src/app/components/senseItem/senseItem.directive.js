(function() {
  'use strict';

  angular
    .module('public')
    .directive('ngSenseItem', ngSenseItem);

  /** @ngInject */
  function ngSenseItem() {
    var directive = {
      restrict: 'A',
      replace: false,
      templateUrl: 'app/components/senseItem/senseItem.html',
      scope: {
          senseId: '@',
          imgId: '@',
          deviceStatus: '='
      },
      link: function(scope, element, attrs) {
        scope.sense = {};

        attrs.$observe('senseId', function(senseId) {
          scope.sense.senseId = senseId;
          scope.getModules();

        });

        attrs.$observe('imgId', function(imgId) {
          scope.sense.imgId = imgId;
        });
      },
      controller: senseItemController,
      controllerAs: 'senseItemController',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function senseItemController(deviceList, deviceStatus, moduleList, $log, $interval, $scope) {
      $scope.delDevice = deviceList.delDevice;
      $scope.logButtonText = 'View';
      $scope.expandButtonText = '+';
      $scope.showModules = false;
      $scope.showLogViewer = false;


      $scope.getModules = function () {
        moduleList.get({senseId: $scope.sense.senseId}, function(response) {
          $scope.modules = angular.fromJson(response.result);
          $scope.moduleCount = $scope.modules.length;
        });
      };


      $interval( function(){
        deviceStatus.get({senseId: $scope.sense.senseId}, function(response) {
          $scope.sense.deviceStatus = angular.fromJson(response.result);
        });
      }, 1000);

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
    }
  }

})();
