const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

//load in files we need for testing
const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        let mockText = 'test todo text';

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect( (res) => {
                expect(res.body.todos.length).toBe(1);  // this is the number of todos with the logged in user's id
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)      // grabbing the id of the first mock doc, converted toa string
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect( (res) => {
                expect(res.body.todo.text).toBe(todos[0].text); // we set up the todo poperty in server.js  
            })
            .end(done);
    });

    it('should not return todo doc created by other user', (done) => {
        request(app)
            .get(`/todos/${todos[1]._id.toHexString()}`)      // grabbing the id of the first mock doc, converted toa string
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        let mockID = new ObjectID();
        request(app)
            .get(`/todos/${mockID.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids', (done) => {
        let badID = '123';
        request(app)
            .get(`/todos/${badID}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        let hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            // authenticate as the second user
            .set('x-auth', users[1].tokens[0].token)
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

    it('should not remove a todo if not authenticated', (done) => {
        // log in with the first user's id and try to delete the todo for the second user
        let hexId = todos[0]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            // authenticate as the second user
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end( (err, res) => {
                if (err) {
                    return done(err);
                }

                // query database using findById - should get nothing back
                Todo.findById(hexId).then( (todo) => {
                    expect(todo).toExist();
                    done();
                }).catch( (e) => done(e));
            });
    });

    it('should return 404 if todo not found', (done) => {
        let mockID = new ObjectID();
        request(app)
            .delete(`/todos/${mockID.toHexString()}`)
            .set('x-auth', users[1].tokens[0].token)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id is invalid', (done) => {
        let badID = '123';
        request(app)
            .delete(`/todos/${badID}`)
            .set('x-auth', users[1].tokens[0].token)
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
            .set('x-auth', users[0].tokens[0].token)
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

    it('should not update todo created by other user', (done) => {
        let hexId = todos[0]._id.toHexString();
        let originalText = todos[0].text;
        let mockText = 'First text modified';
        // update text, set completed true
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                text: mockText,
                completed: true
            })
            .expect(404)
            .end(done);
    });

    // reverse
    it('should clear completedAt when todo is not completed', (done) => {
        let hexId = todos[1]._id.toHexString();
        let originalText = todos[1].text;
        let mockText = 'Second test modified';

        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
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

describe('GET /users/me', () => {
    // when we have a valid token
    it('should return user if autheticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)  
            .expect(200)
            .expect( (res) => {
                // provided a valid token we get valid data back
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    // when we have an invalid token
    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect( (res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /users', () => {
    // when passing valid email
    it('should create a user', (done) => {
        let email = 'example@example.com';
        let password = '123mnb!';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect( (res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            // querying the database after posting new data
            .end( (err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then( (user) => {
                    // assertions about the database
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);    // because it's getting hashed, so it should not be the same
                    done();
                }).catch( (e) => done(e));
            });
    });

    // when fields are invalid
    it('should validation errors if request invalid', (done) => {
        request(app)
            .post('/users')
            .send({email: 'hello', password: '456'})
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        request(app)
            .post('/users')
            .send({email: users[0].email, password: 'password123!'})
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: users[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                
                User.findById(users[1]._id).then( (user) => {
                    // expect that the user has a tokens array
                    expect(user.tokens[1]).toInclude({
                        access: 'x-auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch( (e) => done(e));
            });
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: users[1].email,
                password: '123qwe'
            })
            .expect(400)
            .expect( (res) => {
                expect(res.headers['x-auth']).toNotExist();
            })
            .end( (err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[1]._id).then( (user) => {
                    expect(user.tokens.length).toBe(1);
                    done();
                }).catch( (e) => done(e));
            });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on log out', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            // .expect( (res) => {
            //     expect(res.headers['x-auth']).toExist();
            // })
            .end( (err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(users[0]._id).then( (user) => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch( (e) => done(e));
            });
    });
});