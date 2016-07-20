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
        });

        attrs.$observe('moduleId', function(moduleId) {
          scope.sense.moduleId = moduleId;
        });
      },
      controller: moduleItemController,
      controllerAs: 'moduleItemController',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function moduleItemController(deviceStatus, $scope, $interval) {

      $interval( function(){
        deviceStatus.get({senseId: $scope.sense.senseId}, function(response) {
          $scope.sense.moduleStatus = angular.fromJson(response.result);
        });
      }, 1000);

      $scope.displayLog = function () {
          $scope.$parent.displayLog();
      };

    }
  }

})();
