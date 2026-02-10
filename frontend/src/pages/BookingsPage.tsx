import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyBookings, cancelBooking } from '../store/slices/bookingsSlice';
import { format } from 'date-fns';

const BookingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { bookings, isLoading } = useAppSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchMyBookings());
  }, [dispatch]);

  const handleCancel = async (id: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      await dispatch(cancelBooking(id));
    }
  };

  return (
    
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No bookings yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="card">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {booking.room?.name || 'Room'}
                    </h3>
                    <div className="space-y-1 text-gray-600">
                      <p>📅 Date: {format(new Date(booking.date), 'MMM dd, yyyy')}</p>
                      <p>🕐 Time: {booking.startTime} - {booking.endTime}</p>
                      <p>📍 Location: {booking.room?.location}</p>
                      <p>
                        Status:{' '}
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  {booking.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(booking.id)}
                      className="btn btn-danger"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default BookingsPage;
