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
	updateSection,
	deleteUser,
	uploadSf10,
	createSf10SignedUrl,
	listSf10Files,
} = require('../controllers/admin');

const { convertToPdf } = require('../controllers/admin/convertToPdf');

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

router.put('/sections/:sectionId', updateSection);

router.post('/delete-user', deleteUser);

router.post('/sf10/upload', upload.single('file'), uploadSf10);

router.post('/sf10/signed-url', createSf10SignedUrl);

router.get('/sf10/files', listSf10Files);

router.post('/convert-to-pdf', convertToPdf);

module.exports = router;