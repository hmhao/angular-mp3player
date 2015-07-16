var app = angular.module('admin.count', []);

app.controller('CountCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.tables = {
        hot_artist: {
            title: '歌手热播',
            data: []
        },
        hot_song: {
            title: '歌曲热播',
            data: []
        }
    };

    $http.get('/admin/hotsong_rate_date')
        .success(function (data) {
            $scope.tables.hot_song.data = data;
        });

    $http.get('/admin/hotartist_rate_date')
        .success(function (data) {
            $scope.tables.hot_artist.data = data;
        });
}]);