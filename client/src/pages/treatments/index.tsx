import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Snackbar,
  OutlinedInput,
  ListItemText,
  Checkbox,
  SelectChangeEvent,
  Autocomplete,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  TrendingUp,
  AttachMoney,
  LocalHospital,
  Category,
  Timer,
  BarChart as ChartIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  FileOpen as ChartIcon2,
  Info as InfoIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';

// Mock data for treatments
const mockTreatments = [
  {
    _id: '1',
    name: 'Cleaning',
    description: 'Regular dental cleaning procedure',
    category: 'preventive',
    duration: 30,
    price: 120,
    requiredEquipment: ['Ultrasonic scaler', 'Prophy paste'],
    isActive: true,
    code: 'CLN001',
  },
  {
    _id: '2',
    name: 'Filling',
    description: 'Dental filling procedure',
    category: 'restorative',
    duration: 45,
    price: 200,
    requiredEquipment: ['Dental drill', 'Composite resin'],
    isActive: true,
    code: 'FIL002',
  },
  {
    _id: '3',
    name: 'Root Canal',
    description: 'Root canal therapy',
    category: 'endodontic',
    duration: 90,
    price: 800,
    requiredEquipment: ['Endodontic files', 'Gutta-percha'],
    isActive: true,
    code: 'RCT003',
  },
  {
    _id: '4',
    name: 'Crown',
    description: 'Dental crown placement',
    category: 'restorative',
    duration: 60,
    price: 1200,
    requiredEquipment: ['Crown prep kit', 'Temporary crown material'],
    isActive: true,
    code: 'CRN004',
  },
  {
    _id: '5',
    name: 'Extraction',
    description: 'Tooth extraction procedure',
    category: 'oral surgery',
    duration: 40,
    price: 250,
    requiredEquipment: ['Extraction forceps', 'Elevators'],
    isActive: true,
    code: 'EXT005',
  },
  {
    _id: '6',
    name: 'Whitening',
    description: 'Teeth whitening procedure',
    category: 'cosmetic',
    duration: 60,
    price: 350,
    requiredEquipment: ['Whitening gel', 'Light activator'],
    isActive: true,
    code: 'WHT006',
  },
  {
    _id: '7',
    name: 'Dental Implant',
    description: 'Implant placement procedure',
    category: 'prosthodontic',
    duration: 120,
    price: 3000,
    requiredEquipment: ['Implant kit', 'Surgical guide'],
    isActive: true,
    code: 'IMP007',
  },
  {
    _id: '8',
    name: 'Dentures',
    description: 'Full or partial denture fitting',
    category: 'prosthodontic',
    duration: 75,
    price: 1500,
    requiredEquipment: ['Impression material', 'Bite registration'],
    isActive: true,
    code: 'DEN008',
  },
];

// Mock analytics data
const mockCategoryData = [
  { name: 'Preventive', value: 120, fill: '#8884d8' },
  { name: 'Restorative', value: 210, fill: '#83a6ed' },
  { name: 'Endodontic', value: 75, fill: '#8dd1e1' },
  { name: 'Prosthodontic', value: 90, fill: '#82ca9d' },
  { name: 'Oral Surgery', value: 65, fill: '#ffc658' },
  { name: 'Cosmetic', value: 45, fill: '#ff8042' }
];

const mockRevenueData = [
  { month: 'Jan', revenue: 25000 },
  { month: 'Feb', revenue: 28000 },
  { month: 'Mar', revenue: 32000 },
  { month: 'Apr', revenue: 30000 },
  { month: 'May', revenue: 35000 },
  { month: 'Jun', revenue: 37000 },
];

const mockProceduresData = [
  { month: 'Jan', procedures: 120 },
  { month: 'Feb', procedures: 135 },
  { month: 'Mar', procedures: 150 },
  { month: 'Apr', procedures: 145 },
  { month: 'May', procedures: 160 },
  { month: 'Jun', procedures: 170 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Mock patient data
const mockPatients = [
  { _id: '1', fullName: 'John Doe', email: 'john.doe@example.com', phone: '(555) 123-4567' },
  { _id: '2', fullName: 'Jane Smith', email: 'jane.smith@example.com', phone: '(555) 987-6543' },
  { _id: '3', fullName: 'Michael Johnson', email: 'michael.j@example.com', phone: '(555) 222-3333' },
  { _id: '4', fullName: 'Sarah Williams', email: 'sarah.w@example.com', phone: '(555) 444-5555' },
  { _id: '5', fullName: 'David Brown', email: 'david.b@example.com', phone: '(555) 666-7777' },
];

// Tooth condition options with colors
const toothConditions = [
  { id: 'healthy', label: 'Healthy', color: '#4caf50' },
  { id: 'caries', label: 'Caries', color: '#f44336' },
  { id: 'filled', label: 'Filled', color: '#2196f3' },
  { id: 'crown', label: 'Crown', color: '#9c27b0' },
  { id: 'missing', label: 'Missing', color: '#9e9e9e' },
  { id: 'root_canal', label: 'Root Canal', color: '#ff9800' },
  { id: 'implant', label: 'Implant', color: '#795548' },
  { id: 'bridge', label: 'Bridge', color: '#607d8b' },
];

// Interface for dental chart data
interface DentalChartData {
  [toothId: string]: {
    condition: string;
    notes: string;
  };
}

// Interface for patient dental chart
interface PatientDentalChart {
  patientId: string;
  chart: DentalChartData;
  lastUpdated: Date;
}

// Mock dental chart data - initial state with all teeth as healthy
const initialDentalChart = (): DentalChartData => {
  // Create adult teeth numbering (FDI/ISO System)
  // Upper right: 18-11, Upper left: 21-28
  // Lower right: 48-41, Lower left: 31-38
  const chart: DentalChartData = {};
  
  // Upper right (18-11)
  for (let i = 18; i >= 11; i--) {
    chart[i.toString()] = { condition: 'healthy', notes: '' };
  }
  
  // Upper left (21-28)
  for (let i = 21; i <= 28; i++) {
    chart[i.toString()] = { condition: 'healthy', notes: '' };
  }
  
  // Lower right (48-41)
  for (let i = 48; i >= 41; i--) {
    chart[i.toString()] = { condition: 'healthy', notes: '' };
  }
  
  // Lower left (31-38)
  for (let i = 31; i <= 38; i++) {
    chart[i.toString()] = { condition: 'healthy', notes: '' };
  }
  
  return chart;
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`treatment-tabpanel-${index}`}
      aria-labelledby={`treatment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Treatment category options
const categoryOptions = [
  'preventive',
  'restorative', 
  'cosmetic', 
  'orthodontic', 
  'periodontic', 
  'endodontic', 
  'prosthodontic', 
  'oral surgery',
  'pediatric',
  'other'
];

// Common dental equipment options
const equipmentOptions = [
  'Dental Chair',
  'Dental Drill',
  'Ultrasonic Scaler',
  'Suction Device',
  'Dental Explorer',
  'Dental Mirror',
  'Dental Forceps',
  'Rubber Dam',
  'Dental Curing Light',
  'Impression Trays',
  'X-Ray Machine',
  'Dental Handpiece',
  'Air Compressor',
  'Sterilizer',
  'Dental Laser',
  'Autoclave',
  'Prophy Paste',
  'Composite Resin',
  'Dental Amalgam',
  'Gutta-percha',
  'Endodontic Files',
  'Elevators',
  'Surgical Guide',
  'Impression Material',
  'Crown Prep Kit',
  'Whitening Gel',
  'Light Activator',
  'Bite Registration',
  'Temporary Crown Material',
  'Extraction Forceps'
];

// Interface for the treatment form data
interface TreatmentFormData {
  name: string;
  description: string;
  category: string;
  duration: number;
  price: number;
  code: string;
  requiredEquipment: string[];
  isActive: boolean;
  notes?: string;
  insuranceCodes?: string;
  preparationInstructions?: string;
  aftercareInstructions?: string;
}

// Initial form state
const initialFormState: TreatmentFormData = {
  name: '',
  description: '',
  category: '',
  duration: 30,
  price: 0,
  code: '',
  requiredEquipment: [],
  isActive: true,
  notes: '',
  insuranceCodes: '',
  preparationInstructions: '',
  aftercareInstructions: '',
};

const TreatmentsPage = () => {
  const theme = useTheme();
  const [treatments, setTreatments] = useState(mockTreatments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // New state for the add treatment form
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [formData, setFormData] = useState<TreatmentFormData>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dental Chart state
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [dentalChart, setDentalChart] = useState<DentalChartData>(initialDentalChart());
  const [selectedTooth, setSelectedTooth] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string>('healthy');
  const [toothNotes, setToothNotes] = useState<string>('');
  const [chartLoading, setChartLoading] = useState(false);
  const [chartSaved, setChartSaved] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Filter treatments based on search term
  const filteredTreatments = treatments.filter(
    (treatment) =>
      treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalTreatments = treatments.length;
  const totalRevenue = treatments.reduce((sum, treatment) => sum + treatment.price, 0);
  const averageDuration = Math.round(
    treatments.reduce((sum, treatment) => sum + treatment.duration, 0) / totalTreatments
  );
  const averagePrice = Math.round(totalRevenue / totalTreatments);

  // Mock fetching data
  useEffect(() => {
    const fetchTreatments = async () => {
      try {
        setLoading(true);
        // In a real application, this would call the API
        // const response = await api.get('/treatments');
        // setTreatments(response.data);
        
        // Simulate API delay
        setTimeout(() => {
          setTreatments(mockTreatments);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Error fetching treatments:', err);
        setError('Failed to load treatments. Please try again later.');
        setLoading(false);
      }
    };

    fetchTreatments();
  }, []);

  // Get treatment category counts for the pie chart
  const getCategoryData = () => {
    const categories: Record<string, number> = {};
    
    treatments.forEach(treatment => {
      const category = treatment.category;
      if (categories[category]) {
        categories[category]++;
      } else {
        categories[category] = 1;
      }
    });
    
    return Object.keys(categories).map((category, index) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: categories[category],
      fill: COLORS[index % COLORS.length]
    }));
  };

  const categoryData = getCategoryData();

  const renderCategoryChip = (category: string) => {
    const colors: Record<string, string> = {
      preventive: '#4caf50',
      restorative: '#2196f3',
      cosmetic: '#e91e63',
      orthodontic: '#9c27b0',
      periodontic: '#ff5722',
      endodontic: '#ff9800',
      prosthodontic: '#3f51b5',
      'oral surgery': '#f44336',
      pediatric: '#00bcd4',
      other: '#607d8b',
    };

    return (
      <Chip
        label={category.charAt(0).toUpperCase() + category.slice(1)}
        size="small"
        sx={{
          backgroundColor: colors[category] || colors.other,
          color: 'white',
          fontWeight: 'medium',
          fontSize: '0.75rem',
        }}
      />
    );
  };

  const renderStatCard = (
    icon: React.ReactNode,
    title: string,
    value: string | number,
    color: string
  ) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Box
            sx={{
              backgroundColor: `${color}20`,
              borderRadius: '50%',
              p: 1,
              mr: 2,
              color: color,
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle form input changes - updated type definition
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string | string[]>) => {
    const { name, value } = e.target;
    if (!name) return;
    
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error for this field when user makes changes
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  // Handle equipment multi-select - updated type definition
  const handleEquipmentChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      requiredEquipment: typeof value === 'string' ? value.split(',') : value,
    });
  };
  
  // Validate form data
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Treatment name is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    if (formData.duration <= 0) {
      errors.duration = 'Duration must be greater than 0';
    }
    
    if (formData.price < 0) {
      errors.price = 'Price cannot be negative';
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Treatment code is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real application, this would call the API to create a treatment
      // await api.post('/treatments', formData);
      
      // Simulate API delay and success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the new treatment to the state with a mock ID
      const newTreatment = {
        ...formData,
        _id: `mock-${Date.now()}`,
      };
      
      setTreatments([...treatments, newTreatment]);
      setSuccessMessage('Treatment added successfully!');
      handleCloseDialog();
    } catch (err) {
      console.error('Error adding treatment:', err);
      setError('Failed to add treatment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenAddDialog(false);
    setFormData(initialFormState);
    setFormErrors({});
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSuccessMessage(null);
  };

  // Load patient dental chart
  const loadPatientDentalChart = async (patientId: string) => {
    setChartLoading(true);
    try {
      // In a real application, this would call the API
      // const response = await api.get(`/patients/${patientId}/dental-chart`);
      // setDentalChart(response.data.chart);
      
      // For demo, we'll just set a mock chart with some conditions
      const mockChart = initialDentalChart();
      
      // Set some example conditions
      mockChart['11'] = { condition: 'crown', notes: 'Porcelain crown placed 01/2023' };
      mockChart['14'] = { condition: 'filled', notes: 'Composite filling' };
      mockChart['16'] = { condition: 'root_canal', notes: 'Root canal completed 06/2022' };
      mockChart['21'] = { condition: 'filled', notes: 'Amalgam filling' };
      mockChart['26'] = { condition: 'caries', notes: 'Needs treatment' };
      mockChart['36'] = { condition: 'missing', notes: 'Extracted 03/2021' };
      mockChart['46'] = { condition: 'implant', notes: 'Dental implant placed 08/2022' };
      
      // Simulate API delay
      setTimeout(() => {
        setDentalChart(mockChart);
        setChartLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Error loading patient dental chart:', err);
      setError('Failed to load patient dental chart. Please try again.');
      setChartLoading(false);
    }
  };

  // Handle patient selection
  const handlePatientChange = (event: any, newValue: any) => {
    setSelectedPatient(newValue);
    if (newValue) {
      loadPatientDentalChart(newValue._id);
    } else {
      setDentalChart(initialDentalChart());
    }
  };

  // Handle tooth selection
  const handleToothClick = (toothId: string) => {
    setSelectedTooth(toothId);
    setSelectedCondition(dentalChart[toothId].condition);
    setToothNotes(dentalChart[toothId].notes);
  };

  // Handle condition change
  const handleConditionChange = (event: SelectChangeEvent<string>) => {
    setSelectedCondition(event.target.value);
  };

  // Handle notes change
  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setToothNotes(event.target.value);
  };

  // Apply condition to selected tooth
  const applyCondition = () => {
    if (!selectedTooth) return;
    
    const updatedChart = { ...dentalChart };
    updatedChart[selectedTooth] = {
      condition: selectedCondition,
      notes: toothNotes,
    };
    
    setDentalChart(updatedChart);
    setChartSaved(false);
  };

  // Save dental chart
  const savePatientDentalChart = async () => {
    if (!selectedPatient) return;
    
    setChartLoading(true);
    try {
      // In a real application, this would call the API
      // await api.post(`/patients/${selectedPatient._id}/dental-chart`, {
      //   chart: dentalChart,
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage('Dental chart saved successfully!');
      setChartSaved(true);
      setChartLoading(false);
    } catch (err) {
      console.error('Error saving dental chart:', err);
      setError('Failed to save dental chart. Please try again.');
      setChartLoading(false);
    }
  };

  // Get tooth condition color
  const getToothColor = (condition: string) => {
    const conditionData = toothConditions.find(c => c.id === condition);
    return conditionData ? conditionData.color : '#4caf50';
  };

  // Render tooth in the dental chart
  const renderTooth = (toothId: string) => {
    const tooth = dentalChart[toothId];
    const isSelected = selectedTooth === toothId;
    
    return (
      <Tooltip 
        title={
          <Box>
            <Typography variant="body2">Tooth {toothId}</Typography>
            <Typography variant="body2">
              Condition: {toothConditions.find(c => c.id === tooth.condition)?.label || 'Healthy'}
            </Typography>
            {tooth.notes && <Typography variant="body2">Notes: {tooth.notes}</Typography>}
          </Box>
        } 
        arrow
      >
        <Box
          onClick={() => handleToothClick(toothId)}
          sx={{
            width: 35,
            height: 35,
            m: 0.5,
            borderRadius: '4px',
            backgroundColor: getToothColor(tooth.condition),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            border: isSelected ? `2px solid ${theme.palette.primary.dark}` : '2px solid transparent',
            boxShadow: isSelected ? '0 0 5px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 0 5px rgba(0,0,0,0.3)',
            }
          }}
        >
          <Typography variant="caption" color="white" fontWeight="bold">
            {toothId}
          </Typography>
        </Box>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Treatments
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add Treatment
        </Button>
      </Box>

      {/* Success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={successMessage}
        action={
          <IconButton size="small" color="inherit" onClick={handleSnackbarClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        aria-label="treatment tabs"
      >
        <Tab 
          icon={<LocalHospital />} 
          iconPosition="start" 
          label="Treatments" 
          id="treatment-tab-0" 
          aria-controls="treatment-tabpanel-0"
        />
        <Tab 
          icon={<ChartIcon />} 
          iconPosition="start" 
          label="Analytics" 
          id="treatment-tab-1" 
          aria-controls="treatment-tabpanel-1"
        />
        <Tab 
          icon={<ChartIcon2 />} 
          iconPosition="start" 
          label="Patient Dental Charts" 
          id="treatment-tab-2" 
          aria-controls="treatment-tabpanel-2"
        />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              {renderStatCard(
                <LocalHospital />,
                'Total Treatments',
                totalTreatments,
                theme.palette.primary.main
              )}
            </Grid>
            <Grid item xs={12} md={3}>
              {renderStatCard(
                <AttachMoney />,
                'Average Price',
                formatCurrency(averagePrice),
                theme.palette.success.main
              )}
            </Grid>
            <Grid item xs={12} md={3}>
              {renderStatCard(
                <Timer />,
                'Average Duration',
                `${averageDuration} min`,
                theme.palette.info.main
              )}
            </Grid>
            <Grid item xs={12} md={3}>
              {renderStatCard(
                <Category />,
                'Categories',
                Object.keys(
                  treatments.reduce((acc: Record<string, boolean>, t) => {
                    acc[t.category] = true;
                    return acc;
                  }, {})
                ).length,
                theme.palette.warning.main
              )}
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search treatments by name, description, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table sx={{ minWidth: 650 }} aria-label="treatments table">
              <TableHead sx={{ backgroundColor: theme.palette.primary.main + '20' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Duration (min)</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTreatments.map((treatment) => (
                  <TableRow key={treatment._id} hover>
                    <TableCell component="th" scope="row">
                      <Typography variant="body1" fontWeight="medium">
                        {treatment.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Code: {treatment.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{treatment.description}</TableCell>
                    <TableCell>{renderCategoryChip(treatment.category)}</TableCell>
                    <TableCell>{treatment.duration}</TableCell>
                    <TableCell>{formatCurrency(treatment.price)}</TableCell>
                    <TableCell>
                      <Chip
                        label={treatment.isActive ? 'Active' : 'Inactive'}
                        color={treatment.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Treatments by Category
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={({ payload }: { payload: Array<{ value: number }> }) => {
                      if (payload && payload.length > 0) {
                        const value = payload[0].value;
                        return `${value} treatments`;
                      }
                      return null;
                    }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Monthly Revenue (Last 6 Months)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis
                      tickFormatter={(value: number) => `$${value / 1000}k`}
                    />
                    <Tooltip content={({ payload }: { payload: Array<{ value: number }> }) => {
                      if (payload && payload.length > 0) {
                        const value = payload[0].value as number;
                        return `$${value.toLocaleString()}`;
                      }
                      return null;
                    }} />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Procedures (Last 6 Months)
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockProceduresData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="procedures"
                      name="Procedures"
                      fill={theme.palette.secondary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Patient Dental Charts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select a patient to view and edit their dental chart. Click on a tooth to update its condition.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={mockPatients}
                getOptionLabel={(option) => option.fullName}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Patient"
                    variant="outlined"
                    placeholder="Search patient by name"
                    fullWidth
                  />
                )}
                value={selectedPatient}
                onChange={handlePatientChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                color="primary"
                disabled={!selectedPatient || chartLoading || chartSaved}
                onClick={savePatientDentalChart}
                startIcon={chartLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ height: '56px' }}
              >
                {chartLoading ? 'Saving...' : 'Save Dental Chart'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {chartLoading && !selectedTooth ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : selectedPatient ? (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Dental Chart for {selectedPatient?.fullName}
                </Typography>
                
                {/* Upper Teeth (Maxillary) */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Upper Teeth
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* Upper Right Quadrant (18-11) */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {Array.from({ length: 8 }, (_, i) => 18 - i).map(toothId => 
                        renderTooth(toothId.toString())
                      )}
                    </Box>
                    {/* Upper Left Quadrant (21-28) */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      {Array.from({ length: 8 }, (_, i) => 21 + i).map(toothId => 
                        renderTooth(toothId.toString())
                      )}
                    </Box>
                  </Box>
                </Box>
                
                {/* Lower Teeth (Mandibular) */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Lower Teeth
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* Lower Right Quadrant (48-41) */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {Array.from({ length: 8 }, (_, i) => 48 - i).map(toothId => 
                        renderTooth(toothId.toString())
                      )}
                    </Box>
                    {/* Lower Left Quadrant (31-38) */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                      {Array.from({ length: 8 }, (_, i) => 31 + i).map(toothId => 
                        renderTooth(toothId.toString())
                      )}
                    </Box>
                  </Box>
                </Box>
                
                {/* Legend */}
                <Box sx={{ mt: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {toothConditions.map(condition => (
                    <Chip
                      key={condition.id}
                      label={condition.label}
                      sx={{ 
                        backgroundColor: condition.color,
                        color: 'white',
                        fontWeight: 'medium',
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Tooth Details
                </Typography>
                
                {selectedTooth ? (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Tooth {selectedTooth}
                    </Typography>
                    
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="condition-label">Condition</InputLabel>
                      <Select
                        labelId="condition-label"
                        value={selectedCondition}
                        label="Condition"
                        onChange={handleConditionChange}
                      >
                        {toothConditions.map(condition => (
                          <MenuItem 
                            key={condition.id} 
                            value={condition.id}
                            sx={{ 
                              '&.Mui-selected': { 
                                backgroundColor: `${condition.color}20` 
                              } 
                            }}
                          >
                            <Box 
                              sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%', 
                                backgroundColor: condition.color,
                                mr: 1 
                              }} 
                            />
                            {condition.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <TextField
                      fullWidth
                      label="Notes"
                      multiline
                      rows={4}
                      value={toothNotes}
                      onChange={handleNotesChange}
                      margin="normal"
                      placeholder="Enter any notes about this tooth"
                    />
                    
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      onClick={applyCondition}
                      sx={{ mt: 2 }}
                    >
                      Apply Changes
                    </Button>
                  </>
                ) : (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      height: '80%',
                      opacity: 0.6
                    }}
                  >
                    <InfoIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
                    <Typography variant="body1" align="center" color="text.secondary">
                      Select a tooth from the dental chart to view and edit its details
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Treatment History */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Treatment History
                </Typography>
                
                {selectedPatient ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Treatment</TableCell>
                          <TableCell>Teeth</TableCell>
                          <TableCell>Notes</TableCell>
                          <TableCell>Provider</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Mock treatment history data */}
                        <TableRow>
                          <TableCell>Apr 15, 2023</TableCell>
                          <TableCell>Root Canal</TableCell>
                          <TableCell>16</TableCell>
                          <TableCell>Successful procedure, follow-up in 2 weeks</TableCell>
                          <TableCell>Dr. Smith</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Feb 20, 2023</TableCell>
                          <TableCell>Filling</TableCell>
                          <TableCell>14, 21</TableCell>
                          <TableCell>Composite resin filling</TableCell>
                          <TableCell>Dr. Johnson</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Jan 05, 2023</TableCell>
                          <TableCell>Crown</TableCell>
                          <TableCell>11</TableCell>
                          <TableCell>Porcelain crown placed</TableCell>
                          <TableCell>Dr. Smith</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
                    Select a patient to view treatment history
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              height: '300px',
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
              p: 3
            }}
          >
            <PersonIcon sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }} />
            <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
              No Patient Selected
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary">
              Please select a patient to view and edit their dental chart
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Add Treatment Dialog */}
      <Dialog 
        open={openAddDialog}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        aria-labelledby="add-treatment-dialog"
      >
        <DialogTitle id="add-treatment-dialog">
          Add New Treatment
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Treatment Name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="code"
                label="Treatment Code"
                value={formData.code}
                onChange={handleInputChange}
                fullWidth
                required
                margin="normal"
                placeholder="e.g., CLN001"
                error={!!formErrors.code}
                helperText={formErrors.code}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                required
                multiline
                rows={2}
                margin="normal"
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl 
                fullWidth 
                margin="normal" 
                required
                error={!!formErrors.category}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  label="Category"
                >
                  {categoryOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && (
                  <FormHelperText>{formErrors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="duration"
                label="Duration (minutes)"
                value={formData.duration}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                margin="normal"
                inputProps={{ min: 1 }}
                error={!!formErrors.duration}
                helperText={formErrors.duration}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                name="price"
                label="Price ($)"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
                required
                type="number"
                margin="normal"
                inputProps={{ min: 0, step: 0.01 }}
                error={!!formErrors.price}
                helperText={formErrors.price}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="equipment-label">Required Equipment</InputLabel>
                <Select
                  labelId="equipment-label"
                  multiple
                  name="requiredEquipment"
                  value={formData.requiredEquipment}
                  onChange={handleEquipmentChange}
                  input={<OutlinedInput label="Required Equipment" />}
                  renderValue={(selected) => (selected as string[]).join(', ')}
                >
                  {equipmentOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Checkbox checked={formData.requiredEquipment.includes(option)} />
                      <ListItemText primary={option} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="insuranceCodes"
                label="Insurance Codes"
                value={formData.insuranceCodes}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                placeholder="e.g., D1110, D2150"
                helperText="Comma-separated list of insurance billing codes"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="preparationInstructions"
                label="Preparation Instructions"
                value={formData.preparationInstructions}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                placeholder="Instructions for patients before the treatment"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="aftercareInstructions"
                label="Aftercare Instructions"
                value={formData.aftercareInstructions}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                placeholder="Instructions for patients after the treatment"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="notes"
                label="Additional Notes"
                value={formData.notes}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={2}
                margin="normal"
                placeholder="Any additional notes or information about this treatment"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" margin="normal">
                <FormHelperText>Treatment Status</FormHelperText>
                <Grid container alignItems="center">
                  <Grid item>
                    <Chip
                      label="Inactive"
                      color={formData.isActive ? "default" : "error"}
                      onClick={() => setFormData({ ...formData, isActive: false })}
                      sx={{ mr: 1 }}
                    />
                  </Grid>
                  <Grid item>
                    <Chip
                      label="Active"
                      color={formData.isActive ? "success" : "default"}
                      onClick={() => setFormData({ ...formData, isActive: true })}
                    />
                  </Grid>
                </Grid>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Treatment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TreatmentsPage; 