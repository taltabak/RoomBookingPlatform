import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bookingsApi, CreateBookingData } from '../../api/bookings.api';
import { Booking } from '../../types';

interface BookingsState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  selectedBooking: null,
  isLoading: false,
  error: null,
};

export const fetchMyBookings = createAsyncThunk(
  'bookings/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.getMyBookings();
      return response.bookings;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch bookings');
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/create',
  async (data: CreateBookingData, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.create(data);
      return response.booking;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create booking');
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await bookingsApi.cancel(id);
      return response.booking;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel booking');
    }
  }
);

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.unshift(action.payload);
    },
    updateBooking: (state, action: PayloadAction<Booking>) => {
      const index = state.bookings.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
      if (state.selectedBooking?.id === action.payload.id) {
        state.selectedBooking = action.payload;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch my bookings
    builder.addCase(fetchMyBookings.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMyBookings.fulfilled, (state, action) => {
      state.bookings = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchMyBookings.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create booking
    builder.addCase(createBooking.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createBooking.fulfilled, (state, action) => {
      state.bookings.unshift(action.payload);
      state.isLoading = false;
    });
    builder.addCase(createBooking.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Cancel booking
    builder.addCase(cancelBooking.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(cancelBooking.fulfilled, (state, action) => {
      const index = state.bookings.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
      state.isLoading = false;
    });
    builder.addCase(cancelBooking.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { addBooking, updateBooking, clearError } = bookingsSlice.actions;
export default bookingsSlice.reducer;
