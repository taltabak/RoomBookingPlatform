// import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import RoomsPage from './pages/RoomsPage';
import RoomDetailsPage from './pages/RoomDetailsPage';
import BookingsPage from './pages/BookingsPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ManageRoomsPage from './pages/ManageRoomsPage';
import Layout from './components/layout/Layout';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={
            <Layout>
              <LoginPage />
            </Layout>
          } />
          <Route path="/register" element={
            <Layout>
              <RegisterPage />
            </Layout>
          } />
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/rooms/:id" element={<RoomDetailsPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/manage-rooms" element={<ManageRoomsPage />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
