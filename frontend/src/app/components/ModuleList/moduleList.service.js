(function() {
  'use strict';

  angular.
    module('public').
    factory('moduleList', function ($resource) {
      return $resource('api/devices/:senseId/modules', {}, {})
    });

})();
