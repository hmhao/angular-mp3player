var mongoose = require('../db/mongodb'),
    Schema = mongoose.Schema;

var AnalyticsCountSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    data: {
        type: Object,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    uid: String
});

AnalyticsCountSchema.statics.findHotArtist = function(cb){
    return this.aggregate(
        { $match: { type: 'PlaySearch' }},
        { $group: { _id: '$data.artist', count: {$sum: 1} }},
        { $project: { _id: 0 , artist: '$_id', count: '$count' }},
        { $sort: { count: -1}},
        { $limit: 10},
        cb);
};
/*音乐总量排行*/
AnalyticsCountSchema.statics.findHotSong = function(cb){
    return this.aggregate(
        { $match: { type: 'PlaySearch' }},
        { $group: { _id: {song:'$data.song', artist:'$data.artist'}, total: {$sum: 1} }},
        { $project: { _id: 0 , artist: '$_id.artist', song: '$_id.song', total: '$total' }},
        { $sort: { total: -1}},
        { $limit: 10},
        cb);
};
/*音乐总量排行及日升降幅度*/
AnalyticsCountSchema.statics.findHotSongRateByDate = function(cb){
    var time = new Date(),
        year = time.getFullYear(),
        month = time.getMonth(),
        date = time.getDate(),
        yesterday = new Date(year, month, (date-1)),
        today = new Date(year, month, (date)),
        tomorrow = new Date(year, month, (date+1));

    return this.aggregate(
        { $match: { type: 'PlaySearch' }},
        { $group: {
            _id: {song:'$data.song', artist:'$data.artist'},
            total: {$sum: 1},
            yesterday: {
                $sum: {
                    $cond: {
                        if: { $and: [
                            {$gt: ['$date', yesterday]},
                            {$lt: ['$date', today]}
                        ]},
                        then: 1,
                        else: 0
                    }
                }
            },
            today: {
                $sum: {
                    $cond: [
                        { $and: [
                            {$gt: ['$date', today]},
                            {$lt: ['$date', tomorrow]}
                        ]},
                        1,
                        0
                    ]
                }
            }
        }},
        { $project: { _id: 0 , artist: '$_id.artist', song: '$_id.song', total: '$total', rate: {$subtract:['$today','$yesterday']} }},
        { $sort: { total: -1}},
        { $limit: 10},
        cb);
};

/*音乐总量排行及周升降幅度*/
AnalyticsCountSchema.statics.findHotSongRateByWeek = function(cb){
    var time = new Date(),
        year = time.getFullYear(),
        month = time.getMonth(),
        date = time.getDate(),
        dayOfWeek = (time.getDay() == 0) ? 7 : time.getDay()  - 1,
        lastweekStart = new Date(year, month, date - dayOfWeek - 7),
        thisweekStart = new Date(year, month, date - dayOfWeek),
        thisweekEnd = new Date(year, month, date - dayOfWeek + 7);
    console.log(month, dayOfWeek, lastweekStart, thisweekStart, thisweekEnd);
    return this.aggregate(
        { $match: { type: 'PlaySearch' }},
        { $group: {
            _id: {song:'$data.song', artist:'$data.artist'},
            total: {$sum: 1},
            lastweek: {
                $sum: {
                    $cond: {
                        if: { $and: [
                            {$gt: ['$date', lastweekStart]},
                            {$lt: ['$date', thisweekStart]}
                        ]},
                        then: 1,
                        else: 0
                    }
                }
            },
            thisweek: {
                $sum: {
                    $cond: [
                        { $and: [
                            {$gt: ['$date', thisweekStart]},
                            {$lt: ['$date', thisweekEnd]}
                        ]},
                        1,
                        0
                    ]
                }
            }
        }},
        { $project: { _id: 0 , artist: '$_id.artist', song: '$_id.song',
                        total: '$total', rate: {$subtract:['$thisweek','$lastweek']} }},
        { $sort: { total: -1}},
        { $limit: 10},
        cb);
};

/*音乐总量排行及月升降幅度*/
AnalyticsCountSchema.statics.findHotSongRateByMonth = function(cb){
    var time = new Date(),
        year = time.getFullYear(),
        month = time.getMonth(),
        lastMonthStart = new Date(year, month - 1, 1),
        thisMonthStart = new Date(year, month, 1),
        thisMonthEnd = new Date(year, month + 1, 1);
    console.log(month, lastMonthStart, thisMonthStart, thisMonthEnd);
    return this.aggregate(
        { $match: { type: 'PlaySearch' }},
        { $group: {
            _id: {song:'$data.song', artist:'$data.artist'},
            total: {$sum: 1},
            lastmonth: {
                $sum: {
                    $cond: {
                        if: { $and: [
                            {$gt: ['$date', lastMonthStart]},
                            {$lt: ['$date', thisMonthStart]}
                        ]},
                        then: 1,
                        else: 0
                    }
                }
            },
            thismonth: {
                $sum: {
                    $cond: [
                        { $and: [
                            {$gt: ['$date', thisMonthStart]},
                            {$lt: ['$date', thisMonthEnd]}
                        ]},
                        1,
                        0
                    ]
                }
            }
        }},
        { $project: { _id: 0 , artist: '$_id.artist', song: '$_id.song',
            total: '$total', rate: {$subtract:['$thismonth','$lastmonth']} }},
        { $sort: { total: -1}},
        { $limit: 10},
        cb);
};

/*音乐总量排行及季升降幅度*/
AnalyticsCountSchema.statics.findHotSongRateByQuarter = function(cb){
    var time = new Date(),
        year = time.getFullYear(),
        month = time.getMonth(),
        quarterStartMonth = month < 3 ? 1 : (month < 6 ? 3 : (month < 9 ? 6 : 9)),
        lastQuarterStart = new Date(year, quarterStartMonth - 3, 1),
        thisQuarterStart = new Date(year, quarterStartMonth, 1),
        thisQuarterEnd = new Date(year, quarterStartMonth + 3, 1);
    console.log(month,quarterStartMonth, lastQuarterStart, thisQuarterStart, thisQuarterEnd);
    return this.aggregate(
        { $match: { type: 'PlaySearch' }},
        { $group: {
            _id: {song:'$data.song', artist:'$data.artist'},
            total: {$sum: 1},
            lastquarter: {
                $sum: {
                    $cond: {
                        if: { $and: [
                            {$gt: ['$date', lastQuarterStart]},
                            {$lt: ['$date', thisQuarterStart]}
                        ]},
                        then: 1,
                        else: 0
                    }
                }
            },
            thisquarter: {
                $sum: {
                    $cond: [
                        { $and: [
                            {$gt: ['$date', thisQuarterStart]},
                            {$lt: ['$date', thisQuarterEnd]}
                        ]},
                        1,
                        0
                    ]
                }
            }
        }},
        { $project: { _id: 0 , artist: '$_id.artist', song: '$_id.song',
            total: '$total', rate: {$subtract:['$thisquarter','$lastquarter']} }},
        { $sort: { total: -1}},
        { $limit: 10},
        cb);
};
// Export AnalyticsCount model
module.exports = mongoose.model('AnalyticsCount', AnalyticsCountSchema);