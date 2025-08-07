import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image, FileText, Zap, Sparkles } from 'lucide-react';

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-8xl font-bold font-space-grotesk mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-green-400 bg-clip-text text-transparent leading-tight">
            SaveDisk.space
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-dm-sans mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your files with cutting-edge compression and conversion technology. 
            <span className="text-pink-400 font-medium"> Save space. Save time. Save everything.</span>
          </p>
          <div className="flex items-center justify-center space-x-2 text-green-400 font-dm-sans">
            <Sparkles className="h-5 w-5" />
            <span>Compression wizardry at your fingertips</span>
            <Sparkles className="h-5 w-5" />
          </div>
        </motion.div>

        {/* Tool Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Image Tools Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group"
          >
            <div className="relative backdrop-blur-md bg-gradient-to-br from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-2xl p-8 h-full overflow-hidden">
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 group-hover:from-pink-400 group-hover:to-purple-500 transition-all duration-300">
                    <Image className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold font-space-grotesk text-white">Image Tools</h2>
                </div>

                <p className="text-gray-300 font-dm-sans text-lg mb-6 leading-relaxed">
                  Compress, optimize, and transform your images with advanced algorithms. 
                  Reduce file sizes by up to 90% while maintaining stunning visual quality.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3 text-pink-300">
                    <Zap className="h-4 w-4" />
                    <span className="font-dm-sans">Smart compression with quality preservation</span>
                  </div>
                  <div className="flex items-center space-x-3 text-pink-300">
                    <Zap className="h-4 w-4" />
                    <span className="font-dm-sans">Support for JPEG, PNG, WebP formats</span>
                  </div>
                  <div className="flex items-center space-x-3 text-pink-300">
                    <Zap className="h-4 w-4" />
                    <span className="font-dm-sans">Before/after preview with instant results</span>
                  </div>
                </div>

                <Link to="/image-tools">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-dm-sans font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-pink-500/25"
                  >
                    Start Compressing Images →
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* PDF Tools Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ y: -10, scale: 1.02 }}
            className="group"
          >
            <div className="relative backdrop-blur-md bg-gradient-to-br from-green-500/10 to-purple-600/10 border border-green-500/20 rounded-2xl p-8 h-full overflow-hidden">
              {/* Animated background glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-purple-600 group-hover:from-green-400 group-hover:to-purple-500 transition-all duration-300">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold font-space-grotesk text-white">PDF Tools</h2>
                </div>

                <p className="text-gray-300 font-dm-sans text-lg mb-6 leading-relaxed">
                  Complete PDF processing suite with compression, conversion, and transformation tools. 
                  Convert to Word, PowerPoint, or images with professional results.
                </p>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center space-x-3 text-green-300">
                    <Zap className="h-4 w-4" />
                    <span className="font-dm-sans">Intelligent PDF compression</span>
                  </div>
                  <div className="flex items-center space-x-3 text-green-300">
                    <Zap className="h-4 w-4" />
                    <span className="font-dm-sans">Convert to Word, PowerPoint, images</span>
                  </div>
                  <div className="flex items-center space-x-3 text-green-300">
                    <Zap className="h-4 w-4" />
                    <span className="font-dm-sans">Batch processing and bulk operations</span>
                  </div>
                </div>

                <Link to="/pdf-tools">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-400 hover:to-purple-500 text-white font-dm-sans font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                  >
                    Transform PDFs Now →
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 font-dm-sans text-lg">
            Join thousands of users saving disk space daily. 
            <span className="text-pink-400 font-medium"> No registration required.</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Homepage;