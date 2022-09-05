const config = require('config');
const user = config.get('DB_USER');
const password = config.get('DB_PASSWORD');
const database = config.get('DB_NAME');
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : 'localhost',
    port : 3306,
    user,
    password,
    database,
  }
});

module.exports = { knex };
  