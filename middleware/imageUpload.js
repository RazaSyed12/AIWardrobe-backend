import multer from 'multer';
import path from 'path';

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save the file to the 'uploads' directory
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Get the file extension (jpg, png, etc.)
    const ext = path.extname(file.originalname);
    // Generate a unique name for the file and append the extension
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});

// File filter to accept only images (jpeg, png, jpg)
const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Set up Multer with the storage configuration and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
  }
});

// Export the upload middleware to use in your routes
export const clothesUpload = upload.single('image');
