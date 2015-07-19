var mongoose = require('../db/mongodb'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId;

var ReplySchema = new Schema({
    from: {type: ObjectId, ref: 'User'},
    to: {type: ObjectId, ref: 'User'},
    content: String,
    time: {
        type: Date,
        default: Date.now()
    }
},{ _id : false });

var CommentSchema = new Schema({
    from: {type: ObjectId, ref: 'User'},
    reply: [ReplySchema],
    content: String,
    time: {
        type: Date,
        default: Date.now()
    }
});

var Project = {
    _id: 1,
    from: 1,
    reply: 1,
    content: 1,
    time: 1
};

CommentSchema.statics = {
    findAll: function(cb) {
        return this
            .find({},Project)
            .populate('from', 'username')
            .populate('reply.from reply.to', 'username')
            .sort('time')
            .exec(cb);
    },
    findByIdAndPush: function(id, reply, cb) {
        this.findOneAndUpdate({_id: id}, {$push: {reply: reply}}, {new: true})
            .populate('from', 'username')
            .populate('reply.from reply.to', 'username')
            .exec(cb);
    },
    save: function(comment, cb){
        var _this = this;
        comment.save(function(err, result) {
            if (err) {cb(err)}
            _this.findOne(result, Project)
                .populate('from', 'username')
                .exec(cb);

            /*result.populate({
                path: 'from',
                select: 'username'
            },cb);*/
        });
    }
};

// Export Comment model
module.exports = mongoose.model('Comment', CommentSchema);