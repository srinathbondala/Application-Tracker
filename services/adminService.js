// const db = require('../dbconfig/dbconnect');
// const bcrypt = require('bcrypt');

// function validateAccountData({ name, email, phone, address, state, role }) {
//     if (!name || name.length < 3 || name.length > 50) return 'Invalid name';
//     if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return 'Invalid email';
//     if (!phone || !/^\d{10}$/.test(phone)) return 'Invalid phone number';
//     if (!address || address.length < 5 || address.length > 255) return 'Invalid address';
//     if (!state || state.length < 2 || state.length > 50) return 'Invalid state';
//     if (!['admin', 'user'].includes(role)) return 'Invalid role';
//     return null;
// }

// exports.sgetAllAccounts = () => {
//     return new Promise((resolve, reject) => {
//         db.query('SELECT id, name, email, phone, address, state, role FROM auth WHERE role = ?', ['user'],(err, results) => {
//             if (err) return reject(err);
//             resolve(results);
//         });
//     });
// };

// exports.sgetAccountById = (id) => {
//     return new Promise((resolve, reject) => {
//         db.execute('SELECT id, name, email, phone, address, state, role FROM auth WHERE id = ? AND role= ?', [id,'user'], (err, results) => {
//             if (err) return reject(err);
//             resolve(results[0]);
//         });
//     });
// };

// exports.screateAccount = async ({ name, email, phone, address, state, password, role }) => {
//     console.log(name+" "+email+" "+phone+" "+address+" "+state+" "+password+" "+role);
//     try {
//         const checkEmailSql = 'SELECT email FROM auth WHERE email = ?';
//         const [rows] = await db.promise().query(checkEmailSql, [email]);

//         if (rows.length > 0) {
//         return { success: false, message: 'Email already exists. Please use a different email.' };
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);
//         const sql = 'INSERT INTO auth (name, email, phone, address, state, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)';
//         await db.promise().query(sql, [name, email, phone, address, state, hashedPassword, role]);

//         return { success: true };
//     } catch (err) {
//         console.error(err);
//         return { success: false, message: 'Registration failed due to an internal error.' };
//     }
//   };

// exports.supdateAccount = (id, { name, email, phone, address, state, role }) => {
//     return new Promise((resolve, reject) => {
//         const validationError = validateAccountData({ name, email, phone, address, state, role });
//         if (validationError) return reject(validationError);

//         db.execute(
//             'UPDATE auth SET name = ?, email = ?, phone = ?, address = ?, state = ?, role = ? WHERE id = ?', 
//             [name, email, phone, address, state, role, id],
//             (err, result) => {
//                 if (err) return reject(err);
//                 resolve(result);
//             }
//         );
//     });
// };

// exports.sdeleteAccount = (id) => {
//     return new Promise((resolve, reject) => {
//         db.execute('DELETE FROM auth WHERE id = ?', [id], (err, result) => {
//             if (err) return reject(err);
//             resolve(result);
//         });
//     });
// };

// exports.sgetStateAccountData = (state) => {
//     return new Promise((resolve, reject) => {
//         const query = `
//             SELECT state, COUNT(*) AS accountCount
//             FROM auth WHERE role = 'user'
//             GROUP BY state;
//         `;
//         db.query(query, (err, results) => {
//             if (err) {
//                 console.log(err);
//                 return reject(err);
//             }
//             resolve(results);
//         });
//     });
// };

const db = require('../dbconfig/dbconnect');
const bcrypt = require('bcrypt');

function validateAccountData({ name, email, phone, address, state, role }) {
    if (!name || name.length < 3 || name.length > 50) return 'Invalid name';
    if (!email || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) return 'Invalid email';
    if (!phone || !/^\d{10}$/.test(phone)) return 'Invalid phone number';
    if (!address || address.length < 5 || address.length > 255) return 'Invalid address';
    if (!state || state.length < 2 || state.length > 50) return 'Invalid state';
    if (!['admin', 'user'].includes(role)) return 'Invalid role';
    return null;
}

exports.sgetAllAccounts = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT id, name, email, phone, address, state, role FROM auth WHERE role = $1', ['user'], (err, results) => {
            if (err) return reject(err);
            resolve(results.rows);  // PostgreSQL returns rows in the `rows` property
        });
    });
};

exports.sgetAccountById = (id) => {
    return new Promise((resolve, reject) => {
        db.query('SELECT id, name, email, phone, address, state, role FROM auth WHERE id = $1 AND role= $2', [id, 'user'], (err, results) => {
            if (err) return reject(err);
            resolve(results.rows[0]);  // Access the first row from the `rows` array
        });
    });
};

exports.screateAccount = async ({ name, email, phone, address, state, password, role }) => {
    console.log(name+" "+email+" "+phone+" "+address+" "+state+" "+password+" "+role);
    try {
        const checkEmailSql = 'SELECT email FROM auth WHERE email = $1';
        const { rows } = await db.query(checkEmailSql, [email]);

        if (rows.length > 0) {
            return { success: false, message: 'Email already exists. Please use a different email.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = 'INSERT INTO auth (name, email, phone, address, state, password, role) VALUES ($1, $2, $3, $4, $5, $6, $7)';
        await db.query(sql, [name, email, phone, address, state, hashedPassword, role]);

        return { success: true };
    } catch (err) {
        console.error(err);
        return { success: false, message: 'Registration failed due to an internal error.' };
    }
};

exports.supdateAccount = (id, { name, email, phone, address, state, role }) => {
    return new Promise((resolve, reject) => {
        const validationError = validateAccountData({ name, email, phone, address, state, role });
        if (validationError) return reject(validationError);

        db.query(
            'UPDATE auth SET name = $1, email = $2, phone = $3, address = $4, state = $5, role = $6 WHERE id = $7', 
            [name, email, phone, address, state, role, id],
            (err, result) => {
                if (err) return reject(err);
                resolve(result);
            }
        );
    });
};

exports.sdeleteAccount = (id) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM auth WHERE id = $1', [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

exports.sgetStateAccountData = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT state, COUNT(*) AS accountCount
            FROM auth WHERE role = 'user'
            GROUP BY state;
        `;
        db.query(query, (err, results) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(results.rows);
        });
    });
};
