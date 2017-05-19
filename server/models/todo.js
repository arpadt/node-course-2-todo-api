const mongoose = require('mongoose');

// specify the type of the entries in the document
let Todo = mongoose.model('Todo', {
    text: {
        type: String,
        required : true, // validation
        minlength: 1,
        trim: true  // removes any trailing or leading white space
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    // associate todo with the user
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    }
});

module.exports = {Todo};