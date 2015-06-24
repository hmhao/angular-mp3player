var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/', function (req, res) {
    var app = require('../app');
    res.render('index', {title: app.get('appName')});
});

router.get('/lrc', function ($req, $res) {
    var url = $req.query.url || '';
    if (url) {
        request.get(url, function (err, res, data) {
            if (err) {
                $res.send('');
            }
            $res.send(data);
        });
    } else {
        $res.send('');
    }
});

router.get('/media', function ($req, $res, next) {
    var url = $req.query.url || '';
    if (url) {
        request.get(url).pipe($res);
    } else {
        $res.sendStatus(404);
    }
});

router.post('/upload', function(req, res) {
    if(req.files && !req.files.upload.truncated){
        res.json({ message: 'Uploaded success!'});
    }else{
        res.json({ message: 'Uploaded failed!'});
    }
});

module.exports = router;