'use strict';

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Users (for demo login)
const users = [
  { username: 'admin', password: 'adminpassword', role: 'admin' },
  { username: 'addis_ababa_branch', password: 'branchpassword', role: 'branch' },
  { username: 'adama_branch', password: 'branchpassword', role: 'branch' },
  { username: 'mekele_branch', password: 'branchpassword', role: 'branch' },
];

// Branches
const BRANCHES = ['addis_ababa', 'adama', 'mekele'];

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid username or password.' });

  const token = 'mock-jwt-token-for-' + user.role;
  res.json({ message: 'Login successful!', token, user });
});

// Multer storage config (using a temporary directory)
const storage = multer.diskStorage({
  // The destination is a temporary folder. The final destination will be handled in the route handler.
  destination: (req, file, cb) => {
    cb(null, 'uploads/temp/');
  },
  filename: (req, file, cb) => {
    // Keep the original filename
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  // At this point, the file is uploaded to the 'uploads/temp' folder, and req.body is populated.
  console.log('Received request body:', req.body);
  console.log('Received file:', req.file);

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const { branch } = req.body;
  const originalPath = req.file.path;

  // Validate the branch
  if (!branch) {
    fs.unlinkSync(originalPath); // Clean up the temp file
    return res.status(400).json({ message: 'Branch name is missing from the request.' });
  }

  const targetBranch = branch.toLowerCase();
  if (!BRANCHES.includes(targetBranch)) {
    fs.unlinkSync(originalPath); // Clean up the temp file
    return res.status(400).json({ message: 'Invalid branch selected.' });
  }

  // Define the final destination and move the file
  const finalPath = path.join(__dirname, 'uploads', targetBranch, req.file.filename);
  const branchPath = path.join(__dirname, 'uploads', targetBranch);
  
  if (!fs.existsSync(branchPath)) {
      fs.mkdirSync(branchPath, { recursive: true });
  }

  fs.rename(originalPath, finalPath, (err) => {
    if (err) {
      console.error('Error moving file:', err);
      return res.status(500).json({ message: 'Failed to move file to final destination.' });
    }
    res.json({ message: `File "${req.file.originalname}" uploaded to branch "${targetBranch}"!` });
  });
});

// Get files for a branch
app.get('/files/:branch_name', (req, res) => {
  const branchName = req.params.branch_name.toLowerCase();
  if (!BRANCHES.includes(branchName)) return res.status(400).json({ message: 'Invalid branch name.' });

  const branchPath = path.join(__dirname, 'uploads', branchName);
  if (!fs.existsSync(branchPath)) return res.json({ files: [] });

  try {
    const files = fs.readdirSync(branchPath);
    res.json({ files });
  } catch (error) {
    console.error('Error reading directory:', error);
    res.status(500).json({ message: 'Error retrieving files.' });
  }
});

// Test route
app.get('/', (req, res) => res.send('Gadaa Bank Backend is running.'));

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    // Ensure the temporary directory exists
    const tempDir = path.join(__dirname, 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }
});