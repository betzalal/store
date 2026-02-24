const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.post('/', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const imageFile = req.files.image;
    const uploadPath = path.join(__dirname, '..', 'public', 'uploads');

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(imageFile.name);
    const filename = 'img-' + uniqueSuffix + extension;
    const savePath = path.join(uploadPath, filename);

    imageFile.mv(savePath, (err) => {
        if (err) return res.status(500).send(err);

        // Return URL relative to server root
        // Assuming server serves 'public/uploads' at '/uploads'
        res.json({ url: `http://localhost:3001/uploads/${filename}` });
    });
});

module.exports = router;
