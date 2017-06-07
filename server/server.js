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
app.post('/todos', authenticate, async (req, res) => {
    const todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    try {
        const doc = await todo.save();
        res.send(doc);
    } catch (e) {
        res.status(400).send(e);
    }
    

    // todo.save().then( (doc) => {
    //     res.send(doc);      // send response back to user
    // }, (e) => {
    //     res.status(400).send(e);
    // });
});

// getting all todos
app.get('/todos', authenticate, async (req, res) => {
    try {
        const todos = await Todo.find({_creator: req.user._id});
        res.send({todos});
    } catch (e) {
        res.status(400).send(e);
    }

    // Todo.find({
    //     // only return todos that the user who logged in created
    //     _creator: req.user._id
    // }).then( (todos) => {
    //     res.send({todos});  // this way - as an object - we can add properties later on
    // }, (e) => {
    //     res.status(400).send(e);
    // });
});

// GET /todos/:id
app.get('/todos/:id', authenticate, async (req, res) => {
    // req.params is an object- key:id, value: whatever the id is
    let id = req.params.id;
    // validation
    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid id');
    }

    try {
        const todo = await Todo.findOne({
                        _id: id,
                        _creator: req.user._id
                    });
        
        if (!todo) {
            return res.status(404).send('Todo not found');
        }
        
        res.send({todo});
    } catch (e) {
        res.status(500).send('Server error');
    }

    // Todo.findOne({
    //     _id: id,
    //     _creator: req.user._id
    // }).then( (todo) => {
    //     // success - valid id
    //         // if todo not found
    //         if (!todo) {
    //             return res.status(404).send('Todo not found');
    //         }
    //         // if todo found
    //         res.send({todo});   // we set up a todo property of this object
    // }).catch( (e) => res.status(500).send('Server error')); // error, could be status 400
});

// DELETE route
app.delete('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send('Invalid id');
    }
    
    try {
        const todo = await Todo.findOneAndRemove({
                                    _id: id,
                                    _creator: req.user._id
                                });
        
        if (!todo) {
            return res.status(404).send('Todo not found');
        }
        res.status(200).send({todo});
    } catch (e) {
        res.status(400).send();
    }

    // Todo.findOneAndRemove({
    //     _id: id,
    //     _creator: req.user._id
    // }).then( (todo) => {
    //     if (!todo) {
    //         return res.status(404).send('Todo not found');
    //     }
    //     res.status(200).send({todo});
    // }).catch( (e) => res.status(400).send());
});

// UPDATE todo route
app.patch('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id;
    // here comes what user passed to us
    const body = _.pick(req.body, ['text', 'completed']);  // properties we want to pull off and want the user to update

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

    try {
        const todo = await Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true});
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    } catch (e) {
        res.status(400).send();
    }

    // Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then( (todo) => {
    //     if (!todo) {
    //         return res.status(404).send();
    //     }
    //     res.send({todo});
    // }).catch( (e) => res.status(400).send());
});

// POST /users - sign up
// pick email and pw
app.post('/users', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = new User(body);  // no need to recreate the object because it already exists in body
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send(e);
    }
        

    // user.save().then( () => {
    //     return user.generateAuthToken();
    // }).then( (token) => {
    //     // creating a custom header with x-
    //     res.header('x-auth', token).send(user); // toJSON is called here with res.send()
    // }).catch( (e) => res.status(400).send(e));
});

// POST /users/login {email, password}
app.post('/users/login', async (req, res) => {
    try {
        const body = _.pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(body.email, body.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send();
    }
    
    // same as

    // User.findByCredentials(body.email, body.password).then( user => {
    //     return user.generateAuthToken()
    //         .then( (token) => {
    //             res.header('x-auth', token).send(user);
    //     });
    // }).catch( e => {
    //     res.status(400).send();
    // });
});

// POST log out
app.delete('/users/me/token', authenticate, async (req, res) => {
  // no need for a value here, so no const =, simply just await
  try {
    await req.user.removeToken(req.token);
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

app.listen(port, () => {
    console.log(`Started on port ${port}`);
});

// private route
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

module.exports = {app};