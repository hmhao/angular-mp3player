var express = require('express');
var request = require('request');
var passport = require('./passport');
var User = require('../models/user');
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

router.post('/register', function(req, res, next) {
    var username = req.body.username;
    var email = req.body.email;
    var password = req.body.password;

    // validate username, email and password
    if(!username || !username.length) {
        return res.send(400, { message: 'username is not valid' });
    }
    if(!email || !email.length) {
        return res.send(400, { message: 'email is not valid' });
    }
    if(!password || !password.length) {
        return res.send(400, { message: 'password is not valid' });
    }

    User.findOne({ 'username': username }, function (err, user) {
        if (err) { return next(err); }

        // check if user is already exists
        if (user) {
            return res.send(409, { message: 'the username is already taken.' });
        }

        // create and save a new user
        user = new User();
        user.username = username;
        user.email = email;
        user.password = password;

        user.save(function (err, user) {
            if (err) { return next(err); }

            // login after user is registered and saved
            req.logIn(user, function (err) {
                if (err) { return next(err); }
                var result = {
                    username: user.username,
                    email: user.email,
                    tracks: user.tracks
                };
                return res.send(result);
            });
        });
    });
});

router.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            return res.send(401, { success: false, message: info.message });
        }
        // if user, Log in
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            var result = {
                username: user.username,
                email: user.email,
                tracks: user.tracks
            };
            return res.send(result);
        });
    })(req, res, next);
});

router.get('/logout', function (req, res) {
    req.logout();
    res.send(200);
});

router.get('/user', passport.ensureAuthenticated, function(req, res) {
    var user = req.user;
    var result = {
        username: user.username,
        email: user.email,
        tracks: user.tracks
    };
    return res.send(result);
});

module.exports = router;