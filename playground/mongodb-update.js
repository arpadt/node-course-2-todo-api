const {MongoClient, ObjectID} = require('mongodb'); // object destructuring - this will connect to the database

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    console.log('Connected to MongoDB server');

    // db.collection('Todos').findOneAndUpdate({
    //     _id: new ObjectID('590e13b84aef601ff38ddd46')
    // }, {
    //     $set: {                         // have to use update operators!
    //         completed: true
    //     }
    // }, {
    //     returnOriginal: false
    // }).then( (result) => console.log(result));

    db.collection('Users').findOneAndUpdate({
        _id: new ObjectID('590d4ffa7a7ea927a82e763f')
    }, {
        $set: {name: 'Arpad'},
        $inc: {age: 1}
    }, {
        returnOriginal: false
    }).then( (result) => console.log(JSON.stringify(result, undefined, 2)));

    // db.close();
});