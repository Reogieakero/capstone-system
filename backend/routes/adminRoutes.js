const express = require('express');
const router = express.Router();
const { requireAdmin, getUsers, approveUser, getStats } = require('../controllers/adminController');

router.use(requireAdmin);

router.get('/users', getUsers);

router.post('/approve-user', approveUser);

router.get('/stats', getStats);

module.exports = router;
