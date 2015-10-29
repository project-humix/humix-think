(function() {
  'use strict';

  angular
    .module('public')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .state('think', {
        url: "/think",
        templateUrl: "app/node-red/node-red.html"
      })
      .state('sense', {
        url: "/sense",
        templateUrl: "app/main/main.html",
        controller: 'MainController'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
