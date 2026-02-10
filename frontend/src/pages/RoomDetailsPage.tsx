import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchRoomById } from '../store/slices/roomsSlice';
import ScheduleView from '../components/ScheduleView';
import Layout from '../components/layout/Layout';

const RoomDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { selectedRoom, isLoading } = useAppSelector((state) => state.rooms);
  const [activeTab, setActiveTab] = useState<'details' | 'schedule'>('details');

  useEffect(() => {
    if (id) {
      dispatch(fetchRoomById(id));
    }
  }, [dispatch, id]);

  if (isLoading || !selectedRoom) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">{selectedRoom.name}</h1>
              
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'details'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'schedule'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Schedule
                </button>
              </div>
            </div>

            {activeTab === 'details' && (
              <div>
                <p className="text-gray-600 mb-6">{selectedRoom.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Details</h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>📍 Location: {selectedRoom.location}</li>
                      <li>👥 Capacity: {selectedRoom.capacity} people</li>
                      <li>💰 Price: ${selectedRoom.price}/hour</li>
                      <li>✅ Status: {selectedRoom.isActive ? 'Active' : 'Inactive'}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.amenities.map((amenity, idx) => (
                        <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedRoom.owner && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Owned by</h3>
                    <p className="text-gray-600">
                      {selectedRoom.owner.firstName} {selectedRoom.owner.lastName}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'schedule' && id && (
              <div>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📡 This schedule updates automatically when bookings are made or cancelled by other users.
                  </p>
                </div>
                <ScheduleView roomId={id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RoomDetailsPage;
