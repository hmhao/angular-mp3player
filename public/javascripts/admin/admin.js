var app = angular.module('admin', ['ui.bootstrap','ui.router','admin.directives', 'admin.userlist']);

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

app.controller('AdminCtrl', ['$scope', '$location', function ($scope, $location) {
    $scope.checkIfOwnPage = function () {
        return [
            '/404'
        ].indexOf($location.path()) == -1;
    };
}]);

app.controller('NavCtrl', ['$scope', function($scope) {
    $scope.navInfo = {
        tasks_number: 5
    };
}]);
