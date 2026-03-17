const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
	requireAdmin,
	getUsers,
	getSections,
	approveUser,
	getStats,
	createSection,
	deleteUser,
	uploadSf10,
	createSf10SignedUrl,
	listSf10Files,
} = require('../controllers/admin');

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024,
	},
});

router.use(requireAdmin);

router.get('/users', getUsers);

router.post('/approve-user', approveUser);

router.get('/stats', getStats);

router.get('/sections', getSections);

router.post('/sections', createSection);

router.post('/delete-user', deleteUser);

router.post('/sf10/upload', upload.single('file'), uploadSf10);

router.post('/sf10/signed-url', createSf10SignedUrl);

router.get('/sf10/files', listSf10Files);

module.exports = router;
