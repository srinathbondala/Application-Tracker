const express = require('express');
const router = express.Router();
const dbController = require('../controllers/AdminController');

router.get('/state-account-data', dbController.getStateAccountData);
router.get('/',dbController.getAllAccounts);
router.get('/:id', dbController.getAccountById);
router.post('/', dbController.createAccount);
router.put('/:id', dbController.updateAccount);
router.delete('/:id', dbController.deleteAccount);

module.exports = router;