var app = angular.module('admin.login', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $stateProvider
        .state('#', {
            url: '/',
            templateUrl: '/views/admin/admin-login.html',
            controller: 'LoginCtrl'
        });
});
app.controller('LoginCtrl', ['$scope', '$http', '$window', function ($scope, $http, $window) {
    $scope.login = {
        username: '',
        password: ''
    };
    $scope.error = '';
    $scope.doLogin = function () {
        $http.post('/admin/login', $scope.login)
            .success(function(data){
                if(data.success){
                    $window.location = $window.location.origin + $window.location.pathname;
                }else{
                    $scope.error = 'Unknow Error!';
                }
            })
            .error(function(data){
                if(!data.success){
                    $scope.error = data.message;
                }
            })
    };
}]);
