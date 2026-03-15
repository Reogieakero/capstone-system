const express = require('express');
const router = express.Router();
const { requireAdmin, getUsers, approveUser, getStats, deleteUser } = require('../controllers/adminController');

router.use(requireAdmin);

router.get('/users', getUsers);

router.post('/approve-user', approveUser);

router.get('/stats', getStats);

router.post('/delete-user', deleteUser);

module.exports = router;
