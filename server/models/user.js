const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

// need to use schema to add methods to User
let UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,    // no email is used more than once
        validate: {
            isAsync: false,
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

// creating custom instance methods on User - no arrow function here, because we need "this" for our methods!
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

// .statics - everything created inside turns into a model method instead of an instance method
UserSchema.statics.findByToken = function(token) {
    let User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (e) {
        return Promise.reject();  // this value would be used in the 'e' args in the catch block in server.js
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'x-auth'
    });
};

// mongoose middleware to run before the defined event, here 'save' - need regular function for this binding
UserSchema.pre('save', function(next) {
    let user = this;

    // check if the password was modified, this time we want to encrypt it otherwise leave it
    if (user.isModified('password')) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        // if not modified, move on to the next call
        next();
    }
});

UserSchema.statics.findByCredentials = function(email, password) {
    let User = this;

    return User.findOne({
        'email': email
    }).then( (user) => {
        if (!user) {
            return Promise.reject();
        }

        // bcrypt only support callbacks and not promises, so
        return new Promise( (resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};

// User
let User = mongoose.model('User', UserSchema);

module.exports = {User};