import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  Container,
  Link,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material';

import { authApi } from '@api/services/auth';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (
    values: { email: string },
    { setSubmitting, setFieldError }: { setSubmitting: (isSubmitting: boolean) => void; setFieldError: (field: string, message: string) => void }
  ) => {
    try {
      await authApi.forgotPassword(values.email);
      setIsSubmitted(true);
    } catch (error: any) {
      setFieldError('email', error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setSubmitting(false);
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
            Forgot Password
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            Enter your email address to reset your password
          </Typography>

          {isSubmitted ? (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Password reset instructions have been sent to your email address.
              </Alert>
              <Typography variant="body2" color="textSecondary" align="center">
                Didn't receive the email?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try again
                </Link>
              </Typography>
            </Box>
          ) : (
            <Formik
              initialValues={{ email: '' }}
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

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reset Instructions'}
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                      Remember your password?{' '}
                      <Link component={RouterLink} to="/login">
                        Sign in
                      </Link>
                    </Typography>
                  </Box>
                </Form>
              )}
            </Formik>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword; 