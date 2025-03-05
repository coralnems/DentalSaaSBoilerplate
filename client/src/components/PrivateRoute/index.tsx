import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CircularProgress, Box } from '@mui/material';

import { RootState } from '@store/index';
import { setLoading, setCredentials } from '@store/slices/authSlice';
import { authApi } from '@api/services/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, token } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated && token) {
        try {
          const response = await authApi.getCurrentUser();
          dispatch(setCredentials({ user: response.user, accessToken: token }));
        } catch (error) {
          console.error('Authentication verification failed:', error);
          navigate('/login', { state: { from: location } });
        } finally {
          dispatch(setLoading(false));
        }
      } else if (!isAuthenticated && !token) {
        dispatch(setLoading(false));
        navigate('/login', { state: { from: location } });
      } else {
        dispatch(setLoading(false));
      }
    };

    verifyAuth();
  }, [isAuthenticated, token, dispatch, navigate, location]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

export default PrivateRoute; 