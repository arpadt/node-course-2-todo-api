const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

// need to use schema to add methods to User
let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,    // no email is used more than once
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    // tokens: this is how we can access data from individual users - specified for mongo
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token:{
            type: String,
            required: true
        }
    }]
});

// override toJSON method
UserSchema.methods.toJSON = function() {
    let user = this;
    let userObject = user.toObject();   // taking the mongoose user var and converting into a filtered object

    return _.pick(userObject, ['_id', 'email']);
};

// creating custom methods on User - no arrow function here, because we need "this" for our methods!
UserSchema.methods.generateAuthToken = function() {
    let user = this;
    let access = 'auth';
    let token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    user.tokens.push({access, token});

    // save changes - we'll use it server.js so we need to return it
    return user.save().then( () => {
        return token;
    });
};

// User
let User = mongoose.model('User', UserSchema);

module.exports = {User};