var User = require('../models/user'),
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