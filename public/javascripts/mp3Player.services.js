var app = angular.module('angular-mp3player');

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
    var _trackBuffer = [];
    var _ctx = new (window.AudioContext ||window.webkitAudioContext || window.mozAudioContext)();
    var _currentID;//正在播放的音频id
    var _playing = false;//是否正在播放
    var _bufferSourceNode;//音频数据源节点引用
    //控制音量的GainNode
    var _gainNode = _ctx[_ctx.createGain ? 'createGain' : 'createGainNode']();
    _gainNode.connect(_ctx.destination);
    //音频分析对象
    var _analyser = _ctx.createAnalyser();
    _analyser.connect(_gainNode);

    return {
        size: 128,//frequency,unit8Array的长度
        current: function(){
            return _currentID;
        },
        playing: function(){
            return _playing;
        },
        init: function(tracks) {
            tracks.forEach(function(val) {//请求音频数据
                $http.get(val.url, {responseType: 'arraybuffer'}).
                    success(function(data) {
                        _ctx.decodeAudioData(data, function(buffer) {//解码音频数据
                            _trackBuffer[val.id] = buffer;//存储解码后的音频数据
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
                _playing && _this.visualizer(arr);
                requestAnimationFrame(v);
            };
            requestAnimationFrame(v);
        },
        add: function(track, data){
            if(!data) return;
            _ctx.decodeAudioData(data, function(buffer) {//解码音频数据
                _trackBuffer[track.id] = buffer;//存储解码后的音频数据
                track.loaded = true;
                track.duration = buffer.duration;
                $rootScope.$apply();
            }, function(err) {console.log('ERROR DECODING AUDIO');});
        },
        play:function(id, time){
            _currentID = id;
            time = time || 0;
            _bufferSourceNode = _ctx.createBufferSource();//创建音频数据源节点
            _bufferSourceNode.buffer = _trackBuffer[id];//设置音频数据
            _bufferSourceNode.connect(_analyser);//将音频数据源连接到音频分析器
            _bufferSourceNode.onended = (function() {//音频播放结束时回调
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