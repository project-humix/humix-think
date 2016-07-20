(function() {
  'use strict';

  angular.
    module('public').
    factory('status', function ($resource) {
      return {
        SenseStatus: $resource('api/status/:senseId', {}, {}),
        AllModuleStatus: $resource('api/status/:senseId/modules', {}, {}),
        ModuleStatus: $resource('api/status/:senseId/modules/:moduleId', {}, {})
      };
    });

})();
