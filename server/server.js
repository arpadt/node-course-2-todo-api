const express = require('express');
const bodyParser = require('body-parser');

let {mongoose} = require('./db/mongoose');
let {Todo} = require('./models/todo');
let {User} = require('./models/user');

// let newUser = new User({
//     email: 'arpad@example.com'
// });

// newUser.save().then( (doc) => {
//     console.log(JSON.stringify(doc, undefined, 2));
// }, (e) => {
//     console.log('Unable to save data', e);
// });

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

app.listen(3000, () => {
    console.log('Started on port 3000');
});

module.exports = {app};