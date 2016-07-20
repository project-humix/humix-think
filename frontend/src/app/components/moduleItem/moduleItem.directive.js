(function() {
  'use strict';

  angular
    .module('public')
    .directive('ngModuleItem', ngModuleItem);

  /** @ngInject */
  function ngModuleItem() {
    var directive = {
      restrict: 'A',
      replace: false,
      templateUrl: 'app/components/moduleItem/moduleItem.html',
      scope: {
          senseId: '@',
          moduleId: '@',
          moduleStatus: '='
      },
      link: function(scope, element, attrs) {
        scope.sense = {};

        attrs.$observe('senseId', function(senseId) {
          scope.sense.senseId = senseId;
          scope.getModuleStatus();
        });

        attrs.$observe('moduleId', function(moduleId) {
          scope.sense.moduleId = moduleId;
          scope.getModuleStatus();
        });
      },
      controller: moduleItemController,
      controllerAs: 'moduleItemController',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function moduleItemController(status, $scope, $interval) {
      $scope.showLogViewer = false;

      $interval($scope.getModuleStatus, 10000);

      $scope.getModuleStatus = function() {
        if ($scope.sense.senseId && $scope.sense.moduleId) {
          status.ModuleStatus.get({senseId: $scope.sense.senseId, moduleId: $scope.sense.moduleId}, function(response) {
            $scope.sense.moduleStatus = response.status;
          });
        }
      };

      $scope.displayLog = function () {
          $scope.showLogViewer = !$scope.showLogViewer;
      };

      // $scope.displayLog = function () {
      //     $scope.$parent.displayLog();
      // };

    }
  }

})();
