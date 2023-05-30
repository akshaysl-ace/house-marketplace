import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStatus } from '../hooks/useAuthStatus';
import Loader from './Loader';

const PrivateRoute = () => {
  const [loggedIn, checking] = useAuthStatus();
  if (checking) {
    return <Loader />;
  }
  return loggedIn ? <Outlet /> : <Navigate to='/signin' />;
};

export default PrivateRoute;
