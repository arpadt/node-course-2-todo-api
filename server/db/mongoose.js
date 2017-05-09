const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
let db = {
    localhost: 'mongodb://localhost:27017/TodoApp',
    mlab: 'mongodb://arpadt:gigantic@ds133231.mlab.com:33231/nodetodoapi'
}
// mongoose.connect('mongodb://localhost:27017/TodoApp'); // only for local database
mongoose.connect(process.env.PORT ? db.mlab : db.localhost);

module.exports = {mongoose};