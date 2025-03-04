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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { forgotPassword } = useAuth();
  const [imageUrl, setImageUrl] = useState('');

  React.useEffect(() => {
    // Fetch a random dental image from Unsplash
    fetch('https://api.unsplash.com/photos/random?query=dental-care&client_id=YOUR_UNSPLASH_API_KEY')
      .then(res => res.json())
      .then(data => setImageUrl(data.urls.regular))
      .catch(() => setImageUrl('/default-dental-image.jpg'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email');
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
            alt="Dental care"
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
              Reset Your Password
            </Typography>
          </Box>
        </Box>

        {/* Right side - Forgot Password form */}
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
              Forgot Password
            </Typography>
            <Typography level="body-sm" sx={{ mb: 3 }}>
              Enter your email address and we'll send you instructions to reset your password.
            </Typography>
          </div>

          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                level="h4"
                color="success"
                sx={{ mb: 2 }}
              >
                Email Sent!
              </Typography>
              <Typography level="body-md" sx={{ mb: 3 }}>
                Please check your email for instructions to reset your password.
              </Typography>
              <Link component={RouterLink} to="/login">
                Return to Login
              </Link>
            </Box>
          ) : (
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
                Send Reset Instructions
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Link component={RouterLink} to="/login" level="body-sm">
                  Back to Login
                </Link>
              </Box>
            </form>
          )}
        </Sheet>
      </Box>
    </CssVarsProvider>
  );
} 