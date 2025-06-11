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
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { JsonToTable } from 'react-json-to-table';

const DashboardPage = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filters, setFilters] = useState({
    name: '',
    city: '',
    number: '',
    pincode: '',
    country: '',
    tracking_id: '',
  });

  const navTabs = [
    { label: 'Upload', path: '/upload' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Analytics', path: '/analytics' },
  ];

  const [currentTab, setCurrentTab] = useState(navTabs[1].path); // Dashboard is the second tab

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

      for (const key in filters) {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      }

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
  }, [page, pageSize, filters]); // Re-fetch when page, size, or filters change

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
    setPage(1); // Reset to first page on filter change
  };

  const handleClearFilter = (filterName) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: '' }));
    setPage(1); // Reset to first page on filter change
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mb: 4 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          aria-label="navigation tabs"
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          sx={{
            '.MuiTabs-indicator': {
              height: '4px',
              borderRadius: '4px 4px 0 0',
            },
          }}
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

      <Paper elevation={3} sx={{ mt: 2, p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
          Extracted Records History
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2}>
            {Object.keys(filters).map((key) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <TextField
                  fullWidth
                  label={key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  name={key}
                  value={filters[key]}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    endAdornment: filters[key] && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => handleClearFilter(key)} size="small">
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

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

        {!loading && !error && records.length === 0 && (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 4 }}>
            No records found. Adjust your filters or upload a label.
          </Typography>
        )}

        {!loading && records.length > 0 && (
          <TableContainer component={Paper} elevation={1} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.light', '& th': { color: 'common.white', fontWeight: 'bold' } }}>
                  <TableCell>Uploaded Time</TableCell>
                  <TableCell>Tracking ID</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Pincode</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Upload Status</TableCell>
                  <TableCell>Extract Status</TableCell>
                  <TableCell>Extracted Info</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{new Date(record.upload_timestamp).toLocaleString()}</TableCell>
                    <TableCell>{record.tracking_id || 'N/A'}</TableCell>
                    <TableCell>{record.address || 'N/A'}</TableCell>
                    <TableCell>{record.name || 'N/A'}</TableCell>
                    <TableCell>{record.city || 'N/A'}</TableCell>
                    <TableCell>{record.pincode || 'N/A'}</TableCell>
                    <TableCell>{record.country || 'N/A'}</TableCell>
                    <TableCell>{record.upload_status}</TableCell>
                    <TableCell>{record.extract_status}</TableCell>
                    <TableCell>
                      {record.extracted_info ? (
                        <Box sx={{ maxHeight: 100, overflowY: 'auto' }}>
                           <JsonToTable json={record.extracted_info} />
                        </Box>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {!loading && totalRecords > pageSize && (
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