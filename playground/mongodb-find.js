const {MongoClient, ObjectID} = require('mongodb'); // object destructuring - this will connect to the database

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    // db.collection('Todos').find({
    //     _id: new ObjectID('590dc4e3ef8d52a77cc7988a')
    // }).toArray().then( (docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    // db.collection('Todos').find().count().then( (count) => {
    //     console.log(`Todos count: ${count}`);
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    db.collection('Users').find({
        name: 'Arpad'
    }).toArray().then( (docs) => {
        console.log('Users');
        console.log(JSON.stringify(docs, undefined, 2));
    }).catch( (err) => console.log('Unable to fetch data', err));

    // db.collection('Users').find({
    //     name: 'Arpad'
    // }).count().then( (count) => {
    //     console.log(`Users count: ${count}`);
    // }).catch( (err) => console.log('Unable to fetch data', err));

    db.collection('Users').find({
        name: 'Arpad'
    }).count().then( (countArpad) => {
        console.log(`Arpad count: ${countArpad}`);
        return db.collection('Users').find({
            name: 'Jen'
        }).count();
    }).then( (countJen) => console.log(`Jen count: ${countJen}`))
    .catch( (err) => console.log('Unable to fetch data', err));

    // db.close();
});