import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { getShows as fetchShowsAPI, getSeats as fetchSeatsAPI } from '../api/api';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // Auth state (mock authentication)
  const [auth, setAuth] = useState({
    isAuthenticated: true,
    user: {
      id: 'user_' + Math.random().toString(36).substr(2, 9),
      name: 'Guest User'
    }
  });

  // Shows state
  const [shows, setShows] = useState([]);
  const [showsLoading, setShowsLoading] = useState(false);
  const [showsError, setShowsError] = useState(null);

  // Seats cache: { [showId]: seats[] }
  const [seatsCache, setSeatsCache] = useState({});

  // Bookings history
  const [bookings, setBookings] = useState([]);

  // Auth functions
  const loginMock = useCallback((name = 'Guest User') => {
    setAuth({
      isAuthenticated: true,
      user: {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        name
      }
    });
  }, []);

  const logout = useCallback(() => {
    setAuth({
      isAuthenticated: false,
      user: null
    });
  }, []);

  // Shows functions
  const fetchShows = useCallback(async () => {
    setShowsLoading(true);
    setShowsError(null);
    try {
      const data = await fetchShowsAPI();
      setShows(data);
      return data;
    } catch (error) {
      setShowsError(error.message);
      throw error;
    } finally {
      setShowsLoading(false);
    }
  }, []);

  const addShow = useCallback((show) => {
    setShows(prev => [...prev, show]);
  }, []);

  const getShowById = useCallback((id) => {
    return shows.find(show => show.id === parseInt(id));
  }, [shows]);

  // Seats functions
  const fetchSeats = useCallback(async (showId) => {
    try {
      const seats = await fetchSeatsAPI(showId);
      setSeatsCache(prev => ({
        ...prev,
        [showId]: seats
      }));
      return seats;
    } catch (error) {
      console.error('Error fetching seats:', error);
      throw error;
    }
  }, []);

  const getSeatsForShow = useCallback((showId) => {
    return seatsCache[showId] || null;
  }, [seatsCache]);

  const updateSeatsCache = useCallback((showId, seats) => {
    setSeatsCache(prev => ({
      ...prev,
      [showId]: seats
    }));
  }, []);

  const updateSeatStatus = useCallback((showId, seatNos, newStatus) => {
    setSeatsCache(prev => {
      const showSeats = prev[showId];
      if (!showSeats) return prev;

      const updatedSeats = showSeats.map(seat => 
        seatNos.includes(seat.seat_no)
          ? { ...seat, status: newStatus }
          : seat
      );

      return {
        ...prev,
        [showId]: updatedSeats
      };
    });
  }, []);

  // Bookings functions
  const addBooking = useCallback((booking) => {
    setBookings(prev => [booking, ...prev]);
  }, []);

  const value = useMemo(() => ({
    // Auth
    auth,
    loginMock,
    logout,
    
    // Shows
    shows,
    showsLoading,
    showsError,
    fetchShows,
    addShow,
    getShowById,
    
    // Seats
    seatsCache,
    fetchSeats,
    getSeatsForShow,
    updateSeatsCache,
    updateSeatStatus,
    
    // Bookings
    bookings,
    addBooking
  }), [
    auth,
    loginMock,
    logout,
    shows,
    showsLoading,
    showsError,
    fetchShows,
    addShow,
    getShowById,
    seatsCache,
    fetchSeats,
    getSeatsForShow,
    updateSeatsCache,
    updateSeatStatus,
    bookings,
    addBooking
  ]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
