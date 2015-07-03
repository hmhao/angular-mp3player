var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    User = require('../models/user');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

//passport默认使用用户名和密码来验证
passport.use(new LocalStrategy(function(username, password, done) {
    //实现用户名或邮箱登录
    //这里判断提交上的username是否含有@，来决定查询的字段是哪一个
    var criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
    User.findOne(criteria, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        user.comparePassword(password, function(err, isMatch) {
            if (err) return done(err);
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        });
    });
}));

exports = module.exports = passport;

// NOTE: Need to protect all API calls (other than login/logout) with this check
exports.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        return res.send(401);
    }
};

// Check for admin middleware, this is unrelated to passport.js
// You can delete this if you use different method to check for admins or don't need admins
exports.ensureAdmin = function (req, res, next) {
    return function(req, res, next) {
        console.log(req.user);
        if(req.user && req.user.admin === true)
            next();
        else
            res.send(403);
    }
};

exports.createUUID = function () {
    var charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomToken = '';
    for (var i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
            randomToken += '';
            continue;
        }
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomToken += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomToken;
};

exports.register = function(req, res, next) {
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
};

exports.login = function (req, res, next) {
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
};

exports.logout = function (req, res) {
    req.logout();
    res.send(200);
};

exports.user = function(req, res) {
    var user = req.user;
    var result = {
        username: user.username,
        email: user.email,
        tracks: user.tracks
    };
    return res.send(result);
};