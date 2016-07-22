(function() {
  'use strict';

  angular
    .module('public')
    .directive('ngModuleItem', ngModuleItem);

  /** @ngInject */
  function ngModuleItem() {
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
          moduleId: '@',
          moduleStatus: '='
      },
      link: function(scope, element, attrs) {
        scope.dynamicTemplateUrl = 'app/components/moduleItem/moduleItem-list.html';
        scope.sense = {};

        attrs.$observe('senseId', function(senseId) {
          scope.sense.senseId = senseId;
          scope.getModuleStatus();
        });

        attrs.$observe('moduleId', function(moduleId) {
          scope.sense.moduleId = moduleId;
          scope.getModuleStatus();
        });

        attrs.$observe('gridView', function(gridView) {
          scope.gridView = gridView;
          if (scope.gridView == "true") {
              scope.dynamicTemplateUrl = 'app/components/moduleItem/moduleItem-grid.html';
          }
          else {
              scope.dynamicTemplateUrl = 'app/components/moduleItem/moduleItem-list.html';
          }
        });
      },
      controller: moduleItemController,
      controllerAs: 'moduleItemController',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function moduleItemController(moduleList, status, $scope, $interval) {
      $scope.showLogViewer = false;

      $interval(getModuleStatus, 10000);

      function getModuleStatus() {
        if ($scope.sense.senseId && $scope.sense.moduleId) {
          status.ModuleStatus.get({senseId: $scope.sense.senseId, moduleId: $scope.sense.moduleId}, function(response) {
            $scope.sense.moduleStatus = response.status;
          });
        }
      }

      $scope.getModuleStatus = getModuleStatus;

      $scope.displayLog = function () {
          $scope.showLogViewer = !$scope.showLogViewer;
      };

      $scope.deleteModule = function(senseId, moduleId) {
        if (confirm("Do you want to delete module [" + moduleId + "] for sense [" + senseId + "] ?")) {
            moduleList.Module.delete({senseId: $scope.sense.senseId, moduleId: $scope.sense.moduleId}, function() {
                $scope.$parent.getModules();
            });
        }
      }

    }
  }

})();
