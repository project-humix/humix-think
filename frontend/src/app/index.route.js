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
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('think', {
        url: "/think",
        templateUrl: "app/node-red/node-red.html"
      })
      .state('sense', {
        url: "/sense/:viewType",
        templateUrl: "app/main/main.html",
        controller: 'MainController',
        controllerAs: 'main'
      })
      .state('module', {
        url: "/module/:senseId",
        templateUrl: "app/main/module/module.html",
        controller: 'ModuleController',
        controllerAs: 'module'
      })
      .state('404', {
        url: "/404",
        templateUrl: "app/exception/404.html"
      });
      $urlRouterProvider.when('', '/sense/list');
      $urlRouterProvider.when('/sense', '/sense/list');
      $urlRouterProvider.otherwise('404');
  }

})();
