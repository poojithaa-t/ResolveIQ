import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AccountCircle, Dashboard, AddCircle, AdminPanelSettings } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          ResolveIQ
        </Typography>
        
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user.role !== 'admin' && (
              <Button
                color="inherit"
                component={Link}
                to="/dashboard"
                startIcon={<Dashboard />}
              >
                Dashboard
              </Button>
            )}
            
            {user.role !== 'admin' && (
              <Button
                color="inherit"
                component={Link}
                to="/submit-complaint"
                startIcon={<AddCircle />}
              >
                Submit Complaint
              </Button>
            )}
            
            {user.role === 'admin' && (
              <Button
                color="inherit"
                component={Link}
                to="/admin"
                startIcon={<AdminPanelSettings />}
              >
                Admin
              </Button>
            )}
            
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>
                  <Typography variant="body2">
                    {user.name} ({user.role})
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </div>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;