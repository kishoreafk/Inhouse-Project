import React, { useState } from 'react';
import HintUI from './HintUI';
import axios from 'axios';

const QuizUI = ({ questions, onComplete, onProgressUpdate }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer) return;

    try {
      const response = await axios.post('http://localhost:8000/evaluate_answer', {
        question: questions[currentQuestion].question,
        user_answer: selectedAnswer,
        correct_answer: questions[currentQuestion].answer
      });

      setEvaluation(response.data);
      setShowResult(true);
      
      if (response.data.is_correct) {
        setScore(prev => prev + 1);
      }
    } catch (error) {
      console.error('Answer evaluation error:', error);
    }
  };

  const handleNextQuestion = () => {
    const nextQuestion = currentQuestion + 1;
    
    onProgressUpdate(prev => ({
      ...prev,
      current: nextQuestion,
      score: score
    }));

    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedAnswer('');
      setShowResult(false);
      setEvaluation(null);
      setShowHint(false);
    } else {
      onComplete(score);
    }
  };

  const currentQ = questions[currentQuestion];
  const difficultyColors = {
    easy: 'from-green-500 to-emerald-500',
    medium: 'from-yellow-500 to-orange-500', 
    hard: 'from-red-500 to-pink-500'
  };

  return (
    <div className="glass-strong rounded-3xl shadow-2xl p-10 animate-fade-in">
      <div className="mb-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <span className="text-2xl">🧩</span>
            </div>
            <h2 className="text-3xl font-bold text-white">
              Question {currentQuestion + 1} of {questions.length}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm bg-gradient-to-r ${difficultyColors[currentQ.difficulty] || difficultyColors.medium} text-white px-6 py-3 rounded-full font-bold shadow-lg uppercase tracking-wide`}>
              {currentQ.difficulty}
            </span>
          </div>
        </div>
        
        <div className="glass rounded-3xl p-8 mb-10 border border-white/20 hover:bg-white/10 transition-all duration-300">
          <p className="text-2xl text-white leading-relaxed font-medium">{currentQ.question}</p>
        </div>
        
        <div className="space-y-5 mb-10">
          {currentQ.options.map((option, index) => (
            <label key={index} className={`group flex items-center space-x-5 cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] ${
              selectedAnswer === option 
                ? 'bg-blue-500/20 border-blue-400 shadow-2xl scale-[1.02]' 
                : 'glass border-white/30 hover:bg-white/15 hover:border-white/50'
            } ${showResult && option === currentQ.answer ? 'bg-green-500/20 border-green-400 shadow-2xl' : ''} ${
              showResult && selectedAnswer === option && option !== currentQ.answer ? 'bg-red-500/20 border-red-400' : ''
            }`}>
              <div className={`relative w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                selectedAnswer === option 
                  ? 'border-blue-400 bg-blue-400' 
                  : 'border-white/40 group-hover:border-white/60'
              } ${showResult && option === currentQ.answer ? 'border-green-400 bg-green-400' : ''}`}>
                {selectedAnswer === option && (
                  <div className="absolute inset-1 bg-white rounded-full"></div>
                )}
              </div>
              <input
                type="radio"
                name="answer"
                value={option}
                checked={selectedAnswer === option}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={showResult}
                className="sr-only"
              />
              <span className={`text-white text-xl font-medium flex-1 ${
                showResult && option === currentQ.answer ? 'text-green-400 font-bold' : ''
              } ${showResult && selectedAnswer === option && option !== currentQ.answer ? 'text-red-400' : ''}`}>
                {option}
              </span>
              {showResult && option === currentQ.answer && (
                <span className="text-green-400 text-2xl">✓</span>
              )}
              {showResult && selectedAnswer === option && option !== currentQ.answer && (
                <span className="text-red-400 text-2xl">✗</span>
              )}
            </label>
          ))}
        </div>
        
        <div className="flex gap-6 mb-10">
          {!showResult ? (
            <>
              <button
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-10 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 text-lg"
              >
                <span>✅</span> Submit Answer
              </button>
              
              <button
                onClick={() => setShowHint(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold px-10 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 text-lg"
              >
                <span>💡</span> Get Hint
              </button>
            </>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-10 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 text-lg"
            >
              {currentQuestion + 1 < questions.length ? (
                <><span>➡️</span> Next Question</>
              ) : (
                <><span>🏆</span> Finish Quiz</>
              )}
            </button>
          )}
        </div>
        
        {showHint && (
          <HintUI 
            question={currentQ.question} 
            options={currentQ.options}
            onClose={() => setShowHint(false)}
          />
        )}
        
        {showResult && evaluation && (
          <div className={`p-8 rounded-3xl border-2 animate-scale-in ${
            evaluation.is_correct 
              ? 'bg-green-500/20 border-green-400 shadow-green-500/20' 
              : 'bg-red-500/20 border-red-400 shadow-red-500/20'
          } shadow-2xl`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-full ${
                evaluation.is_correct ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <span className="text-2xl">
                  {evaluation.is_correct ? '✅' : '❌'}
                </span>
              </div>
              <h3 className={`font-bold text-2xl ${
                evaluation.is_correct ? 'text-green-400' : 'text-red-400'
              }`}>
                {evaluation.is_correct ? 'Excellent!' : 'Not quite right'}
              </h3>
            </div>
            <div className="glass rounded-2xl p-6 mb-6">
              <p className="text-white text-lg leading-relaxed">{evaluation.explanation}</p>
            </div>
            {evaluation.follow_up && (
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-2xl border border-blue-400/30">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💭</span>
                  <div>
                    <h4 className="text-blue-400 font-bold mb-2">Think about this:</h4>
                    <p className="text-blue-300 leading-relaxed">{evaluation.follow_up}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizUI;