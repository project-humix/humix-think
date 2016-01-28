(function() {
  'use strict';

  angular
    .module('public')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('think', {
        url: "/think",
        templateUrl: "app/node-red/node-red.html"
      })
      .state('sense', {
        url: "/sense",
        templateUrl: "app/main/main.html",
        controller: 'MainController',
        controllerAs: 'main'
      })
      .state('404', {
        url: "/404",
        templateUrl: "app/exception/404.html"
      });
      $urlRouterProvider.when('', '/sense');
      $urlRouterProvider.otherwise('404');
  }

})();
