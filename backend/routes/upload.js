const express = require('express');
const multer = require('multer');
const { handleFileUpload } = require('../controllers/fileController');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/', upload.single('file'), handleFileUpload);

module.exports = router;
