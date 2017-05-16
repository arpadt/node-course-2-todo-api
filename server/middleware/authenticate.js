let {User} = require('./../models/user');

let authenticate = (req, res, next) => {
    let token = req.header('x-auth'); // getting the value

    User.findByToken(token).then( (user) => {
        if (!user) {
            return Promise.reject(); // the func stops and jumps to catch
        }

        // modify the request object
        req.user = user;
        req.token = token;
        next();
    }).catch( (e) => {
        res.status(401).send();
    });
};

module.exports = {authenticate};