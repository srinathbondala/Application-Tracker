const conn = require('../dbconfig/dbconnect');
const ExcelJS = require('exceljs');

//function to validate account data.
function validateAccountData(accountData) {
    const { account_number, account_name, account_type, balance, opening_date, last_transaction_date, status, branch_name } = accountData;
    
    if (!account_number || typeof account_number !== 'string' || account_number.trim() === '') {
        return { error: 'Invalid or missing account_number' };
    }
    if (!account_name || typeof account_name !== 'string' || account_name.trim() === '') {
        return { error: 'Invalid or missing account_name' };
    }
    if (!account_type || typeof account_type !== 'string' || account_type.trim() === '') {
        return { error: 'Invalid or missing account_type' };
    }
    if (isNaN(balance) || balance < 0) {
        return { error: 'Invalid or missing balance' };
    }
    if (!opening_date || isNaN(new Date(opening_date).getTime())) {
        return { error: 'Invalid or missing opening_date' };
    }
    if (last_transaction_date && isNaN(new Date(last_transaction_date).getTime())) {
        return { error: 'Invalid last_transaction_date' };
    }
    if (!status || typeof status !== 'string' || status.trim() === '') {
        return { error: 'Invalid or missing status' };
    }
    if (!branch_name || typeof branch_name !== 'string' || branch_name.trim() === '') {
        return { error: 'Invalid or missing branch_name' };
    }
    return null;
}

//function to get all accounts.
async function sgetAllAccounts(userId) {
    return new Promise((resolve, reject) => {
        conn.query('SELECT * FROM accounts WHERE user_id = ?',[userId], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

//function to get account by id.
async function sgetAccountById(id,userId) {
    return new Promise((resolve, reject) => {
        conn.query('SELECT * FROM accounts WHERE id = ? AND user_id = ?', [id,userId], (err, results) => {
            if (err) return reject(err);
            if (results.length === 0) return reject(new Error('Account not found'));
            resolve(results[0]);
        });
    });
}

//function to create account.
async function screateAccount(accountData,userId) {
    const { account_number, account_name, account_type, balance, opening_date, last_transaction_date, status, branch_name } = accountData;
    const validationError = validateAccountData(accountData);
    if (validationError) {
        return Promise.reject(validationError);
    }
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO accounts (account_number, account_name, account_type, balance, opening_date, last_transaction_date, status, branch_name, user_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        conn.query(query, [account_number, account_name, account_type, balance, opening_date, last_transaction_date, status, branch_name, userId], (err, results) => {
            if (err) return reject(err);
            resolve({ id: results.insertId, ...accountData });  // Create a new account
        });
    });
}

//function to update account.
async function supdateAccount(id, accountData,userId) {
    if (isNaN(id) || id <= 0) {
        return Promise.reject({ error: 'Invalid account ID' });
    }
    const validationError = validateAccountData(accountData);
    if (validationError) {
        return Promise.reject(validationError);
    }

    const { account_number, account_name, account_type, balance, opening_date, last_transaction_date, status, branch_name } = accountData;
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE accounts 
            SET account_number = ?, account_name = ?, account_type = ?, balance = ?, opening_date = ?, last_transaction_date = ?, status = ?, branch_name = ? 
            WHERE id = ? AND user_id = ?`;
        conn.query(query, [account_number, account_name, account_type, balance, opening_date, last_transaction_date, status, branch_name, id, userId], (err, results) => {
            if (err) return reject(err);
            if (results.affectedRows === 0) return reject(new Error('Account not found'));
            resolve({ id, ...accountData });    // Update an existing account
        });
    });
}

//function to delete account.
async function sdeleteAccount(id,userId) {
    return new Promise((resolve, reject) => {
        if (isNaN(id) || id <= 0) return reject((new Error('Invalid account ID')));
        conn.query('DELETE FROM accounts WHERE id = ? AND user_id = ?', [id,userId], (err, results) => {
            if (err) return reject(err);
            if (results.affectedRows === 0) return reject(new Error('Account not found'));
            resolve("Success");
        });
    });
}

async function sgetAccountsByBranch(userId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT branch_name AS branch, COUNT(*) AS accountCount
            FROM accounts WHERE user_id = ?
            GROUP BY branch_name;
        `;
        conn.query(query, [userId] , (err, results) => {
            if (err){ return reject(err); console.log(err); }
            resolve(results);
        });
    });
}
async function downloadAccountService(req, res) {
    try {
        const userId = req.user.id;
        const [rows] = await conn.promise().query('SELECT * FROM accounts where user_id = ?', [userId]);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Accounts');

        worksheet.columns = [
            { header: 'ID', key: 'id' },
            { header: 'Account Number', key: 'account_number' },
            { header: 'Account Name', key: 'account_name' },
            { header: 'Account Type', key: 'account_type' },
            { header: 'Balance', key: 'balance' },
            { header: 'Opening Date', key: 'opening_date' },
            { header: 'Last Transaction Date', key: 'last_transaction_date' },
            { header: 'Status', key: 'status' },
            { header: 'Branch Name', key: 'branch_name' }
        ];

        rows.forEach((row) => {
            worksheet.addRow(row);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    } catch (error) {
        console.log(error);
        res.status(500).send('Failed to download bill data');
    }
}

module.exports = {
    sgetAllAccounts,
    sgetAccountById,
    screateAccount,
    supdateAccount,
    sdeleteAccount,
    sgetAccountsByBranch,
    downloadAccountService
};
