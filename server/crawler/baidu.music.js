var request = require('request'),
    cheerio = require('cheerio'),
    async = require('async'),
    Artist = require('../models/music/artist');

var crawlers = [];
var artistAPI = {
    crawler: 'http://music.baidu.com/artist',
    base: 'http://tingapi.ting.baidu.com/v1/restserver/ting?from=webapp_music&method=baidu.ting.artist.getinfo'
};

var q = async.queue(function(task, next) {
    request.get(task.url, function (err, res, data) {
        data = JSON.parse(data);
        if(data.artist_id === undefined){
            console.log('url', task.url);
            return next();
        }
        Artist.findById(data.artist_id, function(err, artist){
            if(!artist) {
                Artist.create({
                    _id: data.artist_id,
                    name: data.name,
                    firstchar: data.firstchar,
                    gender: data.gender,
                    area: data.area,
                    country: data.country,
                    birth: data.birth,
                    avatar_small: data.avatar_small,
                    intro: data.intro,
                    albums_total: data.albums_total,
                    songs_total: data.songs_total
                }, function (err, artist) {
                    if(err) console.log('err:' + err);
                    console.log(artist._id, artist.name);
                    return next();
                });
            }else{
                console.log('skip', data.artist_id, data.name);
                return next();
            }
        });
    });
}, 3);

q.drain = function() {
    console.log('all crawler tasks have been processed');
};

crawlers.push(artistAPI);

function start() {
    crawlers.forEach(function (api) {
        request.get(api.crawler, function (err, res, body) {
            var $ = cheerio.load(body),
                items = [];

            $('ul.container > li', 'div.main-body')
                .slice(1)
                .find('ul > li > a')
                .each(function (i, elem) {
                    var href = $(this).attr('href'),
                        artist_id = href.substring(href.lastIndexOf('/') + 1);

                    items.push({
                        url: api.base + '&tinguid=' + artist_id
                    });
                });
            //items = items.splice(800);
            q.push(items, function(err){
                if(err) console.log(err);
            });
        });
    });
}

start();