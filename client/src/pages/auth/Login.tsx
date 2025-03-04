import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
  Stack,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  QrCode2 as QrCodeIcon,
  Key as KeyIcon,
} from '@mui/icons-material';

import { setCredentials } from '@store/slices/authSlice';
import { addNotification } from '@store/slices/uiSlice';
import { authApi } from '@api/services/auth';
import QRCodeAuth from '@components/auth/QRCodeAuth';
import PasskeyAuth from '@components/auth/PasskeyAuth';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

type AuthMethod = 'password' | 'qrcode' | 'passkey';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      const response = await authApi.login(values);
      dispatch(setCredentials(response));
      dispatch(
        addNotification({
          type: 'success',
          message: 'Login successful!',
        })
      );
      navigate(from, { replace: true });
    } catch (error: any) {
      dispatch(
        addNotification({
          type: 'error',
          message: error.response?.data?.message || 'Login failed',
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderAuthMethod = () => {
    switch (authMethod) {
      case 'qrcode':
        return <QRCodeAuth onCancel={() => setAuthMethod('password')} />;
      case 'passkey':
        return (
          <PasskeyAuth
            mode="authenticate"
            onCancel={() => setAuthMethod('password')}
          />
        );
      default:
        return (
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isSubmitting,
            }) => (
              <Form style={{ width: '100%', marginTop: '1rem' }}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  margin="normal"
                />

                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    OR
                  </Typography>
                </Divider>

                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<QrCodeIcon />}
                    onClick={() => setAuthMethod('qrcode')}
                  >
                    Sign in with QR Code
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<KeyIcon />}
                    onClick={() => setAuthMethod('passkey')}
                  >
                    Sign in with Passkey
                  </Button>
                </Stack>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    variant="body2"
                    sx={{ display: 'block', mb: 1 }}
                  >
                    Forgot password?
                  </Link>
                  <Typography variant="body2" color="textSecondary">
                    Don't have an account?{' '}
                    <Link component={RouterLink} to="/register">
                      Sign up
                    </Link>
                  </Typography>
                </Box>
              </Form>
            )}
          </Formik>
        );
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Welcome Back
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Sign in to your account
          </Typography>

          {renderAuthMethod()}
        </Paper>
      </Container>
    </Box>
  );
};

export default Login; 