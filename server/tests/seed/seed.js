const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [{
    _id: userOneId,
    email: 'arpad@example.com',
    password: 'userOnePass',
    tokens: [{
        access: 'x-auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'heni@example.com',
    password: 'userTwoPass'
}];

// add seed data to test GET - dummy data
const todos = [{
    _id: new ObjectID(),
    text: 'First test to do'
}, {
    _id: new ObjectID(),
    text: 'Second test to do',
    completed: true,
    completedAt:333
}];

const populateTodos = (done) => {
    Todo.remove({}).then( () => {           // wipe all todos
        return Todo.insertMany(todos);
    }).then( () => done() );  
};

const populateUsers = (done) => {
    User.remove({}).then( () => {
        // insertMany is not going to run the middleware, so password will be stored as is
        // so save and get password hashed --> save()
        let userOne = new User(users[0]).save();
        let userTwo = new User(users[1]).save();

        // wait for all save() to complete
        return Promise.all([userOne, userTwo])
    }).then( () => done());
}

module.exports = {todos, populateTodos, users, populateUsers};