var bcrypt = require('bcrypt-nodejs'),
    mongoose = require('../db/mongodb'),
    Schema = mongoose.Schema,
    BCRYPT_WORK_FACTOR = 10;

var TrackSchema = new Schema({
    url: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    artist: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    album: {
        type: String,
        required: true
    },
    lrc: {
        type: String,
        default : ''
    }
});

// User schema
var UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        required: false,
        default: false
    },
    twitter: {
        type: String,
        required: false
    },
    facebook: {
        type: String,
        required: false
    },
    tracks: [TrackSchema]
});

// Bcrypt middleware
UserSchema.pre('save', function (next) {
    var user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(BCRYPT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);

        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

// Password verification
UserSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// Export user model
var User = mongoose.model('User', UserSchema);
module.exports = User;