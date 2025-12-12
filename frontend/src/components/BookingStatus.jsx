import './BookingStatus.css';

const BookingStatus = ({ status, bookingId, expiresAt }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'CONFIRMED':
        return 'booking-status--confirmed';
      case 'PENDING':
        return 'booking-status--pending';
      case 'FAILED':
        return 'booking-status--failed';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'CONFIRMED':
        return '✓';
      case 'PENDING':
        return '⏳';
      case 'FAILED':
        return '✗';
      default:
        return '';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'CONFIRMED':
        return `Booking Confirmed! Booking ID: ${bookingId}`;
      case 'PENDING':
        return `Booking Pending... Booking ID: ${bookingId}. Complete payment within 2 minutes.`;
      case 'FAILED':
        return 'Booking Failed. Please try again.';
      default:
        return '';
    }
  };

  return (
    <div className={`booking-status ${getStatusClass()}`}>
      <span className="booking-status__icon">{getStatusIcon()}</span>
      <span className="booking-status__message">{getStatusMessage()}</span>
    </div>
  );
};

export default BookingStatus;
