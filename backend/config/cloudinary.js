const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

// Only configure Cloudinary if credentials are provided
const cloudinaryEnabled = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

let upload;

if (cloudinaryEnabled) {
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'agrilink',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
  });

  upload = multer({ storage: storage });
  console.log('✅ Cloudinary storage enabled');
} else {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  });

  upload = multer({ storage: storage });
  console.log('📂 Local storage enabled (images will be saved in /uploads)');
}

module.exports = { cloudinary, upload };
