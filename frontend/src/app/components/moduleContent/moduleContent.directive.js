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
    .directive('ngModuleContent', moduleContent);

  /** @ngInject */
  function moduleContent() {
    var directive = {
      restrict: 'E',
      replace: true,
      template: '<ng-include src="dynamicTemplateUrl"></ng-include>',
      //templateUrl: 'app/components/moduleContent/moduleContent.html',
      scope: {
          creationDate: '=',
          modules: '=',
          senseId: '@'
      },
      link: function(scope, element, attrs){
        scope.dynamicTemplateUrl = 'app/components/moduleContent/moduleContent-list.html';

        attrs.$observe('senseId', function(senseId) {
          scope.senseId = senseId;
          scope.getModules();
        });

        attrs.$observe('gridView', function(gridView) {
          scope.gridView = gridView;
          if (scope.gridView == "true") {
              scope.dynamicTemplateUrl = 'app/components/moduleContent/moduleContent-grid.html';
          }
          else {
              scope.dynamicTemplateUrl = 'app/components/moduleContent/moduleContent-list.html';
          }
        });
      },
      controller: moduleContentController,
      controllerAs: 'moduleContentController',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function moduleContentController(moduleList, $scope) {

      $scope.getModules = function () {
        moduleList.Modules.get({senseId: $scope.senseId}, function(response) {
          $scope.modules = angular.fromJson(response.result);
          $scope.moduleEmpty = $scope.modules.length == 0;
        });
      };

      // $scope.$watch(function(){ return moduleList.getModules}, function(newVal, oldVal){
      //   $log.info('data change'+newVal+' '+oldVal);
      // }, true);

      // vm.open = function(){
      //
      //   var modalInstance = $modal.open({
      //     animation: 1,
      //     templateUrl: 'addModalContent.html',
      //     controller: modalController,
      //     controllerAs: 'vm'
      //   });
      //
      //   modalInstance.result.then(function (sense) {
      //
      //     moduleList.setModule(sense.id, sense.imgId);
      //
      //     $log.info('Generating sense id: ' + sense.id + ', imageId:' + sense.imgId);
      //
      //   }, function () {
      //
      //     $log.info('Modal dismissed at: ' + new Date());
      //
      //   });
      // };
    }

    // function modalController($modalInstance){
    //   var vm = this;
    //
    //   vm.imgId = 10 + Math.floor(Math.random() * 42); // random image id
    //
    //   vm.senseId = ""; // sense id
    //
    //
    //   vm.ok = function(){
    //     $modalInstance.close({id: vm.senseId , imgId: vm.imgId});
    //   };
    //
    //   vm.cancel = function(){
    //     $modalInstance.dismiss('cancel');
    //   };
    // }
  }

})();
