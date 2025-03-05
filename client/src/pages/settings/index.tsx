import { Box, Typography, Container } from '@mui/material';

const Settings = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1">
          Application settings and preferences will be configured here.
        </Typography>
      </Box>
    </Container>
  );
};

export default Settings; 