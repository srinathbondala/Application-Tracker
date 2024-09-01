const adminService = require('../services/adminService');

exports.getAllAccounts = async (req, res) => {
    try {
        const accounts = await adminService.sgetAllAccounts();
        res.status(200).json(accounts);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getAccountById = async (req, res) => {
    try {
        const account = await adminService.sgetAccountById(req.params.id);
        if (!account) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }
        res.status(200).json(account);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createAccount = async (req, res) => {
    try {
        const { name, email, phone, address, state, password, role } = req.body;
        const result = await adminService.screateAccount(name, email, phone, address, state, password, role);
        res.status(201).json({ success: true, message: 'Account created successfully', accountId: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.updateAccount = async (req, res) => {
    try {
        const { name, email, phone, address, state, role } = req.body;
        await adminService.supdateAccount(req.params.id, name, email, phone, address, state, role);
        res.status(200).json({ success: true, message: 'Account updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        await adminService.sdeleteAccount(req.params.id);
        res.status(200).json({ success: true, message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

exports.getStateAccountData = async (req, res) => {
    try {
        const data = await adminService.sgetStateAccountData();
        const labels = data.map(item => item.state);
        const accountCounts = data.map(item => item.accountcount);

        res.json({
            labels,
            datasets: [{
                label: 'Number of Accounts by State',
                data: accountCounts,
                backgroundColor: labels.map(() => getRandomColor())
            }]
        });
    } catch (error) {
        console.error('Error fetching state account data:', error);
        if (!res.headersSent) { 
            res.status(500).json({ message: 'Error fetching state account data' });
        }
    }
};
