import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { CssVarsProvider, useColorScheme } from '@mui/joy/styles';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Link from '@mui/joy/Link';
import Box from '@mui/joy/Box';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import IconButton from '@mui/joy/IconButton';
import { useAuth } from '../../hooks/useAuth';

function ColorSchemeToggle() {
  const { mode, setMode } = useColorScheme();
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <IconButton
      id="toggle-mode"
      size="lg"
      variant="soft"
      color="neutral"
      onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
      sx={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 999,
      }}
    >
      {mode === 'dark' ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
    </IconButton>
  );
}

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'staff'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const [imageUrl, setImageUrl] = useState('');

  React.useEffect(() => {
    // Fetch a random dental image from Unsplash
    fetch('https://api.unsplash.com/photos/random?query=dental-office&client_id=YOUR_UNSPLASH_API_KEY')
      .then(res => res.json())
      .then(data => setImageUrl(data.urls.regular))
      .catch(() => setImageUrl('/default-dental-image.jpg'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as 'dentist' | 'staff'
      });
    } catch (err) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CssVarsProvider defaultMode="dark" disableTransitionOnChange>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {/* Left side - Image */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'block' },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt="Dental office"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
            }}
          >
            <Typography
              level="h1"
              sx={{
                color: 'white',
                textAlign: 'center',
                fontSize: { xs: '2rem', md: '3rem' },
                maxWidth: '600px',
              }}
            >
              Join Our Dental Care Team
            </Typography>
          </Box>
        </Box>

        {/* Right side - Registration form */}
        <Sheet
          sx={{
            flex: { xs: 1, md: '0 0 50%' },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: { xs: 3, md: 6 },
            position: 'relative',
            overflowY: 'auto',
          }}
        >
          <ColorSchemeToggle />

          <div>
            <Typography level="h3" component="h1" sx={{ mb: 2 }}>
              Create Account
            </Typography>
            <Typography level="body-sm">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">
                Sign in
              </Link>
            </Typography>
          </div>

          <form onSubmit={handleSubmit}>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>First Name</FormLabel>
              <Input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                size="lg"
              />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Last Name</FormLabel>
              <Input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                size="lg"
              />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                size="lg"
              />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                size="lg"
              />
              <Typography level="body-xs" sx={{ mt: 1 }}>
                Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
              </Typography>
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                size="lg"
              />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Role</FormLabel>
              <Select
                value={formData.role}
                onChange={(_, value) => setFormData(prev => ({ ...prev, role: value as string }))}
                size="lg"
              >
                <Option value="staff">Staff</Option>
                <Option value="dentist">Dentist</Option>
              </Select>
            </FormControl>

            {error && (
              <Typography
                level="body-sm"
                color="danger"
                sx={{ mb: 2 }}
              >
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
            >
              Create Account
            </Button>
          </form>
        </Sheet>
      </Box>
    </CssVarsProvider>
  );
} 