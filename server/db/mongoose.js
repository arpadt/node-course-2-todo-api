const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// let db = {
//     localhost: 'mongodb://localhost:27017/TodoApp',
//     mlab: 'mongodb://arpadt:gigantic@ds133231.mlab.com:33231/nodetodoapi'
// }
// mongoose.connect('mongodb://localhost:27017/TodoApp'); // only for local database

// PROD_MONGODB is a var created by heroku when connecting itto mlab
mongoose.connect(process.env.PROD_MONGODB || 'mongodb://localhost:27017/TodoApp');

module.exports = {mongoose};