const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Ensure 'uploads' directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Serve static files (CSS, JS, images)
app.use(express.static('public'));
app.use('/uploads', express.static('uploads')); // Serve the 'uploads' folder for downloading files

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Commented out the upload functionality
/*
const multer = require('multer');

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, 'resume.pdf'); // Always save the file as 'resume.pdf'
  },
});

const upload = multer({ storage });

// Route to handle file upload
app.post('/upload-resume', upload.single('resume'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send('File uploaded successfully!');
});
*/

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});