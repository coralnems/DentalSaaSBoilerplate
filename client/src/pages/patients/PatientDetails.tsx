import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Button,
  Box,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  medicalHistory: {
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
  dentalHistory: {
    lastVisit: string;
    treatments: string[];
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // TODO: Implement API call to fetch patient details
    setLoading(false);
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEdit = () => {
    navigate(`/patients/${id}/edit`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!patient) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Patient not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <div>
            <Typography variant="h4" gutterBottom>
              {`${patient.firstName} ${patient.lastName}`}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              Patient ID: {patient._id}
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Patient
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="patient details tabs">
            <Tab label="Personal Information" />
            <Tab label="Medical History" />
            <Tab label="Dental History" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Contact Information</Typography>
              <Typography>Email: {patient.email}</Typography>
              <Typography>Phone: {patient.phone}</Typography>
              <Typography>Date of Birth: {new Date(patient.dateOfBirth).toLocaleDateString()}</Typography>
              <Typography>Gender: {patient.gender}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>Address</Typography>
              <Typography>{patient.address.street}</Typography>
              <Typography>{`${patient.address.city}, ${patient.address.state} ${patient.address.zipCode}`}</Typography>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Medical Conditions</Typography>
              {patient.medicalHistory.conditions.map((condition, index) => (
                <Typography key={index}>{condition}</Typography>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Medications</Typography>
              {patient.medicalHistory.medications.map((medication, index) => (
                <Typography key={index}>{medication}</Typography>
              ))}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>Allergies</Typography>
              {patient.medicalHistory.allergies.map((allergy, index) => (
                <Typography key={index}>{allergy}</Typography>
              ))}
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Last Visit</Typography>
              <Typography>{new Date(patient.dentalHistory.lastVisit).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Treatment History</Typography>
              {patient.dentalHistory.treatments.map((treatment, index) => (
                <Typography key={index}>{treatment}</Typography>
              ))}
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default PatientDetails; 