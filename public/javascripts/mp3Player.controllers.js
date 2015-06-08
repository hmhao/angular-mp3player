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

app.controller('Mp3playerTimeCtrl', ['$scope', 'Player', function ($scope, Player) {
    $scope.currTime = 0;
    $scope.totalTime = 0;
    $scope.$watch('trackCurrent', function(value) {
        if(value != -1){
            $scope.totalTime = $scope.tracks[value].duration;
        }
    });
    /*$scope.$watch(function(){
        return Player.currentTime();
    }, function(value) {
        $scope.currTime = value;
    });*/
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

    $scope.play = function() {
        $scope.log('play');
        disableAllButtons();
        $scope.buttons.play = true;
        if($scope.trackCurrent != -1){
            Player.stop();
            addWatch('tracks['+ $scope.trackCurrent + '].loaded',function(){
                Player.play($scope.trackCurrent);
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