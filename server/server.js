const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');

let app = express();

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

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};