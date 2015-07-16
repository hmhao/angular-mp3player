var app = angular.module('admin', ['ui.bootstrap','ui.router','admin.directives', 'admin.userlist','admin.count']);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('#', {
            url: '',
            templateUrl: '/views/admin/admin-index.html'
        })
        .state('#.userlist',{
            url: '/userlist'
        })
        .state('#.userlist.common',{
            url: '/common',
            views: {
                'content@#': {
                    templateUrl: '/views/admin/userlist/common.html'
                }
            }
        })
        .state('#.count',{
            url: '/count',
            views: {
                'content@#': {
                    templateUrl: '/views/admin/count/index.html'
                }
            }
        })
}]);

app.controller('AdminCtrl', ['$scope', '$location', '$http', '$window', function ($scope, $location, $http, $window) {
    var path = $location.path();
    $scope.checkIfOwnPage = function () {
        return [
            '/404'
        ].indexOf($location.path()) == -1;
    };
    $scope.logout = function(){
        $http.get('/logout').success(function () {
            $window.location = $window.location.origin + $window.location.pathname;
        });
    }
}]);

app.controller('NavCtrl', ['$scope', function($scope) {
    $scope.navInfo = {
        tasks_number: 5
    };
}]);