const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure disk storage with dynamic destination mapping
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = 'uploads/';
    if (file.mimetype.startsWith('image/')) {
      dest = 'uploads/chat-images/';
    } else {
      dest = 'uploads/chat-files/';
    }
    
    // Ensure the folder exists
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// File filter supporting standard images and common document file formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/jpg',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format! Only images (.jpg, .jpeg, .png, .webp) and documents (.pdf, .doc, .docx, .txt) are supported.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB size limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
