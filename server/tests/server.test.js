const expect = require('expect');
const request = require('supertest');

//load in files we need for testing
const {app} = require('./../server');
const {Todo} = require('./../models/todo');

// add seed data to test GET - dummy data
const todos = [{
    text: 'First test to do'
}, {
    text: 'Second test to do'
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