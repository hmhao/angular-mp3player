var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var fs = require('fs');
var ejs = require('ejs');

var routes = require('./routes/index');

var app = express();

app.set('appName', 'angular-mp3player');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.set('mediaPath', path.join(__dirname, 'public/medias'));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({
    dest: app.get('mediaPath'),
    includeEmptyFields: true,
    limits: {
        fileSize: 1024*1024*6
    },
    rename: function(fieldname, filename, req, res){
        return filename + '-' +Date.now();
    },
    onFileUploadStart: function (file, req, res) {
        if(file.mimetype !== 'audio/mp3')
            return false;
    },
    /*onFileUploadComplete: function (file, req, res) {
    },*/
    onError: function (error, next) {
        console.log(error);
        next(error)
    },
    onFileSizeLimit: function (file) {
        console.log('Failed: ', file.originalname);
        fs.unlink(file.path, function(err){}); // delete the partially written file
    }
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
