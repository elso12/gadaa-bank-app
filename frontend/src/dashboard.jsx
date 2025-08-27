import React, { useState } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import FileUploadForm from './FileUploadForm.jsx';

const branches = ['addis_ababa', 'adama', 'mekele'];

const Dashboard = ({ user, onLogout }) => {
  const [message, setMessage] = useState('');

  const toTitleCase = (str) => {
    return str.replace('_', ' ').split(' ').map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Welcome, {toTitleCase(user.username)}!
        </Typography>
        <Button variant="outlined" color="secondary" onClick={onLogout}>
          Logout
        </Button>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Role: {toTitleCase(user.role)}
      </Typography>

      <Box sx={{ my: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Upload File
        </Typography>
        <FileUploadForm branches={branches} setMessage={setMessage} />
      </Box>

      {message && (
        <Box sx={{ my: 2, p: 2, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
          <Typography variant="body1">{message}</Typography>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;
