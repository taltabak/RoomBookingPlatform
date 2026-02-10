import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/axios.config';
import { useWebSocket } from '../hooks/useWebSocket';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  booking?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    status: string;
  };
}

interface ScheduleViewProps {
  roomId: string;
  startDate?: Date;
  endDate?: Date;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ roomId, startDate }) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [bookingModal, setBookingModal] = useState<{ isOpen: boolean; slot?: Slot }>({ isOpen: false });
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Generate available dates (today to 7 days from today)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  const fetchSlots = async () => {
    setLoading(true);
    try {      
      const response = await apiClient.get<{ slots: Slot[] }>(`/slots/room/${roomId}?date=${selectedDate}`);
      if (response.slots && Array.isArray(response.slots)) {
        setSlots(response.slots);
      } else {
        setSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [roomId, selectedDate]);

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // If HH:MM format is returned, just return it
    if (/^\d{2}:\d{2}$/.test(timeString)) {
      return timeString;
    }
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const availableDates = generateAvailableDates();

  const handleBookSlot = (slot: Slot) => {
    setBookingModal({ isOpen: true, slot });
    setBookingPurpose('');
  };

  
  const confirmBooking = async () => {
    if (!bookingModal.slot || !bookingPurpose.trim()) return;

    setBookingLoading(true);
    try {
      const bookingData = {
        roomId,
        slotId: bookingModal.slot.id,
        date: selectedDate,
        startTime: formatTime(bookingModal.slot.startTime),
        endTime: formatTime(bookingModal.slot.endTime),
        purpose: bookingPurpose.trim()
      };

      await apiClient.post('/bookings', bookingData);
      
      setBookingModal({ isOpen: false });
      setBookingPurpose('');
      // Note: fetchSlots will be called automatically via WebSocket
    } catch (error) {
      console.error('Error booking slot:', error);
      alert('Failed to book slot. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const closeModal = () => {
    setBookingModal({ isOpen: false });
    setBookingPurpose('');
  };
  
  const { isConnected } = useWebSocket(roomId, {
    onMessage: (data) => {
      if (data.type === 'booking_created' || 
          data.type === 'booking_cancelled' || 
          data.type === 'slot_booked' || 
          data.type === 'slot_cancelled') {
        // Refresh slots when booking changes occur
        fetchSlots();
      }
    },
    onConnect: () => {
      console.log('Connected to WebSocket for room:', roomId);
    },
    onDisconnect: () => {
      console.log('Disconnected from WebSocket');
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
        <select
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          {availableDates.map((date) => (
            <option key={date} value={date}>
              {formatDate(date)}
            </option>
          ))}
        </select>
      </div>

      {/* WebSocket Status Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Live updates active' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">
          Schedule for {formatDate(selectedDate)}
        </h3>
        
        {!Array.isArray(slots) || slots.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No slots available for this date</p>
        ) : (
          <div className="grid gap-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  slot.isBooked
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200 hover:bg-green-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        slot.isBooked
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {slot.isBooked ? 'Booked' : 'Available'}
                    </span>
                  </div>
                  
                  {slot.booking && (
                    <div className="text-sm text-gray-600">
                      Booked by: {slot.booking.user.firstName} {slot.booking.user.lastName}
                    </div>
                  )}
                  
                  {!slot.isBooked && (
                    <button 
                      onClick={() => handleBookSlot(slot)}
                      className="btn btn-primary btn-sm"
                    >
                      Book This Slot
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-200 border border-green-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-200 border border-red-300 rounded"></div>
          <span>Booked</span>
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Book Time Slot</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Slot
                </label>
                <p className="text-gray-600">
                  {bookingModal.slot && formatTime(bookingModal.slot.startTime)} - {bookingModal.slot && formatTime(bookingModal.slot.endTime)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <p className="text-gray-600">{formatDate(selectedDate)}</p>
              </div>
              
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="purpose"
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                  placeholder="Enter the purpose of your booking..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  rows={3}
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={bookingLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                disabled={!bookingPurpose.trim() || bookingLoading}
                className="btn btn-primary"
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
