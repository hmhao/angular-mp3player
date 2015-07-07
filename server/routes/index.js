var express = require('express'),
    mp3player = require('../controllers/mp3player'),
    user = require('../controllers/user');

var router = express.Router();
router.get('/', function (req, res) {
    var app = require('../../app');
    res.render('index', {title: app.get('appName')});
});

//mp3player相关
router.get('/lrc', mp3player.lrc);
router.get('/media', mp3player.media);
router.post('/upload', mp3player.upload);
router.post('/save', mp3player.save);

//user相关
router.post('/register', user.register);
router.post('/login', user.login);
router.get('/logout', user.logout);
router.get('/user', user.ensureAuthenticated, user.user);
router.passport = user;

module.exports = router;