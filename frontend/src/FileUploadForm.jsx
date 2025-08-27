import React, { useState, useEffect } from 'react';
import { Box, Button, FormControl, InputLabel, Select, MenuItem, LinearProgress, Alert, List, ListItem, ListItemText } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

// Helper component to hide the native file input
const VisuallyHiddenInput = React.forwardRef((props, ref) => (
  <input type="file" ref={ref} {...props} style={{ display: 'none' }} />
));

const FileUploadForm = ({ branches }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedUploadBranch, setSelectedUploadBranch] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Fetch uploaded files for a branch
  const fetchFiles = async (branch) => {
    if (!branch) return;
    try {
      const response = await axios.get(`http://localhost:5000/files/${branch.toLowerCase()}`);
      setUploadedFiles(response.data.files || []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setUploadedFiles([]);
    }
  };

  useEffect(() => {
    fetchFiles(selectedUploadBranch);
  }, [selectedUploadBranch]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setUploadStatus('');
    setMessage('');
    setUploadProgress(0);
  };

  const handleUploadBranchChange = (event) => {
    setSelectedUploadBranch(event.target.value);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedUploadBranch) {
      setUploadStatus('error');
      setMessage('Please select a file and a branch for upload.');
      return;
    }

    setUploadStatus('info');
    setMessage('Uploading...');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('branch', selectedUploadBranch.toLowerCase());

    // Add these lines to log the FormData content before sending
    console.log('Preparing to send the following FormData:');
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      setUploadStatus('success');
      setMessage(response.data.message || 'File uploaded successfully!');
      setSelectedFile(null);
      setSelectedUploadBranch('');
      setUploadProgress(0);

      // Refresh uploaded files list
      fetchFiles(selectedUploadBranch);
    } catch (error) {
      setUploadStatus('error');
      if (error.response && error.response.data && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage('File upload failed. Please try again.');
      }
      console.error('Upload error:', error);
    }
  };

  return (
    <Box sx={{ p: 3, border: '1px solid #ccc', borderRadius: 2, my: 3 }}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="upload-branch-label">Select Branch</InputLabel>
        <Select
          labelId="upload-branch-label"
          value={selectedUploadBranch}
          label="Select Branch"
          onChange={handleUploadBranchChange}
        >
          {branches.map((branch) => (
            <MenuItem key={branch} value={branch}>
              {branch.replace('_', ' ').toUpperCase()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{ mr: 2 }}
        >
          {selectedFile ? selectedFile.name : 'Choose File'}
          <VisuallyHiddenInput onChange={handleFileChange} />
        </Button>
        <Box sx={{ color: 'text.secondary' }}>
          {selectedFile ? `File: ${selectedFile.name}` : 'No file selected'}
        </Box>
      </Box>

      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!selectedFile || !selectedUploadBranch || uploadStatus === 'info'}
        fullWidth
      >
        {uploadStatus === 'info' ? 'Uploading...' : 'Upload File'}
      </Button>

      {uploadStatus === 'info' && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {uploadStatus && uploadStatus !== 'info' && (
        <Alert severity={uploadStatus} sx={{ mt: 2 }}>
          {message}
        </Alert>
      )}

      {/* Display uploaded files */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <strong>Uploaded Files:</strong>
          <List>
            {uploadedFiles.map((file) => (
              <ListItem key={file}>
                <ListItemText primary={file} />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default FileUploadForm;