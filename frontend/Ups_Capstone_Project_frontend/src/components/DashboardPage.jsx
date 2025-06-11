import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, Table, TableBody, TableCell, TableRow, TableHead, TableContainer } from '@mui/material';
import { saveAs } from 'file-saver';
import { toCsv } from '../utils/csv';

const DashboardPage = () => {
  const [extractedData, setExtractedData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const data = sessionStorage.getItem('extractedData');
    if (data) {
      setExtractedData(JSON.parse(data));
    }
  }, []);

  const handleDownload = () => {
    if (!extractedData) return;
    const csv = toCsv([extractedData]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'extracted_data.csv');
  };

  if (!extractedData) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ mt: 8, p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No extracted data found. Please upload a label first.</Typography>
          <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/upload')}>Go to Upload</Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ mt: 8, p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Extracted Label Details
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(extractedData).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button variant="contained" color="primary" onClick={handleDownload}>
            Download as CSV
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => navigate('/analytics')}>
            Go to Analytics
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DashboardPage; 