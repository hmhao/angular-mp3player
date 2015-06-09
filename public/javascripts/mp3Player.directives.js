var app = angular.module('angular-mp3player');

app.directive('mp3player', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player.html',
        replace: true,
        link: function(scope, element, attrs) {
        }
    }
});

app.directive('mp3playerDisplay', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player-display.html',
        replace: true,
        link: function(scope, element, attrs) {

        }
    }
});

app.directive('mp3playerTime', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player-time.html',
        replace: true,
        link: function(scope, element, attrs) {
            var timeSlider = element.find('.slider.time');
            scope.timeSlider = new components.HSlider({
                view:timeSlider,
                min:parseFloat(timeSlider.attr("data-min")),
                max:parseFloat(timeSlider.attr("data-max")),
                value:parseFloat(timeSlider.attr("data-value"))
            });
            $(scope.timeSlider).on('change mouseup', function(e){
                scope.currTime = parseInt(this.value * scope.totalTime);
                if(e.type === 'mouseup'){
                    scope.play(scope.currTime);
                }
                scope.$apply();
            });

            scope.$watch(function(){
                return scope.timeSlider.isDragged;
            }, function(value) {
                scope.isDragged = value;
            });

            scope.$watch('currTime', function(newVal, oldVal) {
                if(newVal != oldVal && !scope.isDragged){//更新视图
                    scope.timeSlider.value = scope.currTime / scope.totalTime;
                    var position = scope.timeSlider.valueToPosition(scope.timeSlider.value);
                    scope.timeSlider.animateThumb(position);
                }
            });
        }
    }
});

app.directive('mp3playerButtons', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player-buttons.html',
        replace: true,
        link: function(scope, element, attrs) {

        }
    }
});

app.directive('mp3playerVolume', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player-volume.html',
        replace: true,
        link: function(scope, element, attrs) {
            var volumeSlider = element.find('.slider.volume');
            var volumeButton = element.find('button');

            scope.volume = parseFloat(volumeSlider.attr("data-value"));
            scope.volumeSlider = new components.HSlider({
                view:volumeSlider,
                min:parseFloat(volumeSlider.attr("data-min")),
                max:parseFloat(volumeSlider.attr("data-max")),
                value:parseFloat(scope.volume)
            });
            $(scope.volumeSlider).on('change', function(){
                var className = 'glyphicon glyphicon-volume-';
                $('span',volumeButton).attr('class',this.value >= 0.5 ? className + 'up' : className + 'down');
                scope.volume = this.value;
                !scope.$$phase && scope.$apply();
            }).trigger('change');

            volumeButton.on('click',function(){
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
        templateUrl: '/directives/mp3player-tracks.html',
        replace: true,
        link: function(scope, element, attrs) {
            element.delegate('ul li', 'click',function(){
                if(scope.trackCurrent != $(this).data('id')){
                    scope.trackCurrent = $(this).data('id');
                    scope.play();
                    scope.$apply();
                }
            });
        }
    }
});

app.directive('mp3playerVisualize', function() {
    return {
        restrict: 'E',
        templateUrl: '/directives/mp3player-visualize.html',
        replace: true,
        link: function(scope, element, attrs) {
            var canvas = $('#canvas');
            var ctx = canvas[0].getContext('2d');
            var cWidth = canvas.width();
            var cHeight = canvas.height() * 2;
            //创建线性渐变对象，以便绘制柱状图使用
            var line = ctx.createLinearGradient(0, 0, 0, cHeight);
            line.addColorStop(0, 'red');
            line.addColorStop(0.5, 'yellow');
            line.addColorStop(1, 'green');
            ctx.fillStyle = line;
            //console.log(cWidth,cHeight);

            var renderColumn = function(arr){
                ctx.clearRect(0,0,cWidth,cHeight);
                var w = cWidth / scope.size;
                for(var i = 0, h; i < scope.size; i++){
                    h = arr[i] / 256 * cHeight;
                    ctx.fillRect(w * i, cHeight - h, w * 0.6, h);
                }
            };

            var renderDot = function(arr){
                ctx.clearRect(0,0,cWidth,cHeight);
                var w = cWidth / scope.size;
                for(var i = 0, r; i < scope.size; i++){
                    r = arr[i] / 256 * 50;

                }
            };

            scope.visualize(renderColumn);
        }
    }
});