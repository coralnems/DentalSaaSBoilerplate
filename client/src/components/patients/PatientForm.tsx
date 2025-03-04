import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Divider,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  useTheme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { addNotification } from '../../store/slices/uiSlice';
import { api } from '../../services/api';

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface CommunicationPreferences {
  email: boolean;
  phone: boolean;
  sms: boolean;
}

interface PatientFormData {
  _id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date | null;
  gender: string;
  email: string;
  phone: string;
  address: Address;
  emergencyContact: EmergencyContact;
  preferredLanguage: string;
  communicationPreferences: CommunicationPreferences;
}

interface PatientFormProps {
  initialValues?: PatientFormData;
  isEditing?: boolean;
}

const validationSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  gender: Yup.string().oneOf(['male', 'female', 'other']).required('Gender is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  address: Yup.object({
    street: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    zipCode: Yup.string().required('ZIP code is required'),
    country: Yup.string().required('Country is required')
  }),
  emergencyContact: Yup.object({
    name: Yup.string().required('Emergency contact name is required'),
    relationship: Yup.string().required('Relationship is required'),
    phone: Yup.string().required('Emergency contact phone is required')
  }),
  preferredLanguage: Yup.string(),
  communicationPreferences: Yup.object({
    email: Yup.boolean(),
    phone: Yup.boolean(),
    sms: Yup.boolean()
  })
});

const defaultInitialValues: PatientFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: null,
  gender: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: ''
  },
  preferredLanguage: 'English',
  communicationPreferences: {
    email: true,
    phone: true,
    sms: true
  }
};

const PatientForm: React.FC<PatientFormProps> = ({ initialValues = defaultInitialValues, isEditing = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: PatientFormData) => {
    try {
      setLoading(true);
      if (isEditing && initialValues._id) {
        await api.put(`/patients/${initialValues._id}`, values);
        dispatch(addNotification({
          message: 'Patient updated successfully',
          type: 'success'
        }));
      } else {
        await api.post('/patients', values);
        dispatch(addNotification({
          message: 'Patient created successfully',
          type: 'success'
        }));
      }
      navigate('/patients');
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to save patient',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Formik<PatientFormData>
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
        <Form>
          <Box p={3}>
            <Typography variant="h5" gutterBottom>
              {isEditing ? 'Edit Patient' : 'New Patient'}
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="firstName"
                    label="First Name"
                    value={values.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.firstName && Boolean(errors.firstName)}
                    helperText={touched.firstName && errors.firstName as string}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="lastName"
                    label="Last Name"
                    value={values.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.lastName && Boolean(errors.lastName)}
                    helperText={touched.lastName && errors.lastName as string}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Date of Birth"
                    value={values.dateOfBirth}
                    onChange={(date: Date | null) => setFieldValue('dateOfBirth', date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: touched.dateOfBirth && Boolean(errors.dateOfBirth),
                        helperText: touched.dateOfBirth && errors.dateOfBirth as string
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="gender"
                    label="Gender"
                    value={values.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.gender && Boolean(errors.gender)}
                    helperText={touched.gender && errors.gender as string}
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email as string}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="phone"
                    label="Phone"
                    value={values.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.phone && Boolean(errors.phone)}
                    helperText={touched.phone && errors.phone as string}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="address.street"
                    label="Street Address"
                    value={values.address.street}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address?.street && Boolean(errors.address?.street)}
                    helperText={touched.address?.street && (errors.address?.street as string)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="address.city"
                    label="City"
                    value={values.address.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address?.city && Boolean(errors.address?.city)}
                    helperText={touched.address?.city && (errors.address?.city as string)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="address.state"
                    label="State"
                    value={values.address.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address?.state && Boolean(errors.address?.state)}
                    helperText={touched.address?.state && (errors.address?.state as string)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="address.zipCode"
                    label="ZIP Code"
                    value={values.address.zipCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address?.zipCode && Boolean(errors.address?.zipCode)}
                    helperText={touched.address?.zipCode && (errors.address?.zipCode as string)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="address.country"
                    label="Country"
                    value={values.address.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.address?.country && Boolean(errors.address?.country)}
                    helperText={touched.address?.country && (errors.address?.country as string)}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="emergencyContact.name"
                    label="Contact Name"
                    value={values.emergencyContact.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.emergencyContact?.name && Boolean(errors.emergencyContact?.name)}
                    helperText={touched.emergencyContact?.name && (errors.emergencyContact?.name as string)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="emergencyContact.relationship"
                    label="Relationship"
                    value={values.emergencyContact.relationship}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.emergencyContact?.relationship && Boolean(errors.emergencyContact?.relationship)}
                    helperText={touched.emergencyContact?.relationship && (errors.emergencyContact?.relationship as string)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="emergencyContact.phone"
                    label="Contact Phone"
                    value={values.emergencyContact.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.emergencyContact?.phone && Boolean(errors.emergencyContact?.phone)}
                    helperText={touched.emergencyContact?.phone && (errors.emergencyContact?.phone as string)}
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Preferences
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    name="preferredLanguage"
                    label="Preferred Language"
                    value={values.preferredLanguage}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Communication Preferences
                  </Typography>
                  <FormControlLabel
                    control={
                      <Field
                        type="checkbox"
                        name="communicationPreferences.email"
                        as={Checkbox}
                      />
                    }
                    label="Email"
                  />
                  <FormControlLabel
                    control={
                      <Field
                        type="checkbox"
                        name="communicationPreferences.phone"
                        as={Checkbox}
                      />
                    }
                    label="Phone"
                  />
                  <FormControlLabel
                    control={
                      <Field
                        type="checkbox"
                        name="communicationPreferences.sms"
                        as={Checkbox}
                      />
                    }
                    label="SMS"
                  />
                </Grid>
              </Grid>
            </Paper>

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate('/patients')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
              >
                {isEditing ? 'Update Patient' : 'Create Patient'}
              </Button>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default PatientForm; 