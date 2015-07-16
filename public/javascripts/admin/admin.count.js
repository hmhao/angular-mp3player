var app = angular.module('admin.count', []);

app.controller('CountCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.tables = {
        hot_artist: {
            title: '歌手热播',
            head: [{
                key: 'index',
                value: '#'
            }, {
                key: 'artist',
                value: '歌手'
            }],
            data: []
        },
        hot_song: {
            title: '歌曲热播',
            head: [{
                key: 'index',
                value: '#'
            }, {
                key: 'song',
                value: '歌曲'
            },{
                key: 'artist',
                value: '歌手'
            }],
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