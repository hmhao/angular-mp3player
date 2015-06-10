var app = angular.module('angular-mp3player');

app.controller('Mp3playerCtrl', ['$rootScope', '$scope', 'Track', 'Player', function ($rootScope, $scope, Track, Player) {
    /****** debug stuff *******/
    $rootScope.debug = true;
    $rootScope.log = function(text) {
        if ($rootScope.debug)
            console.log(text);
    };

    /****** global vars *******/
    $scope.title = 'AngularJS - MP3 Player';
    $scope.theme = 'Dark';

    $scope.tracks = [];
    $scope.trackCurrent = -1;

    Track.getTracklist(function(data){
        $scope.tracks = data;
        Player.init($scope.tracks);
    });
}]);

app.controller('Mp3playerDisplayCtrl', ['$scope', function ($scope) {
    $scope.Display = 'text';
    $scope.Album = 'album';
    $scope.Genre = 'genre';

    $scope.$watch('trackCurrent', function(value) {
        if (value != -1){
            var track = $scope.tracks[value];
            $scope.Display = track.title;
            $scope.Album = track.album;
            $scope.Genre = track.genre;
        }
    });
}]);

app.controller('Mp3playerTimeCtrl', ['$scope', '$interval', 'Player', function ($scope, $interval, Player) {
    var promise = {
        id: null,
        process: function process(){//更新当前播放时间
            if($scope.isDragged || !Player.playing()) return;//用户操作时间轴时不需要更新
            if(++$scope.currTime >= $scope.totalTime){
                $scope.currTime = $scope.totalTime;
            }
        }
    };
    $scope.isDragged = false;//是否操作时间轴
    $scope.currTime = 0;//当前播放时间
    $scope.totalTime = 0;//总时长
    $scope.$watch(function(){//监听播放开始
        return Player.playing();
    }, function(value) {
        if(value){
            $scope.totalTime = $scope.tracks[$scope.trackCurrent].duration;
            promise.id = $interval(promise.process, 1000);
        }else{
            $interval.cancel(promise.id);
        }
    });
}]);

app.controller('Mp3playerAddCtrl', ['$scope', 'Player', function ($scope, Player) {
    $scope.addLocalAudio = function(opts){
        var track = {
            id: $scope.tracks.length,
            artist: 'local',
            title: opts.title,
            album: 'local',
            genre: 'local',
            url: '',
            loaded: false,
            duration: ''
        };
        $scope.tracks.push(track);
        Player.add(track, opts.data);
    }
}]);

app.controller('Mp3playerButtonsCtrl', ['$scope', 'Player', function ($scope, Player) {
    /*按钮点击状态*/
    $scope.buttons = {
        prev: false,
        play: false,
        pause: false,
        stop: false,
        next: false
    };

    function disableAllButtons() {
        for(var button in $scope.buttons){
            $scope.buttons[button] = false;
        }
    }

    var watch;
    function addWatch(watchExp, callback){//监听表达式的一次变化
        if(watch) watch();// clear the watch
        watch = $scope.$watch(watchExp, function (value) {
            if(value){
                if(watch) watch();// clear the watch
                callback();
            }
        });
    }

    $scope.prev = function() {
        if($scope.trackCurrent != -1){
            $scope.log('prev');
            disableAllButtons();
            $scope.buttons.prev = true;
            if($scope.trackCurrent != Math.max(0,$scope.trackCurrent-1)){
                $scope.trackCurrent--;
                $scope.play(0);
            }
        }
    };

    $scope.play = function(time) {
        if(time === undefined){
            time = $scope.currTime || 0;
        }
        if($scope.trackCurrent != -1){
            $scope.log('play');
            disableAllButtons();
            $scope.buttons.play = true;
            Player.stop();
            $scope.currTime = time;
            addWatch('tracks['+ $scope.trackCurrent + '].loaded',function(){
                Player.play($scope.trackCurrent, $scope.currTime);
                Player.onended = function(){
                    console.log('onEnd');
                    $scope.stop();
                };
            });
        }
    };

    $scope.pause = function() {
        $scope.log('pause');
        if ($scope.buttons.pause)
            return;
        disableAllButtons();
        $scope.buttons.pause = true;
        Player.stop();
    };

    $scope.stop = function() {
        $scope.log('stop');
        if ($scope.buttons.stop)
            return;
        disableAllButtons();
        $scope.buttons.stop = true;
        Player.stop();
        $scope.currTime = 0;
    };

    $scope.next = function() {
        if($scope.trackCurrent != -1){
            $scope.log('next');
            disableAllButtons();
            $scope.buttons.next = true;
            if($scope.trackCurrent != Math.min($scope.tracks.length-1,$scope.trackCurrent+1)){
                $scope.trackCurrent++;
                $scope.play(0);
            }
        }
    }
}]);

app.controller('Mp3playerVolumeCtrl', ['$scope', 'Player', function ($scope, Player) {
    $scope.isMute = false;
    $scope.muteVolume = 0;
    $scope.volume = 0;
    $scope.$watch('volume', function(value) {
        Player.changeVolume(value);
    });
}]);

app.controller('Mp3playerVisualizeCtrl', ['$scope', 'Player', function ($scope, Player) {
    $scope.size = Player.size;
    $scope.visualize = function(visualizer){
        Player.visualizer = visualizer;
    };
}]);