var mongoose = require('../../db/mongodb'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var AlbumSchema = new Schema({
    albumId: Number,
    albumName: String,
    albumPicSmall: String,
    artistId: Number,
    artistName: String,
    songIdList: []
},{ _id : false });

var Project = {
    _id: 1,
    from: 1,
    reply: 1,
    content: 1,
    time: 1
};

// Export Album model
module.exports = mongoose.model('Album', AlbumSchema);