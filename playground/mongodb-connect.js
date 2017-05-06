// const MongoClient = require('mongodb').MongoClient; // this will connect to the database
// same as
const {MongoClient, ObjectID} = require('mongodb'); // object destructuring - this will connect to the database

// let user = {name: 'Arpad', age: 25};
// let {name} = user;  // object destructuring - make new variables from object properties
// console.log(name);

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    // add data to db
    // @params:1 - object we want to store; 2 - cb func to run 
    // db.collection('Todos').insertOne({
    //     text: 'Somethig to do',
    //     completed: false
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Unable to insert todo', err);
    //     }

    //     console.log(JSON.stringify(result.ops, undefined, 2));
    // });

    // Insert new doc into Users (name, age, location)
    // db.collection('Users').insertOne({
    //     name: 'Arpad',
    //     age: 41,
    //     location: 'Perth'
    // }, (err, result) => {
    //     if (err) {
    //         return console.log('Unable to insert user', err);
    //     }

    //     console.log(result.ops[0]._id.getTimestamp());
    // });

    db.close();
});