const accountService = require('../services/accountsService');

async function getAllAccounts(req, res) {
    try {
        const accounts = await accountService.sgetAllAccounts(req.user.id); // Get all accounts from database
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function getAccountById(req, res) {
    try {
        const id = req.params.id;
        const account = await accountService.sgetAccountById(id,req.user.id); // Get an account by ID from database
        res.json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function createAccount(req, res) {
    try {
        const accountData = req.body;
        const newAccount = await accountService.screateAccount(accountData,req.user.id); // Create a new account
        res.status(201).json(newAccount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function updateAccount(req, res) {
    try {
        const id = req.params.id;
        const accountData = req.body;
        const updatedAccount = await accountService.supdateAccount(id, accountData,req.user.id); // Update an existing account
        res.json(updatedAccount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function deleteAccount(req, res) {
    try {
        const id = req.params.id;
        const result = await accountService.sdeleteAccount(id,req.user.id); // Delete an account by ID
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

async function getBranchAccountData(req, res) {
    try {
        const data = await accountService.sgetAccountsByBranch(req.user.id);
        const labels = data.map(item => item.branch);
        const accountCounts = data.map(item => item.accountcount);
        res.json({
            labels,
            datasets: [{
                label: 'Number of Accounts',
                data: accountCounts,
                backgroundColor: labels.map(() => getRandomColor())
            }]
        });
    } catch (error) {
        console.error('Error fetching branch account data:', error);
        if (!res.headersSent) { 
            res.status(500).json({ message: 'Error fetching branch account data' });
        }
    }
};

async function downloadAccounts(req, res) {
    try{
        const buffer = await accountService.downloadAccountService(req.user.id);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="accounts.xlsx"');
        res.send(buffer);
    } catch(error){
        console.log(error);
        res.status(500).json({ message:'Failed to download bill data'});
    }
}

module.exports = {
    getAllAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    getBranchAccountData,
    deleteAccount,
    downloadAccounts
};
