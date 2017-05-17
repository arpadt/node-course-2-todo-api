const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

let password = '123abc!';

// salt it - params: 1) number of rounds to run
bcrypt.genSalt(10, (err, salt) => {
    // hash it
    bcrypt.hash(password, salt, (err, hash) => {
        console.log(hash);
    });
});

// compare if the password is correct
// let hashedPassword = '$2a$10$58Me2LmG17LlsPvhJAgzUetupA3WxO4WTlzhdNw79/EWmO2wSE7GK';

// bcrypt.compare(password, hashedPassword, (err, res) => {
//     console.log(res);
// });

// let data = {
//     id: 10
// };

// we send these data back to the user
// let token = jwt.sign(data, '123abc');   // @params: object, secret
// console.log(token);

// let decoded = jwt.verify(token, '123abc');
// console.log('decoded', decoded);


// let message = 'I am user Number 3';
// let hash = SHA256(message).toString();

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// let data = {
//     id: 4   // equal to the user's id in the user collection
// };

// let token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }

// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

// let resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();

// if (resultHash === token.hash) {
//     console.log('Data was not changed');
// } else {
//     console.log('Data was changed. Do not trust');
// }