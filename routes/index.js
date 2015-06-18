var express = require("express");
var request = require('request');
var config = require("./config");
var router = express.Router();

router.get('/', function (req, res) {
    res.render('index', {title: config.appName});
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

module.exports = router;