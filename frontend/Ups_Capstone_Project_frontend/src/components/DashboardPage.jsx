import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableRow, 
  TableHead, 
  TableContainer, 
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

const DashboardPage = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const navTabs = [
    { label: 'Upload', path: '/upload' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Analytics', path: '/analytics' },
  ];

  const [currentTab, setCurrentTab] = useState(navTabs[1].path);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    navigate(newValue);
  };

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page,
        size: pageSize,
      });

      const response = await fetch(`http://localhost:8000/upload-records/?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRecords(data.items);
      setTotalRecords(data.total);
    } catch (err) {
      setError("Failed to fetch records: " + err.message);
      setRecords([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, pageSize]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const highlightMatch = (text) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? <mark key={i}>{part}</mark> : part
    );
  };

  const filteredRecords = records.filter(record => {
    const combined = Object.values(record).join(' ').toLowerCase();
    return combined.includes(searchTerm.toLowerCase());
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          {navTabs.map((tab) => (
            <Tab 
              key={tab.path} 
              label={tab.label} 
              value={tab.path} 
              sx={{ fontWeight: 'bold' }}
            />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Rows</InputLabel>
          <Select
            value={pageSize}
            label="Rows"
            onChange={(e) => setPageSize(e.target.value)}
          >
            {[5, 10, 20, 50].map((size) => (
              <MenuItem key={size} value={size}>{size}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Search All"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Paper elevation={3} sx={{ mt: 2, p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Extracted Records History
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ ml: 2 }}>Loading records...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ my: 4 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && filteredRecords.length === 0 && (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
            No matching records found.
          </Typography>
        )}

        {!loading && filteredRecords.length > 0 && (
          <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light', '& th': { color: 'common.white', fontWeight: 'bold' } }}>
                  <TableCell>Uploaded Time</TableCell>
                  <TableCell>Tracking ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Pincode</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Upload Status</TableCell>
                  <TableCell>Extract Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{highlightMatch(new Date(record.upload_timestamp).toLocaleString())}</TableCell>
                    <TableCell>{highlightMatch(record.tracking_id || 'N/A')}</TableCell>
                    <TableCell>{highlightMatch(record.name || 'N/A')}</TableCell>
                    <TableCell>{highlightMatch(record.city || 'N/A')}</TableCell>
                    <TableCell>{highlightMatch(record.pincode || 'N/A')}</TableCell>
                    <TableCell>{highlightMatch(record.country || 'N/A')}</TableCell>
                    <TableCell>{highlightMatch(record.upload_status.charAt(0).toUpperCase() + record.upload_status.slice(1))}</TableCell>
                    <TableCell>{highlightMatch(record.extract_status.charAt(0).toUpperCase() + record.extract_status.slice(1))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && filteredRecords.length > pageSize && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={Math.ceil(totalRecords / pageSize)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
          <Button variant="contained" color="secondary" onClick={() => navigate('/upload')}>
            Go to Upload
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate('/analytics')}>
            Go to Analytics
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DashboardPage;
