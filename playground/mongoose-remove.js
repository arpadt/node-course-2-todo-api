const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({})
// Todo.remove({}).then( (results) => {
//     console.log(results);
// });

// Todo.findOneAndRemove()
// Todo.findByIdAndRemove()

Todo.findByIdAndRemove({_id: '5911b588f506c9dffbfcce47'}).then( (todo) => {

});

Todo.findByIdAndRemove('5911b588f506c9dffbfcce47').then( (todo) => {
    console.log(todo);
});