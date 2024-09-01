// const db = require('../dbconfig/dbconnect');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const JWT_SECRET = process.env.JWT_SECRET;

// // Service for registering a user
// exports.registerUser = async (name, email, phone, address, state, password, role) => {
//   // console.log(name+" "+email+" "+phone+" "+address+" "+state+" "+password+" "+role);
//   try {
//     const checkEmailSql = 'SELECT email FROM auth WHERE email = ?';
//     const [rows] = await db.promise().query(checkEmailSql, [email]);

//     if (rows.length > 0) {
//       return { success: false, message: 'Email already exists. Please use a different email.' };
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const sql = 'INSERT INTO auth (name, email, phone, address, state, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
//     await db.promise().query(sql, [name, email, phone, address, state, hashedPassword, role]);

//     return { success: true };
//   } catch (err) {
//     console.error(err);
//     return { success: false, message: 'Registration failed due to an internal error.' };
//   }
// };

// // Service for logging in a user
// exports.loginUser = async (email, password) => {
//   try {
//     const sql = 'SELECT * FROM auth WHERE email = ?';
//     const [rows] = await db.promise().query(sql, [email]);

//     if (rows.length === 0) {
//       return { success: false, message: 'Invalid email or password.' };
//     }

//     const user = rows[0];
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return { success: false, message: 'Invalid email or password.' };
//     }
//     const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
//     return { success: true, token, details: {id: user.id, name: user.name, email: user.email, role: user.role, address: user.address, state: user.state, phone: user.phone} };
//   } catch (err) {
//     console.error(err);
//     return { success: false, message: 'Login failed due to an internal error.' };
//   }
// };

// exports.getUserDetailsById = async (userId) => {
//   try {
//     const sql = 'SELECT id, name, email, phone, address, state, role FROM auth WHERE id = ?';
//     const [rows] = await db.promise().query(sql, [userId]);

//     if (rows.length === 0) {
//       return { success: false, message: 'User not found' };
//     }

//     return { success: true, user: rows[0] };
//   } catch (err) {
//     console.error('Error fetching user details:', err);
//     return { success: false, message: 'Database query failed' };
//   }
// };

// exports.updateUser = async (id, userData) => {
//   const { name, phone, address, state } = userData;

//   // Basic validation to check if fields are empty
//   if (!name || !phone || !address || !state) {
//       throw new Error('All fields are required.');
//   }

//   const nameRegex = /^[a-zA-Z\s]+$/;
//   const phoneRegex = /^[0-9]{10}$/; 

//   if (!nameRegex.test(name)) {
//       throw new Error('Name must contain only letters and spaces.');
//   }
//   if (!phoneRegex.test(phone)) {
//       throw new Error('Phone number must be a 10-digit number.');
//   }
//   if (address.trim() === '' || state.trim() === '') {
//       throw new Error('Address and state cannot be empty.');
//   }
//   const sql = 'UPDATE auth SET name = ?, phone = ?, address = ?, state = ? WHERE id = ?';
//   await db.promise().query(sql, [name, phone, address, state, id]);
//   return this.getUserDetailsById(id);
// };
require('dotenv').config(); // Ensure this is at the top of the file
const db = require('../dbconfig/dbconnect');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET1 = process.env.JWT_SECRET;

if (!JWT_SECRET1) {
  console.error('JWT_SECRET is not defined');
  throw new Error('JWT_SECRET environment variable is missing');
}

// Service for registering a user
exports.registerUser = async (name, email, phone, address, state, password, role) => {
  try {
    const checkEmailSql = 'SELECT email FROM auth WHERE email = $1';
    const { rows } = await db.query(checkEmailSql, [email]);

    if (rows.length > 0) {
      return { success: false, message: 'Email already exists. Please use a different email.' };
    }

    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role.toLowerCase())) {
      return { success: false, message: 'Invalid role provided.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO auth (name, email, phone, address, state, password, role) VALUES ($1, $2, $3, $4, $5, $6, $7)';
    await db.query(sql, [name, email, phone, address, state, hashedPassword, role.toLowerCase()]);

    return { success: true };
  } catch (err) {
    console.error('Registration error:', err);
    return { success: false, message: 'Registration failed due to an internal error.' };
  }
};

// Service for logging in a user
exports.loginUser = async (email, password) => {
  try {
    const sql = 'SELECT * FROM auth WHERE email = $1';
    const { rows } = await db.query(sql, [email]);

    if (rows.length === 0) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET1, { expiresIn: '24h' });
    return {
      success: true,
      token,
      details: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        state: user.state,
        phone: user.phone
      }
    };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, message: 'Login failed due to an internal error.' };
  }
};

// Service to get user details by ID
exports.getUserDetailsById = async (userId) => {
  try {
    const sql = 'SELECT id, name, email, phone, address, state, role FROM auth WHERE id = $1';
    const { rows } = await db.query(sql, [userId]);

    if (rows.length === 0) {
      return { success: false, message: 'User not found' };
    }

    return { success: true, user: rows[0] };
  } catch (err) {
    console.error('Error fetching user details:', err);
    return { success: false, message: 'Database query failed' };
  }
};

// Service to update user details
exports.updateUser = async (id, userData) => {
  const { name, phone, address, state } = userData;

  // Basic validation
  if (!name || !phone || !address || !state) {
    throw new Error('All fields are required.');
  }

  const nameRegex = /^[a-zA-Z\s]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  if (!nameRegex.test(name)) {
    throw new Error('Name must contain only letters and spaces.');
  }
  if (!phoneRegex.test(phone)) {
    throw new Error('Phone number must be a 10-digit number.');
  }
  if (address.trim() === '' || state.trim() === '') {
    throw new Error('Address and state cannot be empty.');
  }

  try {
    const sql = 'UPDATE auth SET name = $1, phone = $2, address = $3, state = $4 WHERE id = $5';
    await db.query(sql, [name, phone, address, state, id]);
    return this.getUserDetailsById(id);
  } catch (err) {
    console.error('Error updating user:', err);
    throw new Error('Update failed due to an internal error.');
  }
};
