import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Header.css';

const Header = () => {
  const { auth } = useApp();

  return (
    <header className="header">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <span className="header__logo-icon">🎫</span>
          <span className="header__logo-text">TicketHub</span>
        </Link>
        
        <nav className="header__nav">
          <Link to="/" className="header__nav-link">Shows</Link>
          <Link to="/admin" className="header__nav-link">Admin</Link>
        </nav>

        <div className="header__user">
          <span className="header__user-icon">👤</span>
          <span className="header__user-name">{auth.user?.name || 'Guest'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
