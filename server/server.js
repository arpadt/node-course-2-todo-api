require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');
let {authenticate} = require('./middleware/authenticate');

let app = express();
const port = process.env.PORT;  // for Heroku

// this is the MW we need to give to express - returns a func with json
app.use(bodyParser.json());

// create new todo
app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    });

    todo.save().then( (doc) => {
        res.send(doc);      // send response back to user
    }, (e) => {
        res.status(400).send(e);
    });
});

// getting all todos
app.get('/todos', (req, res) => {
    Todo.find().then( (todos) => {
        res.send({todos});  // this way - as an object - we can add properties later on
    }, (e) => {
        res.status(400).send(e);
    });
});

// GET /todos/:id
app.get('/todos/:id', (req, res) => {
    // req.params is an object- key:id, value: whatever the id is
    let id = req.params.id;
    // validation
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid id');
    }

    Todo.findById(id).then( (todo) => {
        // success - valid id
            // if todo not found
            if (!todo) {
                return res.status(404).send('Todo not found');
            }
            // if todo found
            res.send({todo});   // we set up a todo property of this object
    }).catch( (e) => res.status(500).send('Server error')); // error, could be status 400
});

// DELETE route
app.delete('/todos/:id', (req, res) => {
    let id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid id');
    }

    Todo.findByIdAndRemove(id).then( (todo) => {
        if (!todo) {
            return res.status(404).send('Todo not found');
        }
        res.status(200).send({todo});
    }).catch( (e) => res.status(400).send());
});

// UPDATE todo route
app.patch('/todos/:id', (req, res) => {
    let id = req.params.id;
    // here comes what user passed to us
    let body = _.pick(req.body, ['text', 'completed']);  // properties we want to pull off and want the user to update

    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid id');
    }

    // check if the completed property is on body and is a boolean && if this boolean is true
    if (_.isBoolean(body.completed) && body.completed) {
        // if the user updated the completed property, we update completedAt to the current timestamp
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;    // remove this property from database
    } 

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then( (todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }).catch( (e) => res.status(400).send());
});

// POST /users - sign up
// pick email and pw
app.post('/users', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);
    let user = new User(body);  // no need to recreate the object because it already exists in body

    user.save().then( () => {
        return user.generateAuthToken();
    }).then( (token) => {
        // creating a custom header with x-
        res.header('x-auth', token).send(user); // toJSON is called here with res.send()
    }).catch( (e) => res.status(400).send(e));
});

// POST /users/login {email, password}
app.post('/users/login', (req, res) => {
    let body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then( user => {
        return user.generateAuthToken()
            .then( (token) => {
                res.header('x-auth', token).send(user);
        });
    }).catch( e => {
        res.status(400).send();
    });
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

// private route
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

module.exports = {app};