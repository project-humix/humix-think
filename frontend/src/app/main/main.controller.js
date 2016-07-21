(function() {
  'use strict';

  angular
    .module('public')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($stateParams, $timeout, toastr) {
    var vm = this;

    vm.viewType = ($stateParams.viewType == 'grid') ? 'grid' : 'list';
    vm.awesomeThings = [];
    vm.classAnimation = '';
    vm.creationDate = 1445587798203;
    vm.showToastr = showToastr;

    activate();

    function activate() {
      $timeout(function() {
        vm.classAnimation = 'rubberBand';
      }, 4000);
    }

    function showToastr() {
      toastr.info('Fork <a href="https://github.com/Swiip/generator-gulp-angular" target="_blank"><b>generator-gulp-angular</b></a>');
      vm.classAnimation = '';
    }

  }
})();
