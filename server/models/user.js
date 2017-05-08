const mongoose = require('mongoose');

// User
// email  - require - trim - set type - set min length of 1
let User = mongoose.model('User', {
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    }
});

module.exports = {User};