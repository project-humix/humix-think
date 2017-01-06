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
    .directive('ngSenseContent', senseContent);

  /** @ngInject */
  function senseContent() {
    var directive = {
      restrict: 'E',
      template: '<ng-include src="dynamicTemplateUrl"></ng-include>',
      //templateUrl: 'app/components/senseContent/senseContent-table.html',
      scope: {
          creationDate: '='
      },
      link: function(scope, element, attrs) {
        scope.dynamicTemplateUrl = 'app/components/senseContent/senseContent-list.html';
        attrs.$observe('viewType', function(viewType) {
          if (viewType == "grid") {
              scope.gridView = "true";
          }
          else {
              scope.gridView = "false";
          }
        });

        scope.$watch('gridView', function(gridView) {
          scope.gridView = gridView;
          if (scope.gridView == "true") {
              scope.dynamicTemplateUrl = 'app/components/senseContent/senseContent-grid.html';
          }
          else {
              scope.dynamicTemplateUrl = 'app/components/senseContent/senseContent-list.html';
          }
        });
      },
      controller: senseContentController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function senseContentController(deviceList, $scope, $modal, $log) {
      var vm = this;

      vm.getDevices = deviceList.getDevices;
      vm.delDevice = deviceList.delDevice;
      // vm.deviceEmpty = (angular.equals(vm.getDevices(),{})) ? true: false;

      // $scope.$watch(function(){ return deviceList.getDevices}, function(newVal, oldVal){
      //   $log.info('data change'+newVal+' '+oldVal);
      // }, true);

      vm.viewButtonClick = function() {
          $log.info('org scope.gridView: ' + $scope.gridView);
          $scope.gridView = !$scope.gridView;
      };

      vm.open = function(){

        var modalInstance = $modal.open({
          animation: 1,
          templateUrl: 'addModalContent.html',
          controller: modalController,
          controllerAs: 'vm'
        });

        modalInstance.result.then(function (sense) {

          deviceList.setDevice(sense.id, sense.imgId);

          $log.info('Generating sense id: ' + sense.id + ', imageId:' + sense.imgId);

        }, function () {

          $log.info('Modal dismissed at: ' + new Date());

        });
      };
    }

    function modalController($modalInstance){
      var vm = this;

      vm.imgId = 1 + Math.floor(Math.random() * 9); // random image id

      vm.senseId = ""; // sense id


      vm.ok = function(){
        $modalInstance.close({id: vm.senseId , imgId: vm.imgId});
      };

      vm.cancel = function(){
        $modalInstance.dismiss('cancel');
      };
    }
  }

})();
