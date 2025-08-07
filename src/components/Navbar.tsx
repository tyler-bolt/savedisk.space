import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HardDrive, Home, Image, FileText } from 'lucide-react';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="backdrop-blur-md bg-black/20 border-b border-pink-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 group-hover:from-pink-400 group-hover:to-purple-500 transition-all duration-300">
              <HardDrive className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-space-grotesk bg-gradient-to-r from-pink-400 to-green-400 bg-clip-text text-transparent">
              SaveDisk.space
            </span>
          </Link>

          <div className="flex space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-dm-sans font-medium transition-all duration-300 flex items-center space-x-2 ${
                isActive('/') 
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                  : 'text-gray-300 hover:text-pink-300 hover:bg-pink-500/10'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/image-tools"
              className={`px-4 py-2 rounded-lg font-dm-sans font-medium transition-all duration-300 flex items-center space-x-2 ${
                isActive('/image-tools') 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'text-gray-300 hover:text-green-300 hover:bg-green-500/10'
              }`}
            >
              <Image className="h-4 w-4" />
              <span>Images</span>
            </Link>
            <Link
              to="/pdf-tools"
              className={`px-4 py-2 rounded-lg font-dm-sans font-medium transition-all duration-300 flex items-center space-x-2 ${
                isActive('/pdf-tools') 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                  : 'text-gray-300 hover:text-purple-300 hover:bg-purple-500/10'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>PDFs</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;