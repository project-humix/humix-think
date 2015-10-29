(function() {
  'use strict';

  angular
    .module('public')
    .directive('ngSenseItem', ngSenseItem);

  /** @ngInject */
  function ngSenseItem(deviceList) {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/senseItem/senseItem.html',
      scope: {
          senseId: '@',
          imgId: '@'
      },
      link: function(scope, element, attrs) {
        scope.sense = {};

        attrs.$observe('senseId', function(senseId) {
          scope.sense.senseId = senseId;          
        });

        attrs.$observe('imgId', function(imgId) {
          scope.sense.imgId = imgId;
        });

        scope.delDevice = deviceList.delDevice;
      }
    };

    return directive;
  }

})();
