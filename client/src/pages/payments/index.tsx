import { Box, Typography, Container } from '@mui/material';

const Payments = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Payments
        </Typography>
        <Typography variant="body1">
          Payment management system will be implemented here.
        </Typography>
      </Box>
    </Container>
  );
};

export default Payments; 