import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import DashboardPage from '../pages/DashboardPage';
import { useAppSelector } from '../store/hooks';

const HomePage: React.FC = () => {
  // Check if user is logged in using Redux state
  const isLoggedIn = useAppSelector((state) => state.auth.isAuthenticated);

  // Dashboard content for logged-in users
  const renderDashboard = () => (
    <DashboardPage />
  );

  // Landing page content for non-logged-in users
  const renderLandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Book Meeting Rooms Instantly
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find and reserve the perfect room for your meetings, events, and collaborations.
            Real-time availability, instant bookings, and seamless management.
          </p>
          <div className="space-x-4">
            <Link to="/login" className="btn btn-primary text-lg px-8 py-3">
              Login
            </Link>
            <Link to="/register" className="btn btn-secondary text-lg px-8 py-3">
              Get Started
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
  
  return (
    <Layout>
      {isLoggedIn ? renderDashboard() : renderLandingPage()}
    </Layout>
  );
};

export default HomePage;
