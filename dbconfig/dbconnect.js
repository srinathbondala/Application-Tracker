// require('dotenv').config();
// const mysql = require('mysql2');

// const conn = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE
// });

// conn.connect((err) => {
//     if (err) {
//         console.log('Database connection error: ', err);
//     } else {
//         console.log('Database connected successfully!');
//     }
// });

// module.exports = conn;

// require('dotenv').config();
// const { Pool } = require('pg');

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false  
//   }
// });

// pool.connect()
//   .then(() => console.log('Database connected successfully!'))
//   .catch((err) => console.error('Database connection error:', err.stack));

// module.exports = pool;
const { Pool } = require('pg');

// Create a new pool instance with individual connection parameters
const pool = new Pool({
  host: 'factually-secured-mastiff.data-1.use1.tembo.io',
  port: 5432,
  user: 'postgres',
  password: 'Ybi4KIfItDEOSqwi',
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false 
  }
});

// Connect to the database and handle any connection errors
pool.connect()
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => console.error('Database connection error:', err.stack));

module.exports = pool;
