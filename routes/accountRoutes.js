const express = require('express');
const router = express.Router();
const dbController = require('../controllers/AccountsController');

router.get('/branch-account-data', dbController.getBranchAccountData);
router.get('/download', dbController.downloadAccounts);
router.get('/',dbController.getAllAccounts);
router.get('/:id', dbController.getAccountById);
router.post('/', dbController.createAccount);
router.put('/:id', dbController.updateAccount);
router.delete('/:id', dbController.deleteAccount);

module.exports = router;