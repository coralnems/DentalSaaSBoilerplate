import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Stack,
  useTheme
} from '@mui/material';
import {
  Key as KeyIcon,
  QrCode2 as QrCodeIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { setUser } from '../../store/slices/authSlice';
import { addNotification } from '../../store/slices/uiSlice';
import { api } from '../../services/api';
import QRCodeAuth from './QRCodeAuth';
import PasskeyAuth from './PasskeyAuth';

type AuthMethod = 'password' | 'qrcode' | 'passkey';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password');

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await api.post('/auth/login', values);
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        dispatch(setUser(user));
        dispatch(addNotification({
          message: 'Successfully logged in',
          type: 'success'
        }));
        navigate('/dashboard');
      } catch (error: any) {
        dispatch(addNotification({
          message: error.response?.data?.message || 'Login failed',
          type: 'error'
        }));
      }
    },
  });

  const renderAuthMethod = () => {
    switch (authMethod) {
      case 'qrcode':
        return (
          <QRCodeAuth
            onCancel={() => setAuthMethod('password')}
          />
        );
      case 'passkey':
        return (
          <PasskeyAuth
            mode="authenticate"
            email={formik.values.email}
            onCancel={() => setAuthMethod('password')}
          />
        );
      default:
        return (
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              variant="outlined"
              margin="normal"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={formik.isSubmitting}
            >
              Sign In
            </Button>
          </form>
        );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Sign In
        </Typography>

        {renderAuthMethod()}

        {authMethod === 'password' && (
          <>
            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Or continue with
              </Typography>
            </Divider>

            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<QrCodeIcon />}
                onClick={() => setAuthMethod('qrcode')}
              >
                QR Code
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<KeyIcon />}
                onClick={() => setAuthMethod('passkey')}
              >
                Passkey
              </Button>
            </Stack>
          </>
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="textSecondary">
            Don't have an account?{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{
                color: theme.palette.primary.main,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
              onClick={() => navigate('/register')}
            >
              Sign up
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login; 