var express = require('express'),
    mp3player = require('../controllers/mp3player'),
    user = require('../controllers/user'),
    admin = require('../controllers/admin');

var router = express.Router();
router.get('/', function (req, res) {
    var app = require('../../app');
    res.render('index', {title: app.get('appName')});
});

router.get('/admin', function (req, res) {
    var app = require('../../app'),
        data = {
            title: app.get('appName'),
            admin: req.isAuthenticated() && req.user && req.user.admin === true
        };
    res.render('admin', data);
});
//router.get('/admin/*', user.ensureAuthenticated, user.ensureAdmin);
router.post('/admin/login', admin.login);
router.get('/admin/userlist', admin.userlist);
router.get('/admin/hotartist', admin.hotartist);
router.get('/admin/hotartist_rate_date', admin.hotartist_rate_date);
router.get('/admin/hotsong', admin.hotsong);
router.get('/admin/hotsong_rate_date', admin.hotsong_rate_date);

//mp3player相关
router.get('/lrc', mp3player.lrc);
router.get('/media', mp3player.media);
router.post('/upload', mp3player.upload);
router.post('/save', user.ensureAuthenticated, mp3player.save);
router.post('/count', mp3player.count);

//user相关
router.post('/register', user.register);
router.post('/login', user.login);
router.get('/logout', user.logout);
router.get('/user', user.ensureAuthenticated, user.user);
router.passport = user;

module.exports = router;