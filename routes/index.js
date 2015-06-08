var express = require("express");
var config = require("./config");
var router = express.Router();

router.get('/', function(req, res){
    var fs = require("fs");
    fs.readdir(config.mediaPath, function(err, files){
        if(err){
            console.log(err);
        }else{
            res.render('index', {title: config.appName, music: files});
        }
    });
});

module.exports = router;