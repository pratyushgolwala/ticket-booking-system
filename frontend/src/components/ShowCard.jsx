import { Link } from 'react-router-dom';
import { formatDateTime } from '../utils/format';
import './ShowCard.css';

const ShowCard = ({ show, isRecommended }) => {
  const availableSeats = show.total_seats; // Would need to calculate from seats if we had the data
  
  return (
    <div className="show-card">
      {isRecommended && (
        <div className="show-card__ribbon">
          <span>⭐ Recommended</span>
        </div>
      )}
      
      <div className="show-card__header">
        <h3 className="show-card__title">{show.name}</h3>
      </div>
      
      <div className="show-card__details">
        <div className="show-card__detail">
          <span className="show-card__detail-icon">📅</span>
          <span className="show-card__detail-text">{formatDateTime(show.start_time)}</span>
        </div>
        
        <div className="show-card__detail">
          <span className="show-card__detail-icon">💺</span>
          <span className="show-card__detail-text">{show.total_seats} seats</span>
        </div>
      </div>
      
      <Link 
        to={`/booking/${show.id}`} 
        className="show-card__button"
      >
        View Seats
      </Link>
    </div>
  );
};

export default ShowCard;
