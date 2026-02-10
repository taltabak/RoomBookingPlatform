import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { apiClient } from '@/api/axios.config';


interface PendingUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(false);
   const navigate = useNavigate();

  const fetchPendingUsers = async () => {
    if (user?.role !== 'ADMIN') return;
    
    setLoading(true);
    try {
      const data = await apiClient.get<PendingUser[]>('/admin/pending-users');
      setPendingUsers(data);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserApproval = async (userId: string, approve: boolean) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, {
        status: approve ? 'APPROVED' : 'REJECTED',
      });
      
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else {
      fetchPendingUsers();
    }

  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchPendingUsers();
  }, [user?.role]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
    );
  }
  return (  
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        {user?.role === 'ADMIN' && pendingUsers.length > 0 && (
          <div className="card mb-8 bg-yellow-50 border-yellow-200">
            <h2 className="text-xl font-semibold mb-4 text-yellow-800">
              Pending User Approvals ({pendingUsers.length})
            </h2>
            <div className="space-y-3">
              {pendingUsers.map((pendingUser) => (
                <div key={pendingUser.id} className="flex items-center justify-between bg-white p-4 rounded-lg border">
                  <div>
                    <h3 className="font-medium">{pendingUser.firstName} {pendingUser.lastName}</h3>
                    <p className="text-sm text-gray-600">{pendingUser.email}</p>
                    <p className="text-sm text-gray-500">Role: {pendingUser.role}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUserApproval(pendingUser.id, true)}
                      className="btn btn-primary text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUserApproval(pendingUser.id, false)}
                      className="btn btn-secondary text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link to="/rooms" className="card hover:shadow-lg transition">
            <div className="text-4xl mb-2">🏢</div>
            <h3 className="text-xl font-semibold mb-2">Browse Rooms</h3>
            <p className="text-gray-600">Find and book available rooms</p>
          </Link>

          <Link to="/bookings" className="card hover:shadow-lg transition">
            <div className="text-4xl mb-2">📅</div>
            <h3 className="text-xl font-semibold mb-2">My Bookings</h3>
            <p className="text-gray-600">View and manage your reservations</p>
          </Link>

          {(user?.role === 'ROOM_OWNER' || user?.role === 'ADMIN') && (
            <Link to="/manage-rooms" className="card hover:shadow-lg transition">
              <div className="text-4xl mb-2">🔧</div>
              <h3 className="text-xl font-semibold mb-2">Manage Rooms</h3>
              <p className="text-gray-600">Add and manage your rooms</p>
            </Link>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2 text-gray-600">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>Status:</strong> {user?.registrationStatus}</p>
            <p><strong>Can Book Multiple Rooms:</strong> {user?.canBookMultipleRooms ? 'Yes' : 'No'}</p>
            <p><strong>Max Booking Duration:</strong> {user?.maxBookingDuration} minutes</p>
          </div>
        </div>
      </main>
  );
};

export default DashboardPage;
