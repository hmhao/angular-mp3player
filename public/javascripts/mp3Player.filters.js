var app = angular.module('angular-mp3player');

app.filter('titleLength', function () {
    return function (input) {
        if (input.length < 22)
            return input;
        return input.substring(0, 23) + '...';
    }
});

app.filter('formatTime', function () {
    return function (time) {
        time = time || 0;
        if(typeof(time) === 'string'){
            time = parseInt(time);
        }

        var minutes = Math.floor(time / 60);
        var seconds = Math.floor(time - minutes * 60);
        if (minutes < 10)
            minutes = '0' + minutes;
        if (seconds < 10)
            seconds = '0' + seconds;

        return minutes + ':' + seconds;
    }
});