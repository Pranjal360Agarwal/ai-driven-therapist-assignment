import React from 'react';
import TherapistRecommendations from './components/TherapistRecommendations';

const App = () => {
  return (
    <div>
      <h1>Therapist Matching Platform</h1>
      <TherapistRecommendations clientId={1} />
    </div>
  );
};

export default App;
