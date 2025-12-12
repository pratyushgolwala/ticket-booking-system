import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found__content">
        <h1 className="not-found__title">404</h1>
        <p className="not-found__message">Page not found</p>
        <p className="not-found__description">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="not-found__link">
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
