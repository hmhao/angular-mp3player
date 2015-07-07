var request = require('request'),
    User = require('../models/user');

exports.lrc = function ($req, $res) {
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
};

exports.media = function ($req, $res, next) {
    var url = $req.query.url || '';
    if (url) {
        request.get(url).pipe($res);
    } else {
        $res.sendStatus(404);
    }
};

exports.upload = function(req, res) {
    if(req.files && !req.files.upload.truncated){
        res.json({ message: 'Uploaded success!'});
    }else{
        res.json({ message: 'Uploaded failed!'});
    }
};

exports.save = function(req, res, next) {
    var query = {'_id':req.user._id},
        id = req.body.id,
        update;
    if(id){
        update = {'$pull':{'tracks': {'_id':id}}};
        User.update(query, update, function(err){
            if(err){next(err);}
            res.json({status:200});
        });
    }else{
        var tarck = {
            url: req.body.url,
            title: req.body.title,
            artist: req.body.artist,
            genre: req.body.genre,
            album: req.body.album,
            lrc: req.body.lrc
        };
        update = {'$push': {'tracks': tarck}};
        User.findOneAndUpdate(query, update, {new: true}, function (err, user){
            if(err) next(err);
            var track = user.tracks[user.tracks.length-1];
            res.json({status:200, id:track._id});
        });
    }
};