import React, { useState, useEffect } from 'react';
import './styles.css';

const TherapistRecommendations = ({ clientId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark' ? true : false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [favoriteTherapists, setFavoriteTherapists] = useState(JSON.parse(localStorage.getItem('favorites')) || {});

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/recommendations?client_id=${clientId}`)
      .then((response) => response.json())
      .then((data) => setRecommendations(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, [clientId]);

  const toggleTheme = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  const sortTherapists = (order, key) => {
    const sortedRecommendations = [...recommendations].sort((a, b) => {
      if (key === 'rating') {
        return order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      } else if (key === 'name') {
        return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
    });
    setRecommendations(sortedRecommendations);
    setSortOrder(order);
  };

  const handleClick = (therapist) => {
    setSelectedTherapist(therapist);
  };

  const submitReview = () => {
    const newReview = {
      rating: userRating,
      review: userReview,
      date: new Date().toISOString(),
    };

    setSelectedTherapist((prev) => {
      const updatedTherapist = {
        ...prev,
        reviews: prev.reviews ? [...prev.reviews, newReview] : [newReview],
      };
      localStorage.setItem(`reviews_${prev.therapist_id}`, JSON.stringify(updatedTherapist.reviews));
      return updatedTherapist;
    });

    setUserRating(0);
    setUserReview('');
  };

  const toggleFavorite = (therapistId) => {
    const updatedFavorites = { ...favoriteTherapists };
    if (updatedFavorites[therapistId]) {
      delete updatedFavorites[therapistId];
    } else {
      updatedFavorites[therapistId] = true;
    }
    setFavoriteTherapists(updatedFavorites);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
  };

  const getReviews = (therapistId) => {
    const storedReviews = localStorage.getItem(`reviews_${therapistId}`);
    return storedReviews ? JSON.parse(storedReviews) : [];
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? 'filled' : ''}`}>&#9733;</span>
      );
    }
    return stars;
  };

  const renderFavoriteTherapists = () => {
    return Object.keys(favoriteTherapists).map((therapistId) => {
      const therapist = recommendations.find((t) => t.therapist_id === parseInt(therapistId));
      return (
        <li key={therapistId} className="favorite-item">
          {therapist ? therapist.name : 'Unknown Therapist'}
          <button onClick={() => toggleFavorite(therapistId)} className="remove-favorite-btn">
            Remove from Favorites
          </button>
        </li>
      );
    });
  };

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="theme-toggle">
        <button onClick={toggleTheme} className="theme-btn">
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
      </div>

      <h2 className="heading">Recommended Therapists</h2>
      
      <div className="sorting">
        <button onClick={() => sortTherapists('asc', 'rating')} className={`sort-btn ${sortOrder === 'asc' ? 'active' : ''}`}>Sort by Rating (Asc)</button>
        <button onClick={() => sortTherapists('desc', 'rating')} className={`sort-btn ${sortOrder === 'desc' ? 'active' : ''}`}>Sort by Rating (Desc)</button>
        <button onClick={() => sortTherapists('asc', 'name')} className={`sort-btn ${sortOrder === 'asc' ? 'active' : ''}`}>Sort by Name (Asc)</button>
        <button onClick={() => sortTherapists('desc', 'name')} className={`sort-btn ${sortOrder === 'desc' ? 'active' : ''}`}>Sort by Name (Desc)</button>
      </div>

      <ul className="therapist-list">
        {recommendations.map((therapist) => (
          <li
            key={therapist.therapist_id}
            className={`therapist-item ${darkMode ? 'dark-mode' : ''}`}
            onClick={() => handleClick(therapist)}
          >
            <strong>{therapist.name}</strong> - {therapist.specialization}
            <div className="rating">
              {renderStars(therapist.rating)}
            </div>
            <button 
              className={`favorite-btn ${favoriteTherapists[therapist.therapist_id] ? 'active' : ''}`} 
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(therapist.therapist_id);
              }}
            >
              {favoriteTherapists[therapist.therapist_id] ? 'Unfavorite' : 'Favorite'}
            </button>
          </li>
        ))}
      </ul>

      {selectedTherapist && (
        <div className="therapist-details">
          <h3 className="therapist-name">{selectedTherapist.name}</h3>
          <p><strong>Specialization:</strong> {selectedTherapist.specialization}</p>
          <p><strong>Rating:</strong> {selectedTherapist.rating.toFixed(2)}</p>
          
          <h4>Reviews</h4>
          <ul className="review-list">
            {getReviews(selectedTherapist.therapist_id).map((review, index) => (
              <li key={index} className="review-item">
                <p>{review.review}</p>
                <p><strong>Rating:</strong> {review.rating} ({new Date(review.date).toLocaleDateString()})</p>
              </li>
            ))}
          </ul>

          <div className="review-form">
            <h4>Submit your review</h4>
            <div>
              <label htmlFor="rating">Rating: </label>
              <input
                type="number"
                id="rating"
                value={userRating}
                onChange={(e) => setUserRating(e.target.value)}
                min="1"
                max="5"
              />
            </div>
            <div>
              <label htmlFor="review">Review: </label>
              <textarea
                id="review"
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
              ></textarea>
            </div>
            <button onClick={submitReview}>Submit Review</button>
          </div>
        </div>
      )}

      <div className="favorites-section">
        <h3>Your Favorite Therapists</h3>
        <ul>{renderFavoriteTherapists()}</ul>
      </div>
    </div>
  );
};

export default TherapistRecommendations;
