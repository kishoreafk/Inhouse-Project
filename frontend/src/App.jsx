import React, { useState } from 'react';
import QuizPage from './pages/QuizPage';
import Home from './pages/Home';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [transcript, setTranscript] = useState('');

  const handleStartQuiz = (transcriptText) => {
    setTranscript(transcriptText);
    setCurrentPage('quiz');
  };

  const handleBackHome = () => {
    setCurrentPage('home');
    setTranscript('');
  };

  return (
    <div className="min-h-screen">
      {currentPage === 'home' ? (
        <Home onStartQuiz={handleStartQuiz} />
      ) : (
        <QuizPage transcript={transcript} onBackHome={handleBackHome} />
      )}
    </div>
  );
}

export default App;