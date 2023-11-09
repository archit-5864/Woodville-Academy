// let mysql = require('mysql');
// let connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'Teacher'
// });
// connection.connect(function(err) {
//     if (err) {
//       return console.error('error: ' + err.message);
//     }
//     console.log('Connected to the MySQL server.');
//   });
//   module.exports = connection;

const mysql2 = require('mysql2/promise');
const pool = mysql2.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Teacher',
});
pool.getConnection()
  .then(connection => {
    console.log('Connected to the MySQL server');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the MySQL server:', err);
  });
module.exports = pool;


