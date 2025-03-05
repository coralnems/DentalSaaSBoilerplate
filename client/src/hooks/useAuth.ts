import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const { user, token, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  return {
    user: user as User | null,
    token,
    isAuthenticated,
  };
}; 