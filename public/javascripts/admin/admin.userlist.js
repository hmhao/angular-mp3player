var app = angular.module('admin.userlist', []);

app.controller('TableCtrl', ['$scope', '$filter', '$http', function($scope, $filter, $http) {
    $scope.stores = [];

    $scope.searchKeywords = '';
    $scope.filteredStores = [];
    $scope.row = '';
    $scope.onFilterChange = function() {
        $scope.select(1);
        $scope.currentPage = 1;
        $scope.row = '';
    };
    $scope.search = function() {
        $scope.filteredStores = $filter('filter')($scope.stores, $scope.searchKeywords);
        $scope.onFilterChange();
    };

    $scope.numPerPageOpt = [3, 5, 10, 20];
    $scope.numPerPage = $scope.numPerPageOpt[2];
    $scope.currentPage = 1;
    $scope.currentPageStores = [];
    $scope.select = function(page) {
        var start = (page - 1) * $scope.numPerPage,
            end = start + $scope.numPerPage;
        $scope.currentPageStores = $scope.filteredStores.slice(start, end);
    };
    $scope.onNumPerPageChange = function() {
        $scope.select(1);
        $scope.currentPage = 1;
    };
    $scope.onOrderChange = function() {
        $scope.select(1);
        $scope.currentPage = 1;
    };
    $scope.order = function(rowName) {
        if($scope.row !== rowName){
            $scope.row = rowName;
            $scope.filteredStores = $filter('orderBy')($scope.stores, rowName);
            $scope.onOrderChange();
        }
    };

    var init = function() {
        $http.get('/admin/userlist')
            .success(function(data){
                $scope.stores = data;
                $scope.search();
            });
    };
    init();
}]);