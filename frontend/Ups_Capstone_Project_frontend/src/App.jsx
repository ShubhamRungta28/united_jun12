import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import LoginPage from './components/LoginPage';
import UploadPage from './components/UploadPage';
import DashboardPage from './components/DashboardPage';
import AnalyticsPage from './components/AnalyticsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { CssBaseline, AppBar, Toolbar, Typography, Button, Box, Container, Stack, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { AuthProvider, useAuth } from './auth/AuthContext';
import theme from './theme';
import { useNavigate } from 'react-router-dom';
import RegisterPage from './components/RegisterPage';
import ConfirmationPage from './components/ConfirmationPage';
import HomePage from './components/HomePage';
import ProfilePage from './components/ProfilePage';

function App() {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Define paths where the AppBar should not be shown
  const noAppBarPaths = ['/login', '/register', '/confirmation'];
  const shouldShowAppBar = !noAppBarPaths.includes(location.pathname);

  const navItems = [
    { label: 'Upload', path: '/upload' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Analytics', path: '/analytics' },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ width: '20vw' }} // Occupies 20% of the viewport width
    >
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={() => navigate('/profile')}>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            // Placeholder for actual settings logic
            alert('Settings page not implemented yet.');
            navigate('/settings'); // You might want to create a settings page later
          }}>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
        {isAuthenticated && (
          <ListItem disablePadding>
            <ListItemButton onClick={() => {
              logout();
              navigate('/login');
            }}>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {shouldShowAppBar && (
          <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main' }}>
            <Container maxWidth="lg">
              <Toolbar sx={{ px: { xs: 0 } }}>
                  {isAuthenticated && (
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      edge="start"
                      onClick={handleDrawerToggle}
                      sx={{ mr: 2 }}
                    >
                      <MenuIcon />
                    </IconButton>
                  )}
                <Typography 
                  variant="h5" 
                  sx={{ 
                    flexGrow: 1, 
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                    onClick={() => navigate(isAuthenticated ? '/home' : '/login')} // Changed to /home after login
                >
                  Package Label
                </Typography>
                {isAuthenticated && (
                  <Stack direction="row" spacing={2} sx={{ mr: 2 }}>
                      {/* These items are now in the drawer */}
                  </Stack>
                )}
                {isAuthenticated && (
                    <IconButton
                    color="inherit" 
                      onClick={() => navigate('/profile')}
                      sx={{ ml: 2 }} // Margin left for spacing from logout button if it exists
                    >
                      <AccountCircle />
                    </IconButton>
                )}
              </Toolbar>
            </Container>
          </AppBar>
          )}
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={handleDrawerToggle}
          >
            {drawer}
          </Drawer>
          <Box 
            component="main" 
            sx={{ 
              flexGrow: 1,
              bgcolor: 'background.default',
              py: 4
            }}
          >
            <Container maxWidth="lg">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/confirmation" element={<ConfirmationPage />} />
                <Route path="/home" element={<HomePage />} /> {/* New home page route */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } /> {/* New profile page route */}
                <Route path="/upload" element={
                  <ProtectedRoute>
                    <UploadPage />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <AnalyticsPage />
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Container>
          </Box>
        </Box>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App; 