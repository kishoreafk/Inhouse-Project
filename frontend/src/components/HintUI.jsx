import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const HintUI = ({ question, options, onClose }) => {
  const [hint, setHint] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHint = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/generate_hint', {
        question: question,
        options: options
      });
      
      setHint(response.data.hint);
    } catch (err) {
      setError('Failed to generate hint. Please try again.');
      console.error('Hint generation error:', err);
    } finally {
      setLoading(false);
    }
  }, [question, options]);

  useEffect(() => {
    fetchHint();
  }, [fetchHint]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-strong rounded-3xl p-10 max-w-2xl w-full shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl animate-pulse">
              <span className="text-2xl">💡</span>
            </div>
            <h3 className="text-3xl font-bold text-yellow-400">
              Smart Hint
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white text-4xl transition-all duration-300 hover:rotate-90 hover:scale-110 transform p-2 rounded-full hover:bg-white/10"
          >
            ×
          </button>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="relative mx-auto mb-6">
              <div className="animate-spin w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
              <div className="absolute inset-0 animate-ping w-16 h-16 border-2 border-yellow-400 rounded-full opacity-20"></div>
            </div>
            <div className="text-white text-xl font-semibold mb-2">AI is crafting your hint...</div>
            <div className="text-gray-400">Analyzing the question and options</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4 animate-bounce">⚠️</div>
            <div className="text-red-400 text-lg">{error}</div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-3xl p-8 mb-8 hover:bg-gradient-to-r hover:from-yellow-500/30 hover:to-orange-500/30 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-yellow-500/20 rounded-full">
                <span className="text-3xl">🧐</span>
              </div>
              <div className="flex-1">
                <h4 className="text-yellow-400 font-bold text-lg mb-3">Here's a helpful hint:</h4>
                <p className="text-white text-xl leading-relaxed">{hint}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-10 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 text-lg"
          >
            <span>✨</span> Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HintUI;