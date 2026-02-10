import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMyRooms, createRoom, updateRoom, deleteRoom } from '../store/slices/roomsSlice';
import { Room } from '../types';
import { Link } from 'react-router-dom';


const ManageRoomsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { myRooms, isLoading, error } = useAppSelector((state) => state.rooms);
  const { user } = useAppSelector((state) => state.auth);
  
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Room | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 1,
    location: '',
    amenities: [] as string[],
    price: 0,
    imageUrl: "https://images.pexels.com/photos/1669799/pexels-photo-1669799.jpeg"
  });

  const amenitiesList = ['WiFi', 'Projector', 'Whiteboard', 'AC', 'Audio System', 'Video Conferencing'];

  useEffect(() => {
    dispatch(fetchMyRooms());
  }, [dispatch]);

  const userRooms = user?.role === 'ADMIN' 
    ? myRooms 
    : myRooms.filter(room => room.ownerId === user?.id);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === 'amenities') {
      setFormData(prev => ({
        ...prev,
        amenities: checked 
          ? [...prev.amenities, value]
          : prev.amenities.filter(amenity => amenity !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await dispatch(updateRoom({ id: editingRoom.id, room: formData })).unwrap();
        setSuccessMessage('Room updated successfully!');
      } else {
        await dispatch(createRoom(formData)).unwrap();
        setSuccessMessage('Room created successfully!');
      }
      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Failed to save room:', err);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      capacity: room.capacity,
      description: room.description || '',
      amenities: room.amenities || [],
      location: room.location || '',
      price: room.price || 0,
      imageUrl: room.imageUrl || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (roomId: string) => {
    try {
      await dispatch(deleteRoom(roomId)).unwrap();
      setDeleteConfirm(null);
      setSuccessMessage('Room deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to delete room:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: 1,
      description: '',
      amenities: [],
      location: '',
      price: 0,
      imageUrl: "https://images.pexels.com/photos/1669799/pexels-photo-1669799.jpeg"
    });
    setEditingRoom(null);
    setShowForm(false);
  };

  const canManageRoom = (room: any) => {
    return user?.role === 'ADMIN' || room.ownerId === user?.id;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Manage Rooms</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Add New Room
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : userRooms.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">
              {user?.role === 'ADMIN' 
                ? 'No rooms found in the system. Create the first room!'
                : 'You haven\'t created any rooms yet. Create your first room!'
              }
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Create First Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRooms.map((room) => (
              <div key={room.id} className="card">
                <Link key={room.id} to={`/rooms/${room.id}`} className="card hover:shadow-lg transition">
                  {room.imageUrl && (
                    <img 
                      src={room.imageUrl} 
                      alt={room.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold">{room.name}</h3>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                      Capacity: {room.capacity}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-gray-600 mb-4">
                    {room.description && (
                      <p className="text-sm">{room.description}</p>
                    )}
                    {room.location && (
                      <p className="text-sm">📍 {room.location}</p>
                    )}
                    {room.price && room.price > 0 && (
                      <p className="text-lg font-semibold text-primary-600">
                        ${room.price}/hour
                      </p>
                    )}
                    {room.amenities && room.amenities.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((amenity: string) => (
                            <span key={amenity} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>

                {canManageRoom(room) && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEdit(room)}
                      className="btn btn-secondary flex-1"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(room)}
                      className="btn btn-danger flex-1"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto m-4">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h2>
                <button 
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Room Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price per Hour ($)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Image URL
                    </label>
                    <input
                      type="url"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amenities
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {amenitiesList.map(amenity => (
                        <label key={amenity} className="flex items-center">
                          <input
                            type="checkbox"
                            name="amenities"
                            value={amenity}
                            checked={formData.amenities.includes(amenity)}
                            onChange={handleInputChange}
                            className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="text-sm">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="btn btn-secondary flex-1"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={isLoading || !formData.name.trim() || formData.capacity < 1}
                  >
                    {isLoading ? 'Saving...' : (editingRoom ? 'Update Room' : 'Create Room')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md m-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete "{deleteConfirm.name}"?
                </p>
                <p className="text-red-600 text-sm font-medium mb-6">
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteConfirm(null)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDelete(deleteConfirm.id)}
                    className="btn btn-danger flex-1"
                  >
                    Delete Room
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageRoomsPage;
