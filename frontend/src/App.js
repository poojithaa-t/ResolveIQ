import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ComplaintForm from './pages/ComplaintForm';
import ComplaintDetails from './pages/ComplaintDetails';
import AdminDashboard from './pages/AdminDashboard';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={user && user.role !== 'admin' ? <Dashboard /> : <Navigate to={user?.role === 'admin' ? "/admin" : "/login"} />} 
          />
          <Route 
            path="/submit-complaint" 
            element={user && user.role !== 'admin' ? <ComplaintForm /> : <Navigate to={user?.role === 'admin' ? "/admin" : "/login"} />} 
          />
          <Route 
            path="/complaint/:id" 
            element={user ? <ComplaintDetails /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? (user.role === 'admin' ? "/admin" : "/dashboard") : "/login"} />} 
          />
        </Routes>
      </Container>
    </div>
  );
}

export default App;