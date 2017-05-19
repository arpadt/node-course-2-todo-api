let env = process.env.NODE_ENV || 'development'; // environment variable, only set in heroku

if (env === 'development' || env === 'test') {
    let config = require('./config.json');
    let envConfig = config[env];

    Object.keys(envConfig).forEach( (key) => {
        process.env[key] = envConfig[key];
    });

}
