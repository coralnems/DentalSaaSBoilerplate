import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MedicalServices as MedicalIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { api } from '../../services/api';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  status: 'active' | 'inactive' | 'archived';
}

const PatientList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('active');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await api.get('/patients', {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          search,
          status
        }
      });
      setPatients(response.data.patients);
      setTotal(response.data.pagination.total);
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to fetch patients',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page, rowsPerPage, search, status]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value);
    setPage(0);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to archive this patient?')) {
      return;
    }

    try {
      await api.delete(`/patients/${id}`);
      dispatch(addNotification({
        message: 'Patient archived successfully',
        type: 'success'
      }));
      fetchPatients();
    } catch (error: any) {
      dispatch(addNotification({
        message: error.response?.data?.message || 'Failed to archive patient',
        type: 'error'
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'archived':
        return 'error';
      default:
        return 'default';
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h1">
          Patients
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/patients/new')}
        >
          Add Patient
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Box display="flex" gap={2}>
          <TextField
            placeholder="Search patients..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ flexGrow: 1 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <Select
              value={status}
              onChange={handleStatusChange}
              displayEmpty
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">Loading...</TableCell>
              </TableRow>
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No patients found</TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow key={patient._id}>
                  <TableCell>
                    {patient.firstName} {patient.lastName}
                  </TableCell>
                  <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={patient.status}
                      color={getStatusColor(patient.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => navigate(`/patients/${patient._id}/medical`)}
                      title="Medical History"
                    >
                      <MedicalIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => navigate(`/patients/${patient._id}/edit`)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(patient._id)}
                      title="Archive"
                      disabled={patient.status === 'archived'}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </TableContainer>
    </Box>
  );
};

export default PatientList; 