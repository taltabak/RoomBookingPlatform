import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { roomsApi, SearchRoomsParams, PaginationMeta } from '../../api/rooms.api';
import { Room } from '../../types';

interface RoomsState {
  rooms: Room[];
  selectedRoom: Room | null;
  myRooms: Room[];
  isLoading: boolean;
  error: string | null;
  searchFilters: SearchRoomsParams;
  pagination: PaginationMeta | null;
}

const initialState: RoomsState = {
  rooms: [],
  selectedRoom: null,
  myRooms: [],
  isLoading: false,
  error: null,
  searchFilters: {},
  pagination: null,
};

export const searchRooms = createAsyncThunk(
  'rooms/search',
  async (params: SearchRoomsParams, { rejectWithValue }) => {
    try {
      const response = await roomsApi.search(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to search rooms');
    }
  }
);

export const fetchRoomById = createAsyncThunk(
  'rooms/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await roomsApi.getById(id);
      return response.room;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch room');
    }
  }
);

export const fetchMyRooms = createAsyncThunk(
  'rooms/fetchMyRooms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await roomsApi.getMyRooms();
      return response.rooms;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch rooms');
    }
  }
);

export const createRoom = createAsyncThunk(
  'rooms/create',
  async (roomData: any, { rejectWithValue }) => {
    try {
      const response = await roomsApi.create(roomData);
      return response.room;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create room');
    }
  }
);

export const updateRoom = createAsyncThunk(
  'rooms/update',
  async ({ id, room }: { id: string; room: any }, { rejectWithValue }) => {
    try {
      const response = await roomsApi.update(id, room);
      return response.room;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update room');
    }
  }
);

export const deleteRoom = createAsyncThunk(
  'rooms/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await roomsApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete room');
    }
  }
);

const roomsSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    setSearchFilters: (state, action: PayloadAction<SearchRoomsParams>) => {
      state.searchFilters = action.payload;
    },
    clearSelectedRoom: (state) => {
      state.selectedRoom = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      if (state.pagination) {
        state.pagination.currentPage = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Search rooms
      .addCase(searchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch room by ID
      .addCase(fetchRoomById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoomById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRoom = action.payload;
      })
      .addCase(fetchRoomById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch my rooms
      .addCase(fetchMyRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRooms = action.payload;
      })
      .addCase(fetchMyRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create room
      .addCase(createRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRooms.unshift(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update room
      .addCase(updateRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.myRooms.findIndex(room => room.id === action.payload.id);
        if (index !== -1) {
          state.myRooms[index] = action.payload;
        }
        if (state.selectedRoom?.id === action.payload.id) {
          state.selectedRoom = action.payload;
        }
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete room
      .addCase(deleteRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myRooms = state.myRooms.filter(room => room.id !== action.payload);
        if (state.selectedRoom?.id === action.payload) {
          state.selectedRoom = null;
        }
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSearchFilters, clearSelectedRoom, clearError, setCurrentPage } = roomsSlice.actions;
export default roomsSlice.reducer;
