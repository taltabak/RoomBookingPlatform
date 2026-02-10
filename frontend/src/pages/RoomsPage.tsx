import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { searchRooms, setSearchFilters } from '../store/slices/roomsSlice';
import Layout from '../components/layout/Layout';

const RoomsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { rooms, isLoading, pagination } = useAppSelector((state) => state.rooms);
  const [filters, setFilters] = useState({
    name: '',
    location: '',
    capacity: '',
    maxPrice: '',
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    dispatch(searchRooms({ page: 1, limit: itemsPerPage }));
  }, [dispatch, itemsPerPage]);


  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams: any = { page: 1, limit: itemsPerPage }; // Reset to page 1 on new search

    if (filters.name) searchParams.name = filters.name;
    if (filters.location) searchParams.location = filters.location;
    if (filters.capacity) searchParams.capacity = parseInt(filters.capacity);
    if (filters.maxPrice) searchParams.maxPrice = parseFloat(filters.maxPrice);
    
    dispatch(setSearchFilters(searchParams));
    dispatch(searchRooms(searchParams));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && pagination && page <= pagination.totalPages) {
      const searchParams: any = {
        page,
        limit: itemsPerPage,
      };
      if (filters.name) searchParams.name = filters.name;
      if (filters.location) searchParams.location = filters.location;
      if (filters.capacity) searchParams.capacity = parseInt(filters.capacity);
      if (filters.maxPrice) searchParams.maxPrice = parseFloat(filters.maxPrice);
      dispatch(searchRooms(searchParams));
    }
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    const searchParams: any = {
      page: 1,
      limit: newLimit,
    };
    if (filters.name) searchParams.name = filters.name;
    if (filters.location) searchParams.location = filters.location;
    if (filters.capacity) searchParams.capacity = parseInt(filters.capacity);
    if (filters.maxPrice) searchParams.maxPrice = parseFloat(filters.maxPrice);
    dispatch(searchRooms(searchParams));
  };

  const handleCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Prevent negative values
    if (value === '' || parseInt(value) >= 0) {
      setFilters({ ...filters, capacity: value });
    }
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Prevent negative values
    if (value === '' || parseFloat(value) >= 0) {
      setFilters({ ...filters, maxPrice: value });
    }
  };

  const renderPaginationControls = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const { currentPage: page, totalPages, hasPrev, hasNext } = pagination;
    const pages = [];

    // Calculate page numbers to show
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);

    // Adjust if we're near the beginning or end
    if (endPage - startPage < 4) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + 4);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-8">
        <div className="text-sm text-gray-700">
          Showing {((page - 1) * pagination.itemsPerPage) + 1} to{' '}
          {Math.min(page * pagination.itemsPerPage, pagination.totalItems)} of{' '}
          {pagination.totalItems} results
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={!hasPrev}
            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Previous
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-1 rounded border hover:bg-gray-100"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2">...</span>}
            </>
          )}

          {pages.map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 rounded border ${
                pageNum === page
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {pageNum}
            </button>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-1 rounded border hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={!hasNext}
            className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Rooms</h1>

        <div className="card mb-8">
          <form onSubmit={handleSearch} className="grid md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Name
              </label>
              <input
                type="text"
                placeholder="Search by room name"
                className="input w-full"
                value={filters.name}
                onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="Search by location"
                className="input w-full"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Capacity
              </label>
              <input
                type="number"
                placeholder="Minimum capacity"
                className="input w-full"
                min="0"
                value={filters.capacity}
                onChange={handleCapacityChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <input
                type="number"
                placeholder="Maximum price/hour"
                className="input w-full"
                min="0"
                step="0.01"
                value={filters.maxPrice}
                onChange={handleMaxPriceChange}
              />
            </div>

            <div className="flex items-end">
              <button type="submit" className="btn btn-primary w-full">
                Search
              </button>
            </div>
          </form>

          {/* Items per page selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Items per page:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {pagination && (
              <div className="text-sm text-gray-600">
                Total: {pagination.totalItems} rooms
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms?.map((room) => (
                <Link key={room.id} to={`/rooms/${room.id}`} className="card hover:shadow-lg transition">
                  <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                  <p className="text-gray-600 mb-2">{room.description}</p>
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>📍 {room.location}</p>
                    <p>👥 Capacity: {room.capacity}</p>
                    <p>💰 ${room.price}/hour</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {room.amenities.slice(0, 3).map((amenity, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            {renderPaginationControls()}
          </>
        )}

        {!isLoading && rooms?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No rooms found matching your criteria</p>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default RoomsPage;
