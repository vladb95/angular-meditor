/* angular-meditor demo
 */

var app = angular.module('meditorDemo', [
  'angular-meditor'
]);

app.controller('MainCtrl', function($scope, $rootScope) {

  var model = $scope.model = {};
  model.text = 'angular-meditor using ng-model.';
  
});
