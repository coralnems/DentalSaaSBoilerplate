import { Box, Typography, Container } from '@mui/material';
import { useParams } from 'react-router-dom';

const PaymentDetails = () => {
  const { id } = useParams();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Payment Details
        </Typography>
        <Typography variant="body1">
          Details for payment ID: {id}
        </Typography>
      </Box>
    </Container>
  );
};

export default PaymentDetails; 