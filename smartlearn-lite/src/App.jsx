import { useState } from "react";
import { Box } from '@mui/material';
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from 'framer-motion';
import Home from "./pages/Home";
import LoadUrl from "./pages/LoadUrl";
import UploadVideo from "./pages/UploadVideo";
import ParticleBackground from "./components/ParticleBackground";

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'url':
        return <LoadUrl onNavigate={setCurrentPage} />;
      case 'upload':
        return <UploadVideo onNavigate={setCurrentPage} />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #3B82F6 0%, #9333EA 50%, #6366F1 100%)', position: 'relative' }}>
      <ParticleBackground />
      <Toaster position="top-right" />
      <AnimatePresence mode="wait">
        {renderPage()}
      </AnimatePresence>
    </Box>
  );
}

export default App;
