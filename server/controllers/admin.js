var User = require('../models/user'),
    AnalyticsCount = require('../models/count'),
    Comment = require('../models/comment'),
    passport = require('./user');

exports.login = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) {
            return res.send(401, { success: false, message: info.message });
        }
        if(!user.admin){
            return res.send(401, { success: false, message: 'admin require!' });
        }
        // if user, Log in
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            return res.send(200, { success: true, message: '' });
        });
    })(req, res, next);
};

exports.userlist = function(req, res, next) {
    var criteria = {admin: false},
        fields = {
            _id: 0,
            username: 1,
            email: 1
        };
    User.find(criteria, fields, function(err, user) {
        if (err) { return next(err); }
        var result = [];
        if (user) {
            result = result.concat(user);
        }
        res.json(result);
    });
};

exports.hotartist = function(req, res, next) {
    AnalyticsCount.findHotArtist(function(err, result) {
        if (err) { return next(err); }
        if(!result){ result = [] }
        res.json(result);
    });
};
exports.hotartist_rate_date = function(req, res, next) {
    AnalyticsCount.findHotArtistRateByDate(function(err, result) {
        if (err) { return next(err); }
        if(!result){ result = [] }
        res.json(result);
    });
};

exports.hotsong = function(req, res, next) {
    AnalyticsCount.findHotSong(function(err, result) {
        if (err) { return next(err); }
        if(!result){ result = [] }
        res.json(result);
    });
};
exports.hotsong_rate_date = function(req, res, next) {
    AnalyticsCount.findHotSongRateByDate(function(err, result) {
        if (err) { return next(err); }
        if(!result){ result = [] }
        res.json(result);
    });
};


exports.get_comment = function(req, res, next) {
    Comment.findAll(function(err, result) {
        if (err) {next(err)}
        res.json(result);
    });
};
exports.post_comment = function(req, res, next) {
    var comment = req.body.comment;
    if (comment.cid) {
        var reply = {
            from: comment.tid,
            to: req.user._id,
            content: comment.content
        };
        Comment.findByIdAndPush(comment.cid, reply, function(err, result) {
            if (err) {next(err)}
            res.json(result);
        });
    }else {
        comment.from = req.user._id;
        Comment.save(new Comment(comment), function(err, result) {
            if (err) {next(err)}
            res.json(result);
        });
    }
};