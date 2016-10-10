var mongoose = require('../../db/mongodb'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var ArtistSchema = new Schema({
    _id: Number,
    name: String,
    firstchar: String,
    gender: Number,
    area: Number,
    country: String,
    birth: String,
    avatar_small: String,
    intro: {
        type: String,
        default: ''
    },
    albums_total: {
        type: Number,
        default: 0
    },
    songs_total: {
        type: Number,
        default: 0
    }
},{_id: false});

/*var Project = {
    _id: 1,
    from: 1,
    reply: 1,
    content: 1,
    time: 1
};*/

// Export Artist model
module.exports = mongoose.model('Artist', ArtistSchema);
module.exports.ObjectId = mongoose.Types.ObjectId;