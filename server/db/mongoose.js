const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/TodoApp'); // only for local database
mongoose.connect('mongodb://arpadt:cUsR5Lkk8h@ds133231.mlab.com:33231/nodetodoapi' || 'mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};