const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost:27017/TodoApp'); // only for local database
mongoose.connect('mongodb://arpadt:gigantic@ds133231.mlab.com:33231/nodetodoapi');

module.exports = {mongoose};