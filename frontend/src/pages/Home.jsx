import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import ShowCard from '../components/ShowCard';
import Loading from '../components/Loading';
import ErrorBanner from '../components/ErrorBanner';
import './Home.css';

const Home = () => {
  const { shows, showsLoading, showsError, fetchShows } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if shows are empty (cache-first approach)
    if (shows.length === 0) {
      fetchShows().catch((err) => {
        setError(err.message);
      });
    }
  }, [shows.length, fetchShows]);

  const filteredShows = shows.filter(show =>
    show.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Randomly mark some shows as recommended
  const showsWithRecommendation = filteredShows.map((show, index) => ({
    ...show,
    isRecommended: index % 3 === 0 // Every 3rd show is recommended
  }));

  return (
    <div className="home">
      <div className="home__hero">
        <div className="home__hero-content">
          <h1 className="home__hero-title">Book Your Tickets</h1>
          <p className="home__hero-subtitle">
            Find and book tickets for amazing shows
          </p>
          
          <div className="home__search">
            <input
              type="text"
              placeholder="Search for shows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="home__search-input"
            />
            <span className="home__search-icon">🔍</span>
          </div>
        </div>
      </div>

      <div className="home__container">
        {error && <ErrorBanner message={error} onClose={() => setError(null)} />}
        {showsError && <ErrorBanner message={showsError} />}

        {showsLoading ? (
          <Loading message="Loading shows..." />
        ) : filteredShows.length === 0 ? (
          <div className="home__empty">
            <span className="home__empty-icon">🎭</span>
            <p className="home__empty-text">
              {searchTerm ? 'No shows found matching your search' : 'No shows available'}
            </p>
          </div>
        ) : (
          <div className="home__grid">
            {showsWithRecommendation.map((show) => (
              <ShowCard 
                key={show.id} 
                show={show} 
                isRecommended={show.isRecommended}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
