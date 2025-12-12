import { useRef, useEffect } from 'react';
import Seat from './Seat';
import './SeatGrid.css';

const SeatGrid = ({ seats, selectedSeats, onSeatClick, disabled = false }) => {
  const seatRefs = useRef({});

  // Determine grid columns based on seat count
  const getGridColumns = () => {
    const totalSeats = seats.length;
    if (totalSeats <= 20) return 4;
    if (totalSeats <= 50) return 5;
    return 6;
  };

  // Cleanup refs on unmount
  useEffect(() => {
    return () => {
      seatRefs.current = {};
    };
  }, []);

  const handleSeatClick = (seat) => {
    if (disabled || seat.status !== 'AVAILABLE') return;
    onSeatClick(seat);
    
    // DOM manipulation for immediate visual feedback
    const seatElement = seatRefs.current[seat.seat_no];
    if (seatElement) {
      const isSelected = selectedSeats.includes(seat.seat_no);
      if (isSelected) {
        seatElement.classList.remove('seat--selected');
      } else {
        seatElement.classList.add('seat--selected');
      }
    }
  };

  const gridColumns = getGridColumns();

  return (
    <div className="seat-grid">
      <div className="seat-grid__legend">
        <div className="seat-grid__legend-item">
          <div className="seat-grid__legend-box seat-grid__legend-box--available"></div>
          <span>Available</span>
        </div>
        <div className="seat-grid__legend-item">
          <div className="seat-grid__legend-box seat-grid__legend-box--selected"></div>
          <span>Selected</span>
        </div>
        <div className="seat-grid__legend-item">
          <div className="seat-grid__legend-box seat-grid__legend-box--unavailable"></div>
          <span>Booked/Reserved</span>
        </div>
      </div>

      <div 
        className="seat-grid__container"
        style={{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }}
      >
        {seats.map((seat) => (
          <Seat
            key={seat.id}
            seat={seat}
            isSelected={selectedSeats.includes(seat.seat_no)}
            onClick={() => handleSeatClick(seat)}
            disabled={disabled}
            ref={(el) => {
              if (el) seatRefs.current[seat.seat_no] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SeatGrid;
