import './ErrorBanner.css';

const ErrorBanner = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-banner">
      <div className="error-banner__content">
        <span className="error-banner__icon">⚠️</span>
        <span className="error-banner__message">{message}</span>
      </div>
      {onClose && (
        <button className="error-banner__close" onClick={onClose} aria-label="Close error">
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;
