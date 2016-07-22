(function() {
  'use strict';

  angular.
    module('public').
    factory('moduleList', function ($resource) {
      return {
        Modules: $resource('api/devices/:senseId/modules', {}, {}),
        Module: $resource('api/devices/:senseId/modules/:moduleId', {}, {})
      };
    });

})();
