import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Download, Zap, Info, Sliders } from 'lucide-react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';

interface FileInfo {
  name: string;
  size: number;
  format: string;
  dimensions?: { width: number; height: number };
  url: string;
  file: File;
}

const ImageTools: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<FileInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [compressedFile, setCompressedFile] = useState<FileInfo | null>(null);
  const [compressionSavings, setCompressionSavings] = useState(0);

  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    
    // Get image dimensions
    const img = new window.Image();
    img.onload = () => {
      setUploadedFile({
        name: file.name,
        size: file.size,
        format: file.type,
        dimensions: { width: img.width, height: img.height },
        url: url,
        file: file
      });
    };
    img.src = url;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressImage = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setProgress(0);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      // Create FormData for the API request
      const formData = new FormData();
      formData.append('image', uploadedFile.file);
      
      // Determine API URL (use environment variable or fallback to localhost)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      // Make API request to backend
      const response = await fetch(`${apiUrl}/api/upload?level=${compressionLevel}`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Compression failed');
      }
      
      const data = await response.json();
      
      // Update state with real compression results
      setCompressedFile({
        name: data.metadata.processedFilename,
        size: data.stats.compressedSize,
        format: data.metadata.outputFormat,
        dimensions: uploadedFile.dimensions,
        url: `${apiUrl}${data.previewUrl}`,
        file: uploadedFile.file // Keep reference to original file
      });
      
      setCompressionSavings(data.stats.savingsPercent);
      clearInterval(progressInterval);
      setProgress(100);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('Compression error:', error);
      clearInterval(progressInterval);
      setIsProcessing(false);
      
      // You could add error state handling here
      alert(`Compression failed: ${error.message}`);
    }
  };


  const downloadCompressed = () => {
    if (!compressedFile) return;
    
    // Download the actual compressed file from backend
    const link = document.createElement('a');
    
    // Use download URL instead of preview URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    link.href = compressedFile.url.replace('/api/uploads/', '/api/download/');
    link.download = compressedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold font-space-grotesk mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Image Compression Tools
          </h1>
          <p className="text-xl text-gray-300 font-dm-sans max-w-3xl mx-auto">
            Reduce image file sizes while preserving quality. Support for JPEG, PNG, and WebP formats.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="backdrop-blur-md bg-gradient-to-br from-pink-500/10 to-purple-600/10 border border-pink-500/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold font-space-grotesk text-white mb-6 flex items-center">
                <Upload className="h-6 w-6 mr-3 text-pink-400" />
                Upload Image
              </h2>

              {!uploadedFile ? (
                <FileUpload
                  onFileUpload={handleFileUpload}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  maxSize={50 * 1024 * 1024} // 50MB
                />
              ) : (
                <div className="space-y-6">
                  {/* File Info */}
                  <div className="bg-black/20 rounded-xl p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img 
                          src={uploadedFile.url} 
                          alt="Uploaded" 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-dm-sans font-semibold text-white truncate">{uploadedFile.name}</h3>
                        <div className="text-sm text-gray-300 space-y-1 mt-2">
                          <p>Size: {formatFileSize(uploadedFile.size)}</p>
                          <p>Format: {uploadedFile.format}</p>
                          {uploadedFile.dimensions && (
                            <p>Dimensions: {uploadedFile.dimensions.width} × {uploadedFile.dimensions.height}px</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compression Settings */}
                  <div className="bg-black/20 rounded-xl p-4">
                    <h3 className="font-dm-sans font-semibold text-white mb-4 flex items-center">
                      <Sliders className="h-4 w-4 mr-2" />
                      Compression Level
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {(['low', 'medium', 'high'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setCompressionLevel(level)}
                          className={`py-2 px-3 rounded-lg font-dm-sans text-sm font-medium transition-all duration-200 ${
                            compressionLevel === level
                              ? 'bg-pink-500 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-400 font-dm-sans">
                      {compressionLevel === 'low' && 'Minimal compression, best quality'}
                      {compressionLevel === 'medium' && 'Balanced compression and quality'}
                      {compressionLevel === 'high' && 'Maximum compression, smaller files'}
                    </div>
                  </div>

                  {/* Process Button */}
                  <motion.button
                    onClick={compressImage}
                    disabled={isProcessing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-dm-sans font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Zap className="h-5 w-5" />
                    <span>{isProcessing ? 'Compressing...' : 'Compress Image'}</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="backdrop-blur-md bg-gradient-to-br from-green-500/10 to-purple-600/10 border border-green-500/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold font-space-grotesk text-white mb-6 flex items-center">
                <Image className="h-6 w-6 mr-3 text-green-400" />
                Results
              </h2>

              {isProcessing && (
                <div className="space-y-4">
                  <ProgressBar progress={progress} />
                  <p className="text-center text-gray-300 font-dm-sans">
                    Processing your image with {compressionLevel} compression...
                  </p>
                </div>
              )}

              {compressedFile && !isProcessing && (
                <div className="space-y-6">
                  {/* Savings Info */}
                  <div className="bg-black/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-dm-sans text-gray-300">Space Saved</span>
                      <span className="text-2xl font-bold text-green-400">{compressionSavings}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Original</p>
                        <p className="text-white font-medium">{formatFileSize(uploadedFile!.size)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Compressed</p>
                        <p className="text-green-400 font-medium">{formatFileSize(compressedFile.size)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Download Button */}
                  <motion.button
                    onClick={downloadCompressed}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-400 hover:to-purple-500 text-white font-dm-sans font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Compressed Image</span>
                  </motion.button>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setCompressedFile(null);
                      setProgress(0);
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-dm-sans font-medium py-2 px-4 rounded-xl transition-all duration-300"
                  >
                    Process Another Image
                  </button>
                </div>
              )}

              {!uploadedFile && !isProcessing && (
                <div className="text-center py-12">
                  <Info className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 font-dm-sans">
                    Upload an image to see compression results here
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ImageTools;