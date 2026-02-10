import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import Layout from '../layout/Layout';

const ProtectedRoute: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const [checking, setChecking] = React.useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken && !isAuthenticated) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          // Token is invalid, remove tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } else if (!accessToken) {
        // No token found, cleanup
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      setChecking(false);
    };

    checkAuth();
  }, [dispatch, isAuthenticated]);

  // Also check on component mount if token exists but user is not authenticated
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !isAuthenticated && !checking && !isLoading) {
      setChecking(true);
      dispatch(fetchCurrentUser()).finally(() => setChecking(false));
    }
  }, []);

  if (checking || isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const accessToken = localStorage.getItem('accessToken');
  const hasValidAuth = isAuthenticated && accessToken;

  return hasValidAuth ? (
    <Layout>
      <Outlet />
    </Layout>
  ) : (
    <Navigate to="/login" replace />
  );
};

export default ProtectedRoute;
