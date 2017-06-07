let {User} = require('./../models/user');

let authenticate = async (req, res, next) => {
    let token = req.header('x-auth'); // getting the value

    try {
        const user = await User.findByToken(token);

        if (!user) {
            throw new Error();
        }

        req.user = user;
        req.token = token;
        next();
    } catch (e) {
        res.status(401).send();
    }

    // User.findByToken(token).then( (user) => {
    //     if (!user) {
    //         return Promise.reject(); // the func stops and jumps to catch
    //     }

    //     // modify the request object
    //     req.user = user;
    //     req.token = token;
    //     next();
    // }).catch( (e) => {
    //     res.status(401).send();
    // });
};

module.exports = {authenticate};