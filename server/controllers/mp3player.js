var request = require('request');

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