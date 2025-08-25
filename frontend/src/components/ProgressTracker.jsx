import React from 'react';

const ProgressTracker = ({ progress }) => {
  const { current, total, score } = progress;
  const progressPercentage = total > 0 ? (current / total) * 100 : 0;
  const accuracy = current > 0 ? (score / current) * 100 : 0;

  return (
    <div className="glass-strong rounded-3xl shadow-2xl p-8 mb-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
          <span className="text-2xl">📊</span>
        </div>
        <h2 className="text-3xl font-bold text-white">
          Learning Progress
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="text-center bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl p-6 border border-blue-500/30 hover:scale-105 transition-transform duration-300 group">
          <div className="text-5xl font-black text-cyan-400 mb-2 group-hover:scale-110 transition-transform duration-300">{current}</div>
          <div className="text-gray-300 font-semibold">Questions Answered</div>
        </div>
        
        <div className="text-center bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl p-6 border border-green-500/30 hover:scale-105 transition-transform duration-300 group">
          <div className="text-5xl font-black text-green-400 mb-2 group-hover:scale-110 transition-transform duration-300">{score}</div>
          <div className="text-gray-300 font-semibold">Correct Answers</div>
        </div>
        
        <div className="text-center bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl p-6 border border-purple-500/30 hover:scale-105 transition-transform duration-300 group">
          <div className="text-5xl font-black text-purple-400 mb-2 group-hover:scale-110 transition-transform duration-300">{accuracy.toFixed(1)}%</div>
          <div className="text-gray-300 font-semibold">Accuracy Rate</div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="text-white font-semibold text-lg">Overall Progress</span>
          </div>
          <span className="text-gray-300 font-bold text-lg">{current} / {total}</span>
        </div>
        <div className="relative w-full bg-gray-700/30 rounded-full h-4 overflow-hidden border border-white/10">
          <div 
            className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 h-4 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
            style={{ width: `${progressPercentage}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {current > 0 && (
        <div className="p-6 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl border border-indigo-500/30 hover:scale-105 transition-transform duration-300">
          <div className="text-white text-center">
            <div className="text-4xl mb-4 animate-bounce">{
              accuracy >= 80 ? '🎆' :
              accuracy >= 60 ? '🎉' :
              accuracy >= 40 ? '💪' :
              '🎯'
            }</div>
            <div className="font-bold text-xl">{
              accuracy >= 80 ? 'Outstanding Performance!' :
              accuracy >= 60 ? 'Great Job!' :
              accuracy >= 40 ? 'Keep Going!' :
              'You\'ve Got This!'
            }</div>
            <div className="text-gray-300 mt-2">{
              accuracy >= 80 ? 'You\'re mastering this content!' :
              accuracy >= 60 ? 'You\'re doing really well!' :
              accuracy >= 40 ? 'You\'re making good progress!' :
              'Every question is a learning opportunity!'
            }</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;