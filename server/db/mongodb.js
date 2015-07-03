// DB Connection
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mp3player');
module.exports = mongoose;