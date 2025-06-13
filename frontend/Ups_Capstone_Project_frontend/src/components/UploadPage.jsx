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
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar
} from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { JsonToTable } from 'react-json-to-table';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_BATCH_UPLOAD_LIMIT = 10;

const UploadPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processedResults, setProcessedResults] = useState([]);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const theme = useTheme();

  const navTabs = [
    { label: 'Upload', path: '/upload' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Analytics', path: '/analytics' },
  ];

  const [currentTab, setCurrentTab] = useState(navTabs[0].path);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    navigate(newValue);
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png'];
    const extension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png'];

    if (!allowedExtensions.includes(extension) || !validTypes.includes(file.type)) {
      setError(`Only JPEG and PNG files are allowed. Invalid file: ${file.name}`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size for ${file.name} must be less than 5MB`);
      return false;
    }

    return true;
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > MAX_BATCH_UPLOAD_LIMIT) {
      setError(`You can only upload a maximum of ${MAX_BATCH_UPLOAD_LIMIT} images at once. You selected ${selectedFiles.length}.`);
      setFiles([]);
      fileInputRef.current.value = '';
      return;
    }

    const validFiles = [];
    for (const f of selectedFiles) {
      if (!validateFile(f)) continue;

      try {
        const isValidImage = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = URL.createObjectURL(f);
        });

        if (!isValidImage) {
          setError(`The file ${f.name} appears to be corrupted or is not a valid image.`);
          continue;
        }

        f.preview = URL.createObjectURL(f);
        validFiles.push(f);
      } catch (err) {
        setError(`Failed to process file ${f.name}: ${err.message}`);
      }
    }

    setFiles(validFiles);
    fileInputRef.current.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);

    if (droppedFiles.length > MAX_BATCH_UPLOAD_LIMIT) {
      setError(`You can only upload a maximum of ${MAX_BATCH_UPLOAD_LIMIT} images at once. You dropped ${droppedFiles.length}.`);
      setFiles([]);
      return;
    }

    const validFiles = [];
    for (const f of droppedFiles) {
      if (!validateFile(f)) continue;

      try {
        const isValidImage = await new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = URL.createObjectURL(f);
        });

        if (!isValidImage) {
          setError(`The file ${f.name} appears to be corrupted or is not a valid image.`);
          continue;
        }

        f.preview = URL.createObjectURL(f);
        validFiles.push(f);
      } catch (err) {
        setError(`Failed to process file ${f.name}: ${err.message}`);
      }
    }

    setFiles(validFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    setProcessedResults([]);

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('http://localhost:8000/upload-images-batch/', {
        method: 'POST',
        body: formData,
      });

      const results = await response.json();
      if (!response.ok) throw new Error(results.detail || 'Batch upload failed');

      setProcessedResults(results);
      const allSuccess = results.every(r => r.upload_status === 'successful' && r.extract_status === 'successful');
      setSuccessMessage(allSuccess ? 'All files uploaded and processed successfully!' : 'Some files failed. See below.');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setError('');
    setSuccessMessage('');
    setProcessedResults([]);
    fileInputRef.current.value = '';
  };

  return (
    <Container maxWidth="md">
      <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
        {navTabs.map(tab => (
          <Tab key={tab.path} label={tab.label} value={tab.path} />
        ))}
      </Tabs>

      <Box mt={4}>
        <Typography variant="h4">Upload Labels</Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          Only JPG and PNG files are allowed. Max size: 5MB. Max upload limit: {MAX_BATCH_UPLOAD_LIMIT} files.
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mt: 2 }}>{successMessage}</Alert>}

        <Paper onDrop={handleDrop} onDragOver={e => e.preventDefault()} sx={{ p: 4, border: '2px dashed grey', mt: 2 }}>
          <Box textAlign="center">
            <CloudUploadIcon sx={{ fontSize: 60 }} />
            <Typography>Drag & drop files or</Typography>
            <Button onClick={() => fileInputRef.current.click()} startIcon={<CloudUploadIcon />}>Browse Files</Button>
            <input ref={fileInputRef} type="file" multiple hidden accept="image/*" onChange={handleFileChange} />
          </Box>
        </Paper>

        {files.length > 0 && (
          <Box mt={3}>
            <Typography variant="h6">Selected Files ({files.length})</Typography>
            <List>
              {files.map((file, idx) => (
                <ListItem key={idx}>
                  <Avatar variant="square" src={file.preview} sx={{ width: 56, height: 56, mr: 2 }} />
                  <ListItemText primary={file.name} secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`} />
                </ListItem>
              ))}
            </List>
            <Button onClick={clearFiles} startIcon={<DeleteIcon />}>Clear Files</Button>
          </Box>
        )}

        <Box mt={3} textAlign="center">
          <Button
            variant="contained"
            disabled={loading || files.length === 0}
            startIcon={loading && <CircularProgress size={20} />}
            onClick={handleUpload}
          >
            {loading ? 'Uploading...' : 'Upload and Extract All'}
          </Button>
        </Box>

        {processedResults.length > 0 && (
          <Box mt={4}>
            <Typography variant="h5">Processing Results</Typography>
            {processedResults.map((res, idx) => (
              <Box key={idx} mt={2} p={2} border={1} borderColor={res.upload_status === 'failed' ? 'error.main' : 'grey.300'}>
                <Typography fontWeight="bold" color={res.upload_status === 'failed' ? 'error' : 'text.primary'}>
                  {res.filename} - {res.upload_status === 'failed' ? 'Upload Failed' : res.upload_status}
                </Typography>
                {res.error && <Typography color="error">Error: {res.error}</Typography>}
                {res.extracted_info && <JsonToTable json={res.extracted_info} />}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default UploadPage;
