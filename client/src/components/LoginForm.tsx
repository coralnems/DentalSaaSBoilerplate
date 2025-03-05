import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Button, TextField, Typography, Alert, Paper, Link } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

// Define credential types
interface Credential {
  role: string;
  email: string;
  password: string;
  displayPassword: string;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, userRole } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Define credentials outside of JSX
  const credentials: Credential[] = [
    {
      role: "Admin",
      email: "admin@healthcareapps.org",
      password: "JPtp7XDGF=9ezR>q",
      displayPassword: "JPtp7XDGF=9ezR>q"
    },
    {
      role: "Doctor",
      email: "doctor@healthcareapps.org",
      password: "M9V|?v}}&yrwcJML",
      displayPassword: "M9V|?v}}&yrwcJML"
    },
    {
      role: "Receptionist",
      email: "reception@healthcareapps.org",
      password: "|;;g]J39=wiqQXKg",
      displayPassword: "|;;g]J39=wiqQXKg"
    },
    {
      role: "Patient",
      email: "patient@healthcareapps.org",
      password: ",H,^v&F8MeMK@}64",
      displayPassword: ",H,^v&F8MeMK@}64"
    }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { email, password } = formData;
      
      // Validate form
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }

      // Call login API
      const response = await login(email, password);
      console.log('Login successful:', response);
      
      // Get return URL from location state or default to dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      
      // Redirect based on user role
      if (response.user.role === 'admin') {
        navigate('/dashboard');
      } else if (response.user.role === 'doctor') {
        navigate('/dashboard');
      } else if (response.user.role === 'receptionist') {
        navigate('/dashboard');
      } else if (response.user.role === 'patient') {
        navigate('/dashboard');
      } else {
        // Default fallback
        navigate(from);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, password: string) => {
    setFormData({ email, password });
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Login
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            autoFocus
          />
          
          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Button
                color="primary"
                onClick={() => navigate('/register')}
                sx={{ p: 0, minWidth: 'auto' }}
              >
                Register
              </Button>
            </Typography>
          </Box>
        </form>
      </Paper>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 'bold', mb: 1 }}>
          Test Accounts (Updated) - Click to auto-fill:
        </Typography>
        
        {credentials.map((cred, index) => (
          <Typography 
            key={index} 
            variant="body2" 
            color="textSecondary" 
            sx={{ fontFamily: 'monospace', mb: 1 }}
          >
            <Link
              component="button"
              type="button"
              onClick={() => fillCredentials(cred.email, cred.password)}
              sx={{ textDecoration: 'none' }}
            >
              {`${cred.role}: ${cred.email} / ${cred.displayPassword}`}
            </Link>
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default LoginForm; 