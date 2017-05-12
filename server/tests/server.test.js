const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

//load in files we need for testing
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

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

beforeEach( (done) => {
    Todo.remove({}).then( () => {           // wipe all todos
        return Todo.insertMany(todos);
    }).then( () => done() );  
});

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        let mockText = 'test todo text';

        request(app)
            .post('/todos')
            .send({text: mockText})
            .expect(200)
            .expect( (res) => {
                expect(res.body.text).toBe(mockText);
            })
            .end( (err, res) => {   // check what got stored in mongo
                if (err) {
                    return done(err);
                }

                // 1st technique: find only todos that have the mockText value
                Todo.find({text: mockText}).then( (todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(mockText);
                    done();
                }).catch( (e) => done(e) );
            });

    });

    it('should not create todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end( (err, res) => {
                if (err) {
                    return done(err);
                }

                // 2nd technique: Increase numbers by 2 (number of mock todos)
                Todo.find().then( (todos) => {
                    expect(todos.length).toBe(2);   // this is how many data are in the dummy array
                    done();
                }).catch( (e) => done(e) );
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect( (res) => {
                expect(res.body.todos.length).toBe(2);  // number of docs in the dummy array
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)      // grabbing the id of the first mock doc, converted toa string
            .expect(200)
            .expect( (res) => {
                expect(res.body.todo.text).toBe(todos[0].text); // we set up the todo poperty in server.js  
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        let mockID = new ObjectID();
        request(app)
            .get(`/todos/${mockID.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        let badID = '123';
        request(app)
            .get(`/todos/${badID}`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        let hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect( (res) => {
                expect(res.body.todo._id).toBe(hexId);
            })
            .end( (err, res) => {
                if (err) {
                    return done(err);
                }

                // query database using findById - should get nothing back
                Todo.findById(hexId).then( (todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch( (e) => done(e));
            });
    });

    it('should return 404 if todo not found', (done) => {
        let mockID = new ObjectID();
        request(app)
            .delete(`/todos/${mockID.toHexString()}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        let badID = '123';
        request(app)
            .delete(`/todos/${badID}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    // add completed and completedAt properties
    it('should update the todo', (done) => {
        let hexId = todos[0]._id.toHexString();
        let originalText = todos[0].text;
        let mockText = 'First text modified';
        // update text, set completed true
        request(app)
            .patch(`/todos/${hexId}`)
            .send({
                text: mockText,
                completed: true
            })
            .expect(200)
            .expect( (res) => {
                expect(res.body.todo._id).toBe(hexId);
                expect(res.body.todo.text).toBe(mockText);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end( (err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then( (todo) => {
                    expect(res.body.todo.text).toNotEqual(originalText);
                    done();
                }).catch( (e) => done(e));
            });

    });

    // reverse
    it('should clear completedAt when todo is not completed', (done) => {
        let hexId = todos[1]._id.toHexString();
        let originalText = todos[1].text;
        let mockText = 'Second test modified';

        request(app)
            .patch(`/todos/${hexId}`)
            .send({text: mockText, completed: false})
            .expect(200)
            .expect( (res) => {
                expect(res.body.todo._id).toBe(hexId);
                expect(res.body.todo.text).toBe(mockText);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end( (err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexId).then( (todo) => {
                    expect(res.body.todo.text).toNotEqual(originalText);
                    expect(res.body.todo.completed).toNotEqual(todos[1].completed);
                    done();
                }).catch( (e) => done(e));
            });
    });
});
