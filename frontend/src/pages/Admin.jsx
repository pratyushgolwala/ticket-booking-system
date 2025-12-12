import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createShow as createShowAPI } from '../api/api';
import ShowCard from '../components/ShowCard';
import ErrorBanner from '../components/ErrorBanner';
import { validateShowForm } from '../utils/validators';
import './Admin.css';

const Admin = () => {
  const { shows, addShow } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    start_time: '',
    total_seats: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate form
    const validation = validateShowForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    
    try {
      const showData = {
        name: formData.name,
        start_time: new Date(formData.start_time).toISOString(),
        total_seats: parseInt(formData.total_seats)
      };

      const newShow = await createShowAPI(showData);
      
      // Add to context cache
      addShow(newShow);
      
      // Reset form
      setFormData({
        name: '',
        start_time: '',
        total_seats: ''
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin">
      <div className="admin__container">
        <h1 className="admin__title">Admin Panel</h1>
        <p className="admin__subtitle">Create and manage shows</p>

        <div className="admin__content">
          <div className="admin__form-section">
            <div className="admin__form-card">
              <h2 className="admin__form-title">Create New Show</h2>
              
              {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
              
              {success && (
                <div className="admin__success">
                  ✓ Show created successfully!
                </div>
              )}

              <form onSubmit={handleSubmit} className="admin__form">
                <div className="admin__form-group">
                  <label htmlFor="name" className="admin__label">
                    Show Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`admin__input ${errors.name ? 'admin__input--error' : ''}`}
                    placeholder="e.g., Rock Concert 2025"
                  />
                  {errors.name && <span className="admin__error">{errors.name}</span>}
                </div>

                <div className="admin__form-group">
                  <label htmlFor="start_time" className="admin__label">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    id="start_time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className={`admin__input ${errors.start_time ? 'admin__input--error' : ''}`}
                  />
                  {errors.start_time && <span className="admin__error">{errors.start_time}</span>}
                </div>

                <div className="admin__form-group">
                  <label htmlFor="total_seats" className="admin__label">
                    Total Seats * (1-200)
                  </label>
                  <input
                    type="number"
                    id="total_seats"
                    name="total_seats"
                    value={formData.total_seats}
                    onChange={handleChange}
                    className={`admin__input ${errors.total_seats ? 'admin__input--error' : ''}`}
                    placeholder="e.g., 50"
                    min="1"
                    max="200"
                  />
                  {errors.total_seats && <span className="admin__error">{errors.total_seats}</span>}
                </div>

                <button
                  type="submit"
                  className="admin__submit"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Show'}
                </button>
              </form>
            </div>
          </div>

          <div className="admin__shows-section">
            <h2 className="admin__section-title">All Shows ({shows.length})</h2>
            
            {shows.length === 0 ? (
              <div className="admin__empty">
                <span className="admin__empty-icon">🎭</span>
                <p>No shows created yet</p>
              </div>
            ) : (
              <div className="admin__shows-grid">
                {shows.map(show => (
                  <ShowCard key={show.id} show={show} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
