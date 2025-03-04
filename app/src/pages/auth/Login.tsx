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

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const [imageUrl, setImageUrl] = useState('');

  React.useEffect(() => {
    // Fetch a random dental image from Unsplash
    fetch('https://api.unsplash.com/photos/random?query=dental-clinic&client_id=YOUR_UNSPLASH_API_KEY')
      .then(res => res.json())
      .then(data => setImageUrl(data.urls.regular))
      .catch(() => setImageUrl('/default-dental-image.jpg'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Redirect will be handled by the auth hook
    } catch (err) {
      setError(err.message || 'Failed to login');
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
            alt="Dental clinic"
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
              Welcome to DentalCare Management System
            </Typography>
          </Box>
        </Box>

        {/* Right side - Login form */}
        <Sheet
          sx={{
            flex: { xs: 1, md: '0 0 50%' },
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            p: { xs: 3, md: 6 },
            position: 'relative',
          }}
        >
          <ColorSchemeToggle />

          <div>
            <Typography level="h3" component="h1" sx={{ mb: 2 }}>
              Sign in
            </Typography>
            <Typography level="body-sm">
              New to the platform?{' '}
              <Link component={RouterLink} to="/register">
                Create an account
              </Link>
            </Typography>
          </div>

          <form onSubmit={handleSubmit}>
            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="lg"
              />
            </FormControl>

            <FormControl sx={{ mb: 2 }}>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="lg"
              />
            </FormControl>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Link component={RouterLink} to="/forgot-password" level="body-sm">
                Forgot your password?
              </Link>
            </Box>

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
              Sign in
            </Button>
          </form>
        </Sheet>
      </Box>
    </CssVarsProvider>
  );
} 