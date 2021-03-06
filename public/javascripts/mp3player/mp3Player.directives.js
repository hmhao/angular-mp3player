var app = angular.module('angular-mp3player');

app.directive('mp3player', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player/mp3player.html',
        replace: true
    }
});

app.directive('mp3playerDisplay', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player/mp3player-display.html',
        replace: true,
        link: function(scope, element, attrs) {
            var flyinText = new FlyinText();
            var songText = $('.display .song');
            scope.$watch('Display', function(newVal, oldVal) {
                if(newVal != oldVal){//更新视图
                    songText.css('position', 'absolute');
                    var wholeWidth = songText.width();
                    songText.css('position', 'relative');
                    var realWidth = songText.width();
                    flyinText.init(songText, realWidth, wholeWidth);//标题移动
                    flyinText.start();
                }
            });
        }
    }
});

app.directive('mp3playerTime', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player/mp3player-time.html',
        replace: true,
        link: function(scope, element, attrs) {
            var timeSlider = element.find('.slider.time');
            scope.timeSlider = new components.HSlider({//时间轴滑动条
                view:timeSlider,
                min:parseFloat(timeSlider.attr('data-min')),
                max:parseFloat(timeSlider.attr('data-max')),
                value:parseFloat(timeSlider.attr('data-value'))
            });
            $(scope.timeSlider).on('change mouseup', function(e){
                scope.currTime = parseInt(this.value * scope.totalTime);
                if(e.type === 'mouseup'){
                    scope.play(scope.currTime);
                }
                scope.$apply();
            });

            scope.$watch(function(){//监听是否操作时间轴滑动条
                return scope.timeSlider.isDragged;
            }, function(value) {
                scope.isDragged = value;
            });

            scope.$watch('currTime', function(newVal, oldVal) {//监听时间模型以更新时间轴滑动条
                if(newVal != oldVal && !scope.isDragged){//更新视图
                    scope.timeSlider.value = scope.currTime / scope.totalTime;
                    var position = scope.timeSlider.valueToPosition(scope.timeSlider.value);
                    scope.timeSlider.animateThumb(position);
                }
            });
        }
    }
});

app.directive('mp3playerAdd', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player/mp3player-add.html',
        replace: true,
        link: function(scope, element, attrs) {
            element.find('#upload').on('change', function(e){
                var file = this.files[0];
                var fr = new FileReader();
                fr.onload = function(e){
                    scope.addLocalAudio({
                        title: file.name.substr(0, file.name.lastIndexOf('.')),
                        data: e.target.result
                    });
                };
                fr.readAsArrayBuffer(file);
                angular.element(this).parent('form').submit();
                angular.element(this).val('');
            });
        }
    }
});

app.directive('mp3playerButtons', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player/mp3player-buttons.html',
        replace: true,
        link: function(scope, element, attrs) {
            element.delegate('button', 'click', function(){
                var button = $(this);
                var func = button.attr('name');
                if(!button.hasClass('pressed')){//非已点击的按钮才执行相应的操作
                    scope[func] && scope[func]();
                    scope.$apply();
                }
            });
        }
    }
});

app.directive('mp3playerVolume', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player/mp3player-volume.html',
        replace: true,
        link: function(scope, element, attrs) {
            var volumeSlider = element.find('.slider.volume');
            var volumeButton = element.find('button');

            scope.volume = parseFloat(volumeSlider.attr('data-value'));
            scope.volumeSlider = new components.HSlider({//音量滑动条
                view:volumeSlider,
                min:parseFloat(volumeSlider.attr('data-min')),
                max:parseFloat(volumeSlider.attr('data-max')),
                value:parseFloat(scope.volume)
            });
            $(scope.volumeSlider).on('change', function(){//音量改变时更新音量按钮样式
                var className = 'glyphicon glyphicon-volume-';
                $('span',volumeButton).attr('class',this.value >= 0.5 ? className + 'up' : className + 'down');
                scope.volume = this.value;
                !scope.$$phase && scope.$apply();
            }).trigger('change');

            volumeButton.on('click',function(){//音量按钮的静音切换
                var className = 'glyphicon glyphicon-volume-';
                scope.isMute = !scope.isMute;
                if(scope.isMute){
                    scope.muteVolume = scope.volumeSlider.value;
                    scope.volumeSlider.setValue(0);
                    $('span',this).attr('class',className + 'off');
                }else{
                    scope.volumeSlider.setValue(scope.muteVolume);
                    $('span',this).attr('class',scope.muteVolume >= 0.5 ? className + 'up' : className + 'down');
                }
            });
        }
    }
});

app.directive('mp3playerTracks', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player/mp3player-tracks.html',
        replace: true,
        link: function(scope, element, attrs) {
            element.delegate('ul li', 'click', function(){
                if(scope.trackCurrent != $(this).data('id')){
                    scope.trackCurrent = $(this).data('id');
                    scope.play(0);
                    scope.$apply();
                }
            });
        }
    }
});

app.directive('mp3playerVisualize', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player/mp3player-visualize.html',
        replace: true,
        link: function(scope, element, attrs) {
            var canvas = element.find('canvas')[0],
                visualizer = new Visualizer(canvas),
                vQueue = [
                    visualizer.renderStripblock,
                    visualizer.renderOhter3,
                    visualizer.renderOhter2,
                    visualizer.renderOhter1,
                    visualizer.renderEqual,
                    visualizer.renderSinewave,
                    visualizer.renderLine,
                    visualizer.renderColumn,
                    visualizer.renderDot
                ],
                index = 0;

            element.on('click', function(){
                index = ++index % vQueue.length;
                scope.visualize(vQueue[index]);
            });
            scope.visualize(vQueue[index]);
        }
    }
});

app.directive('mp3playerLyrics', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player/mp3player-lyrics.html',
        replace: true,
        link: function(scope, element, attrs) {
            var lrc = new Lrc({el:element});
            var watch, id;
            scope.$watch('trackCurrent', function(value) {
                if (value != -1){
                    if(watch) watch();// clear the watch
                    id = scope.tracks[value].id;
                    scope.getLrc(id, function(data){
                        lrc.create(data);
                        watch = scope.$watch('currTime', function(newVal, oldVal) {
                            if(newVal != oldVal){//更新视图
                                lrc.scrollTo(newVal * 1000);
                            }
                        });
                    });
                }
            });
        }
    }
});

app.directive('mp3playerSearch', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player/mp3player-search.html',
        replace: true,
        link: function(scope, element, attrs) {

        }
    }
});