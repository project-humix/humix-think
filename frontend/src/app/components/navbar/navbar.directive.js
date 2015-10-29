(function() {
  'use strict';

  angular
    .module('public')
    .directive('ngNavbar', ngNavbar);

  /** @ngInject */
  function ngNavbar() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      scope: {
          creationDate: '='
      },
      controller: NavbarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function NavbarController() {
      
    }
  }

})();
