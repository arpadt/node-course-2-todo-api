const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// let id = '5910c386aef8ae2bb82356a811';

// id validation - returns true if the id is valid
// if (!ObjectID.isValid(id)) {
//     console.log('ID not valid');
// }

// find all docs
// Todo.find({
//     _id: id     // mongoose converts it to an objectID, so no need for new ObjectID()
// }).then( (todos) => {
//     console.log('Todos', todos);    // returns an array
// });

// // find one matching item
// Todo.findOne({
//     _id: id     // mongoose converts it to an objectID, so no need for new ObjectID()
// }).then( (todo) => {
//     console.log('Todo', todo);  // returns an object
// });

// handle 3 cases: 1) id nout exists; 2) id found; 3) invalid id

// Todo.findById(id).then( (todo) => {
//     if (!todo) {
//         return console.log('Id not found');
//     }
//     console.log('Todo by Id', todo);  // returns an object
// }).catch( (e) => console.log(e));

User.findById('59106470222f4c16b4f8b2a4').then( (user) => {
    if (!user) {
        return console.log('User not found');
    }
    console.log('User by Id', JSON.stringify(user, undefined, 2));
}).catch( (e) => console.log(e));
