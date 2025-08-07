import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './components/Homepage';
import ImageTools from './components/ImageTools';
import PDFTools from './components/PDFTools';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,16,240,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(57,255,20,0.1),transparent_50%),radial-gradient(circle_at_40%_80%,rgba(106,13,173,0.1),transparent_50%)]"></div>
        <div className="relative z-10">
          <Navbar />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/image-tools" element={<ImageTools />} />
            <Route path="/pdf-tools" element={<PDFTools />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;