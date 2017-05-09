let env = process.env.NODE_ENV || 'development'; // environment variable, only set in heroku

// setting two different database, one for deveopment, one for test
if (env === 'development') {
    process.env.PORT = 3000;
    process.env.PROD_MONGODB = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
    process.env.PORT = 3000;
    process.env.PROD_MONGODB = 'mongodb://localhost:27017/TodoAppTest';
}