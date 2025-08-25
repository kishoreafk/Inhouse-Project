import React, { useState, useEffect, useCallback } from 'react';
import QuizUI from '../components/QuizUI';
import ProgressTracker from '../components/ProgressTracker';
import axios from 'axios';

const QuizPage = ({ transcript, onBackHome }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, score: 0 });

  const generateQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/generate_quiz', {
        transcript: transcript,
        learner_state: 'engaged',
        difficulty: 'medium'
      });
      
      setQuiz(response.data.quiz);
      setProgress(prev => ({ ...prev, total: response.data.quiz.length }));
    } catch (err) {
      setError('Failed to generate quiz. Please try again.');
      console.error('Quiz generation error:', err);
    } finally {
      setLoading(false);
    }
  }, [transcript]);

  useEffect(() => {
    generateQuiz();
  }, [generateQuiz]);

  const handleQuizComplete = (finalScore) => {
    setProgress(prev => ({ ...prev, score: finalScore }));
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        <div className="relative z-10 text-center glass-strong rounded-3xl p-12 max-w-md">
          <div className="relative mx-auto mb-8">
            <div className="animate-spin w-20 h-20 border-4 border-blue-400 border-t-transparent rounded-full"></div>
            <div className="absolute inset-0 animate-ping w-20 h-20 border-2 border-blue-400 rounded-full opacity-20"></div>
          </div>
          <div className="text-3xl text-white font-bold mb-4 flex items-center justify-center gap-3">
            <span className="animate-float">🧠</span> Crafting Your Quiz
          </div>
          <div className="text-gray-300 text-lg">AI is analyzing the content and generating personalized questions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-float"></div>
        </div>
        <div className="relative z-10 glass-strong border-red-500/30 rounded-3xl p-10 max-w-lg text-center animate-scale-in">
          <div className="text-8xl mb-6 animate-bounce">⚠️</div>
          <h2 className="text-3xl font-bold text-white mb-6">Something went wrong</h2>
          <p className="text-gray-300 mb-8 text-lg leading-relaxed">{error}</p>
          <button
            onClick={onBackHome}
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-2 mx-auto"
          >
            <span>🏠</span> Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-12 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                <span className="text-3xl">🎯</span>
              </div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Quiz Challenge
              </h1>
            </div>
            <button
              onClick={onBackHome}
              className="btn-secondary flex items-center gap-2 text-lg"
            >
              <span>🏠</span> Home
            </button>
          </div>
          
          <ProgressTracker progress={progress} />
          
          {quiz && (
            <QuizUI 
              questions={quiz} 
              onComplete={handleQuizComplete}
              onProgressUpdate={setProgress}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizPage;