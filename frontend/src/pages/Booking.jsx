import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { bookSeats } from '../api/api';
import SeatGrid from '../components/SeatGrid';
import BookingStatus from '../components/BookingStatus';
import Loading from '../components/Loading';
import ErrorBanner from '../components/ErrorBanner';
import { formatDateTime } from '../utils/format';
import { validateSeatSelection } from '../utils/validators';
import './Booking.css';

const Booking = () => {
  const { id } = useParams();
  const { auth, getShowById, fetchSeats, getSeatsForShow, updateSeatStatus, addBooking } = useApp();
  
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    loadShowAndSeats();
  }, [id]);

  const loadShowAndSeats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get show from context
      const showData = getShowById(id);
      setShow(showData);

      // Check if seats are cached
      const cachedSeats = getSeatsForShow(id);
      if (cachedSeats) {
        setSeats(cachedSeats);
        setLoading(false);
      } else {
        // Fetch seats from API
        const seatsData = await fetchSeats(id);
        setSeats(seatsData);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    setSelectedSeats(prev => {
      if (prev.includes(seat.seat_no)) {
        return prev.filter(s => s !== seat.seat_no);
      } else {
        return [...prev, seat.seat_no];
      }
    });
  };

  const handleConfirmBooking = async () => {
    // Validate selection
    const validation = validateSeatSelection(selectedSeats);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setBookingLoading(true);
    setError(null);
    setBookingResult(null);

    try {
      const payload = {
        seat_nos: selectedSeats,
        user_id: auth.user.id,
        immediate_confirm: true
      };

      const result = await bookSeats(id, payload);
      
      // Update seat status in cache
      updateSeatStatus(id, selectedSeats, 'BOOKED');
      
      // Update local seats state
      setSeats(prev => prev.map(seat =>
        selectedSeats.includes(seat.seat_no)
          ? { ...seat, status: 'BOOKED' }
          : seat
      ));

      // Add to bookings history
      addBooking({
        ...result,
        show_name: show.name,
        seat_nos: selectedSeats
      });

      setBookingResult(result);
      setSelectedSeats([]);
      
    } catch (err) {
      setError(err.message);
      
      // Refresh seats to get updated status from backend
      try {
        const freshSeats = await fetchSeats(id);
        setSeats(freshSeats);
        
        // Clear selection of conflicting seats
        const availableSeatNos = freshSeats
          .filter(s => s.status === 'AVAILABLE')
          .map(s => s.seat_no);
        
        setSelectedSeats(prev => 
          prev.filter(seatNo => availableSeatNos.includes(seatNo))
        );
      } catch (refreshErr) {
        console.error('Failed to refresh seats:', refreshErr);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const availableSeatsCount = seats.filter(s => s.status === 'AVAILABLE').length;
  const selectedSeatsCount = selectedSeats.length;

  if (loading) {
    return <Loading message="Loading seats..." />;
  }

  if (!show) {
    return (
      <div className="booking__container">
        <ErrorBanner message="Show not found" />
        <Link to="/" className="booking__back-link">← Back to shows</Link>
      </div>
    );
  }

  return (
    <div className="booking">
      <div className="booking__container">
        <Link to="/" className="booking__back-link">← Back to shows</Link>

        <div className="booking__header">
          <h1 className="booking__title">{show.name}</h1>
          <p className="booking__datetime">{formatDateTime(show.start_time)}</p>
          <p className="booking__availability">
            {availableSeatsCount} of {show.total_seats} seats available
          </p>
        </div>

        {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
        {bookingResult && <BookingStatus status={bookingResult.status} bookingId={bookingResult.id} />}

        <div className="booking__content">
          <div className="booking__seats">
            <h2 className="booking__section-title">Select Your Seats</h2>
            <SeatGrid
              seats={seats}
              selectedSeats={selectedSeats}
              onSeatClick={handleSeatClick}
              disabled={bookingLoading}
            />
          </div>

          {selectedSeatsCount > 0 && (
            <div className="booking__panel">
              <h3 className="booking__panel-title">Booking Summary</h3>
              
              <div className="booking__panel-section">
                <span className="booking__panel-label">Selected Seats:</span>
                <div className="booking__selected-seats">
                  {selectedSeats.map(seatNo => (
                    <span key={seatNo} className="booking__selected-seat">
                      {seatNo}
                    </span>
                  ))}
                </div>
              </div>

              <div className="booking__panel-section">
                <span className="booking__panel-label">Total Seats:</span>
                <span className="booking__panel-value">{selectedSeatsCount}</span>
              </div>

              <button
                className="booking__confirm-btn"
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sticky panel */}
      {selectedSeatsCount > 0 && (
        <div className="booking__mobile-panel">
          <div className="booking__mobile-panel-info">
            <span className="booking__mobile-panel-count">{selectedSeatsCount} seat{selectedSeatsCount > 1 ? 's' : ''}</span>
            <span className="booking__mobile-panel-seats">
              {selectedSeats.join(', ')}
            </span>
          </div>
          <button
            className="booking__mobile-panel-btn"
            onClick={handleConfirmBooking}
            disabled={bookingLoading}
          >
            {bookingLoading ? 'Booking...' : 'Confirm'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Booking;
