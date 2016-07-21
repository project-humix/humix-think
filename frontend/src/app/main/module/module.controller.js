(function() {
  'use strict';

  angular
    .module('public')
    .controller('ModuleController', ModuleController);

  /** @ngInject */
  function ModuleController($scope, $state, $stateParams) {
    var vm = this;
    //$log.info('senseId: ' + $stateParams.senseId);
    vm.senseId = $stateParams.senseId;

  }
})();
