const mysql = require('mysql2/promise')

const db = async ()=> {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'H1gh53cur1ty',
        database: 'apt_app'
      });
      return connection;
}
module.exports = { db };