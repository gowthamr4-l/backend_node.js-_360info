const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../img/rent');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure disk storage — rename each file to <uuid>.<ext>
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'rent'; // Default for legacy properties API
    if (req.baseUrl.includes('residential-resale')) folder = 'residential_resale';
    else if (req.baseUrl.includes('residential-pg')) folder = 'residential_pg';
    else if (req.baseUrl.includes('commercial-rent')) folder = 'commercial_rent';
    else if (req.baseUrl.includes('commercial-sale')) folder = 'commercial_sale';
    else if (req.baseUrl.includes('land-plot')) folder = 'land_plot_resale';
    
    const dynamicUploadDir = path.join(__dirname, '../../img', folder);
    if (!fs.existsSync(dynamicUploadDir)) {
      fs.mkdirSync(dynamicUploadDir, { recursive: true });
    }
    
    cb(null, dynamicUploadDir);
  },
  filename: (req, file, cb) => {
    const uuid = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuid}${ext}`;
    // Attach uuid to the file object so we can use it in the service
    file.uuid = uuid;
    file.storedName = filename;
    cb(null, filename);
  }
});

// Only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, HEIC) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 9 // Max 9 files per upload
  }
});

module.exports = upload;
