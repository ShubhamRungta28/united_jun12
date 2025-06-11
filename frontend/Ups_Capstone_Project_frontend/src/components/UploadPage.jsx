import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress,
  IconButton,
  useTheme,
  Fade,
  Zoom,
  Alert,
  Snackbar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import { mockOcrApi } from '../utils/api';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const theme = useTheme();

  // Frontend Validation as per user's request
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png'];
    const extension = file.name.split('.').pop().toLowerCase();

    // Check if the extension is one of the allowed image extensions
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const hasValidExtension = allowedExtensions.includes(extension);

    // Check if the MIME type is one of the allowed image MIME types
    const hasValidMimeType = validTypes.includes(file.type);

    if (!hasValidExtension || !hasValidMimeType) {
      alert("Only JPEG and PNG files are allowed.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 5MB');
      return false;
    }

    return true;
  };

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (f) {
      if (!validateFile(f)) {
        setFile(null);
        setPreviewUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      try {
        // This client-side image verification is still useful for corrupted images or non-image content
        const isValidImage = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = URL.createObjectURL(f);
        });

        if (!isValidImage) {
          alert('The file appears to be corrupted or is not a valid image. Please try another file.');
          setFile(null);
          setPreviewUrl('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        }

        setFile(f);
        setError('');
        setPreviewUrl(URL.createObjectURL(f));
      } catch (err) {
        alert('Failed to process the file: ' + err.message);
        setFile(null);
        setPreviewUrl('');
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      if (!validateFile(f)) {
        return;
      }

      try {
        // This client-side image verification is still useful for corrupted images or non-image content
        const isValidImage = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = URL.createObjectURL(f);
        });

        if (!isValidImage) {
          alert('The file appears to be corrupted or is not a valid image. Please try another file.');
          return;
        }

        setFile(f);
        setError('');
        setPreviewUrl(URL.createObjectURL(f));
      } catch (err) {
        alert('Failed to process the file: ' + err.message);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!validateFile(file)) {
      return; // Validation handled by alert inside validateFile
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use fetch API to send the file to your FastAPI backend's /upload-image endpoint
      const token = localStorage.getItem('access_token'); // Assuming token is stored in localStorage
      // if (!token) {
      //   setError('Authentication token not found. Please log in.');
      //   setLoading(false);
      //   return;
      // }

      const response = await fetch('http://localhost:8000/upload-image/', {
        method: 'POST',
        headers: {
          // 'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data', // Fetch API sets this automatically with FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'File upload failed');
      }

      // Handle the JSON response
      const result = await response.json();
      console.log('Upload successful:', result);

      // Store the extracted data in sessionStorage
      sessionStorage.setItem('extractedData', JSON.stringify(result));

      setSuccessMessage('File uploaded and processed successfully!');
      setTimeout(() => {
        navigate('/dashboard'); // Navigate to dashboard after successful upload
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container maxWidth="md">
      <Fade in timeout={800}>
        <Box>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Upload Label
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload a shipping label image for analysis
            </Typography>
          </Box>

          <Paper 
            elevation={0}
            sx={{ 
              border: '2px dashed',
              borderColor: isDragging ? 'primary.main' : file ? 'primary.main' : 'divider',
              borderRadius: 3,
              p: 4,
              bgcolor: file ? 'primary.main' : isDragging ? 'rgba(53, 28, 21, 0.02)' : 'background.paper',
              transition: 'all 0.3s ease-in-out',
              transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <Box
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: 300,
                justifyContent: 'center',
                color: file ? 'common.white' : 'text.primary',
              }}
            >
              {!file ? (
                <Fade in timeout={500}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CloudUploadIcon 
                      sx={{ 
                        fontSize: 64, 
                        mb: 2, 
                        color: isDragging ? 'primary.main' : 'primary.light',
                        transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.3s ease-in-out',
                      }} 
                    />
                    <Typography variant="h6" gutterBottom align="center">
                      {isDragging ? 'Drop your file here' : 'Drag and drop your file here'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
                      or
                    </Typography>
                    <Button
                      variant="contained"
                      component="label"
                      sx={{ 
                        mt: 2,
                        background: 'linear-gradient(45deg, #351C15 30%, #4A2B21 90%)',
                      }}
                    >
                      Browse Files
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                        disabled={loading}
                      />
                    </Button>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Supported formats: JPEG, PNG (Max size: 5MB)
                    </Typography>
                  </Box>
                </Fade>
              ) : (
                <Zoom in timeout={500}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Paper 
                      elevation={3} 
                      sx={{
                        width: 150,
                        height: 150,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        overflow: 'hidden',
                        bgcolor: 'white',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    </Paper>
                    <Typography variant="subtitle1" gutterBottom sx={{ color: 'common.white' }}>
                      {file.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                    <IconButton 
                      onClick={clearFile} 
                      sx={{ 
                        color: 'error.main', 
                        mt: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.2)' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Zoom>
              )}
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mt: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius: 2,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #FF9900 30%, #FFB040 90%)',
              boxShadow: '0px 4px 15px rgba(255, 153, 0, 0.4)',
              '&:hover': {
                background: 'linear-gradient(45deg, #FFB040 30%, #FF9900 90%)',
                boxShadow: '0px 6px 20px rgba(255, 153, 0, 0.6)',
              },
            }}
            onClick={handleUpload}
            disabled={!file || loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </Button>

          <Snackbar
            open={!!successMessage}
            autoHideDuration={4000}
            onClose={() => setSuccessMessage('')}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
              {successMessage}
            </Alert>
          </Snackbar>

        </Box>
      </Fade>
    </Container>
  );
};

export default UploadPage; 