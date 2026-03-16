const express = require('express');
const router = express.Router();
const {
	requireAdmin,
	getUsers,
	getSections,
	approveUser,
	getStats,
	createSection,
	deleteUser,
} = require('../controllers/admin');

router.use(requireAdmin);

router.get('/users', getUsers);

router.post('/approve-user', approveUser);

router.get('/stats', getStats);

router.get('/sections', getSections);

router.post('/sections', createSection);

router.post('/delete-user', deleteUser);

module.exports = router;
