import { forwardRef } from 'react';
import './Seat.css';

const Seat = forwardRef(({ seat, isSelected, onClick, disabled }, ref) => {
  const getClassName = () => {
    const classes = ['seat'];
    
    if (seat.status === 'AVAILABLE') {
      classes.push('seat--available');
      if (isSelected) classes.push('seat--selected');
    } else {
      classes.push('seat--unavailable');
    }
    
    if (disabled) classes.push('seat--disabled');
    
    return classes.join(' ');
  };

  const handleClick = () => {
    if (!disabled && seat.status === 'AVAILABLE') {
      onClick();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      ref={ref}
      className={getClassName()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || seat.status !== 'AVAILABLE'}
      aria-label={`Seat ${seat.seat_no}, ${seat.status}${isSelected ? ', selected' : ''}`}
      type="button"
    >
      <span className="seat__number">{seat.seat_no}</span>
    </button>
  );
});

Seat.displayName = 'Seat';

export default Seat;
