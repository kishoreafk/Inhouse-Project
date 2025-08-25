import React, { useState } from 'react';
import axios from 'axios';

const Home = ({ onStartQuiz }) => {
  const [transcript, setTranscript] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleVideoUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('video', file);
    if (transcript) formData.append('transcript', transcript);
    
    try {
      const response = await axios.post('http://localhost:8000/upload_video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onStartQuiz(response.data.transcript);
    } catch (error) {
      console.error('Video upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!videoUrl.trim()) return;
    
    setUploading(true);
    try {
      const response = await axios.post('http://localhost:8000/process_video_url', {
        url: videoUrl
      });
      onStartQuiz(response.data.transcript);
    } catch (error) {
      console.error('Video URL processing failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleVideoUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="text-7xl animate-float">🧠</div>
              <h1 className="text-7xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                AI Learning Hub
              </h1>
            </div>
            <p className="text-2xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
              Transform any video into an <span className="text-blue-400 font-semibold">intelligent learning experience</span> with AI-powered quizzes
            </p>
          </div>
          
          <div className="glass-strong rounded-3xl shadow-2xl p-10 animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Video Upload */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <span className="text-2xl">🎥</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Upload Video
                  </h2>
                </div>
                
                <div
                  className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-500 group ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-400/20 scale-105 shadow-2xl' 
                      : 'border-gray-500 hover:border-blue-400 hover:bg-blue-400/5'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploading ? (
                    <div className="text-blue-400 animate-pulse">
                      <div className="relative mx-auto mb-6">
                        <div className="animate-spin w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full"></div>
                        <div className="absolute inset-0 animate-ping w-16 h-16 border-2 border-blue-400 rounded-full opacity-20"></div>
                      </div>
                      <p className="text-xl font-semibold">Processing video...</p>
                      <p className="text-sm text-gray-400 mt-2">AI is extracting content</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">🎥</div>
                      <p className="text-xl text-white mb-2 font-semibold">Drag & drop your video here</p>
                      <p className="text-gray-400 mb-8">Supports MP4, AVI, MOV and more</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleVideoUpload(e.target.files[0])}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="btn-primary cursor-pointer inline-flex items-center gap-2 text-lg"
                      >
                        <span>📁</span> Choose Video File
                      </label>
                    </>
                  )}
                </div>
              </div>
              
              {/* Video URL */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Online Video
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <div className="relative">
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="input-field w-full text-lg py-4"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                      🔗
                    </div>
                  </div>
                  
                  <button
                    onClick={handleUrlSubmit}
                    disabled={!videoUrl.trim() || uploading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg flex items-center justify-center gap-2"
                  >
                    <span>⚡</span> Process Online Video
                  </button>
                </div>
              </div>
              
              {/* Transcript Input */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                    <span className="text-2xl">📝</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    Text Content
                  </h2>
                </div>
                
                <div className="space-y-6">
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste your text content here...\n\nThis could be a transcript, article, or any educational content you want to turn into a quiz."
                    className="input-field w-full h-48 text-lg resize-none"
                  />
                  
                  <button
                    onClick={() => onStartQuiz(transcript)}
                    disabled={!transcript.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg flex items-center justify-center gap-2"
                  >
                    <span>🎯</span> Generate Quiz from Text
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: '🎯', 
                title: 'Smart Quizzes', 
                desc: 'AI generates personalized questions based on content difficulty and your learning pace',
                gradient: 'from-blue-500 to-cyan-500'
              },
              { 
                icon: '💡', 
                title: 'Instant Hints', 
                desc: 'Get contextual help without spoiling the answer, designed to guide your thinking',
                gradient: 'from-yellow-500 to-orange-500'
              },
              { 
                icon: '📈', 
                title: 'Progress Tracking', 
                desc: 'Real-time analytics on your learning journey with detailed performance insights',
                gradient: 'from-green-500 to-emerald-500'
              }
            ].map((feature, idx) => (
              <div key={idx} className="card group hover:scale-105 text-center animate-slide-up" style={{animationDelay: `${idx * 0.1}s`}}>
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;