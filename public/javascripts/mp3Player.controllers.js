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

app.controller('Mp3playerDisplayCtrl', ['$scope', 'Display', function ($scope, Display) {
    $scope.Display = Display.text;
    $scope.Album = Display.album;
    $scope.Genre = Display.genre;
}]);

app.controller('Mp3playerTimeCtrl', ['$scope', '$interval', 'Player', function ($scope, $interval, Player) {
    var promise = {
        id: null,
        process: function process(){
            if($scope.isDragged) return;
            if(++$scope.currTime >= $scope.totalTime){
                $scope.currTime = $scope.totalTime;
            }
        }
    };
    $scope.isDragged = false;
    $scope.currTime = 0;
    $scope.totalTime = 0;
    $scope.$watch(function(){
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

app.controller('Mp3playerButtonsCtrl', ['$scope', 'Display', 'Player', function ($scope, Display, Player) {
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
    function addWatch(watchExp, callback){
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
                $scope.play();
            }
        }
    };

    $scope.play = function(time) {
        $scope.log('play');
        disableAllButtons();
        $scope.buttons.play = true;
        if($scope.trackCurrent != -1){
            Player.stop();
            addWatch('tracks['+ $scope.trackCurrent + '].loaded',function(){
                Player.play($scope.trackCurrent, time);
                Player.onended = function(){
                    console.log('onEnd');
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
    };

    $scope.stop = function() {
        $scope.log('stop');
        if ($scope.buttons.stop)
            return;
        disableAllButtons();
        $scope.buttons.stop = true;
    };

    $scope.next = function() {
        if($scope.trackCurrent != -1){
            $scope.log('next');
            disableAllButtons();
            $scope.buttons.next = true;
            if($scope.trackCurrent != Math.min($scope.tracks.length-1,$scope.trackCurrent+1)){
                $scope.trackCurrent++;
                $scope.play();
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