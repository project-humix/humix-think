(function() {
  'use strict';

  angular.
    module('public').
    factory('deviceStatus', deviceStatus);

    function deviceStatus($resource) {
      return $resource('api/devices/:senseId/status', {}, {});
    }

})();
