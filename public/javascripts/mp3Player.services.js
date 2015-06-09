var app = angular.module('angular-mp3player');

app.service('Display', function () {
    var display = {
        text: 'text',
        album: 'album',
        genre: 'genre'
    };
    return display;
});

app.service('Track', ['$http', function ($http) {
    var cachedData;
    return {
        getTracklist: function(callback) {
            if (cachedData) {
                callback(cachedData);
            } else {
                $http({
                    method: 'GET',
                    url: '/medias/tracklist.json'
                }).success(function(data){
                    var i = 0;
                    cachedData = [];
                    data.tracks.forEach(function(data) {
                        cachedData.push({
                            id: i++,
                            artist: data.artist,
                            title: data.title,
                            album: data.album,
                            genre: data.genre,
                            url: data.url,
                            loaded: false,
                            duration: ''
                        });
                    });
                    callback(cachedData);
                });
            }
        }
    };
}]);

app.service('Player', ['$rootScope', '$http', function ($rootScope, $http) {
    var init = false;
    var _trackBuffer = [];
    var _ctx = new (window.AudioContext ||window.webkitAudioContext || window.mozAudioContext)();
    var _currentID;
    var _playing = false;
    var _bufferSourceNode;
    //控制音量的GainNode
    var _gainNode = _ctx[_ctx.createGain ? 'createGain' : 'createGainNode']();
    _gainNode.connect(_ctx.destination);
    //音频分析对象
    var _analyser = _ctx.createAnalyser();
    _analyser.connect(_gainNode);

    return {
        size: 128,//unit8Array的长度
        current: function(){
            return _currentID;
        },
        playing: function(){
            return _playing;
        },
        currentTime: function(){
            return _ctx.currentTime;
        },
        init: function(tracks) {
            tracks.forEach(function(val) {
                $http.get(val.url, {responseType: 'arraybuffer'}).
                    success(function(data) {
                        _ctx.decodeAudioData(data, function(buffer) {
                            _trackBuffer[val.id] = buffer;
                            for (var i=0; i<tracks.length; i++) {
                                if (tracks[i].id == val.id) {
                                    tracks[i].loaded = true;
                                    tracks[i].duration = buffer.duration;
                                    $rootScope.$apply();
                                }
                            }
                        }, function(err) {console.log('ERROR DECODING AUDIO');});
                    }).
                    error(function(data, status) {
                        console.log('ERROR WHILE GETTING AUDIO FILES');
                    });
            });

            //可视化当前正在播放的音频
            _analyser.fftSize = this.size * 2;
            var arr = new Uint8Array(_analyser.frequencyBinCount);
            var requestAnimationFrame = window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.mzRequestAnimationFrame;

            var _this = this;
            var v = function(){
                _analyser.getByteFrequencyData(arr);
                //将分析得到的音频数据传递给mv.visualizer方法可视化
                _this.visualizer(arr);
                requestAnimationFrame(v);
            };
            requestAnimationFrame(v);
        },
        play:function(id, time){
            _currentID = id;
            time = time || 0;
            _bufferSourceNode = _ctx.createBufferSource();
            _bufferSourceNode.buffer = _trackBuffer[id];
            _bufferSourceNode.connect(_analyser);
            _bufferSourceNode.onended = (function() {
                var _this = this;
                return function(){
                    _playing = false;
                    _this.onended && _this.onended();
                };
            }).call(this);
            //兼容较老的API
            _bufferSourceNode[_bufferSourceNode.start ? 'start' : 'noteOn'](0,time);
            _playing = true;
        },
        stop:function(){
            _currentID = null;
            //兼容较老的API
            if(_bufferSourceNode){
                _bufferSourceNode[_bufferSourceNode.stop ? 'stop' : 'noteOff'](0);
                _bufferSourceNode.onended = null;
                _bufferSourceNode = null;
            }
            _playing = false;
        },
        changeVolume: function(percent){
            _gainNode.gain.value = percent;
        },
        onended: function(){

        },
        visualizer: function(arr){

        }
    }
}]);