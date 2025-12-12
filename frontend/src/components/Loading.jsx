import './Loading.css';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="loading">
      <div className="loading__spinner"></div>
      <p className="loading__message">{message}</p>
    </div>
  );
};

export default Loading;
