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

    $scope.$on('user_logined', function(event, user){
        if(user.tracks && user.tracks.length){
            $scope.tracks = Track.parse(user.tracks);
            Player.init($scope.tracks);
        }
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

    var state = ['retweet','random'];
    state.retweet = function(current, length, isNext){
        if(isNext){
            return ++current % length;
        }else{
            return (--current + length) % length;
        }
    };
    state.random = function(current, length, isNext){
        var next;
        do{
            next = Math.floor(Math.random() * length);
        }while(next == current);
        return next;
    };
    state.stateIndex = 0;
    $scope.curState = state[state.stateIndex];
    $scope.mode = function(){
        state.stateIndex = ++state.stateIndex % state.length;
        $scope.curState = state[state.stateIndex];
    };

    $scope.prev = function() {
        if($scope.trackCurrent != -1){
            $scope.log('prev');
            disableAllButtons();
            $scope.buttons.prev = true;
            $scope.trackCurrent = state[$scope.curState]($scope.trackCurrent, $scope.tracks.length, false);
            $scope.play(0);
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
                    $scope.next();
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
            $scope.trackCurrent = state[$scope.curState]($scope.trackCurrent, $scope.tracks.length, true);
            $scope.play(0);
        }
    };
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

app.controller('Mp3playerLyricsCtrl', ['$scope', 'Lyrics', function ($scope, Lyrics) {
    $scope.getLrc = function(id, callback){
        if(typeof id === 'undefined'){
            id = '';
        }
        Lyrics.get($scope.tracks[id], function(data){
            callback(data);
        });
    }
}]);

app.controller('Mp3playerSearchCtrl', ['$scope', 'BaiduMusic', 'Player', function ($scope, BaiduMusic, Player) {
    $scope.searchEngine = {
        engines: ['百度', '网易', '腾讯'],
        current: 0
    };
    $scope.searchSong = '';
    $scope.songs = [];
    $scope.searchMusic = function(){
        if($scope.searchSong !== ''){
            BaiduMusic.getData('search',{query: $scope.searchSong}, function(data){
                if(data && data.song){
                    $scope.songs = data.song;
                }else{
                    $scope.songs = [];
                }
            });
        }else{
            $scope.songs = [];
        }
    };
    $scope.playMusic = function(song){
        //检查歌曲是否存在
        for(var i = $scope.tracks.length - 1; i > 0; i--){
            if($scope.tracks[i].songid == song.songid){
                return;
            }
        }
        BaiduMusic.getData('song',{songid: song.songid}, function(data){
            if(data && data.error_code == 22000){
                var info = data.songinfo,
                    bitrate = data.bitrate;
                var track = {
                    id: $scope.tracks.length,
                    artist: info.author,
                    title: info.title,
                    album: info.album_title,
                    genre: '',
                    songid: info.song_id,
                    lrc: info.lrclink,
                    url: bitrate.file_link,
                    loaded: false,
                    duration: bitrate.file_duration
                };
                $scope.tracks.push(track);
                Player.add(track);
            }
        });
    }
}]);