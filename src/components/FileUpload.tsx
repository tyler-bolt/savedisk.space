import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  acceptedTypes: string[];
  maxSize: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, acceptedTypes, maxSize }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Please upload: ${acceptedTypes.join(', ')}`;
    }
    if (file.size > maxSize) {
      return `File too large. Maximum size is ${Math.floor(maxSize / (1024 * 1024))}MB`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const formatFileTypes = () => {
    return acceptedTypes.map(type => {
      switch (type) {
        case 'image/jpeg': return 'JPEG';
        case 'image/png': return 'PNG';
        case 'image/webp': return 'WebP';
        case 'application/pdf': return 'PDF';
        default: return type;
      }
    }).join(', ');
  };

  return (
    <div className="space-y-4">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
          isDragOver
            ? 'border-pink-400 bg-pink-400/10'
            : 'border-gray-600 hover:border-pink-500 hover:bg-pink-500/5'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-300 ${
            isDragOver ? 'bg-pink-500' : 'bg-gray-700'
          }`}>
            <Upload className={`h-8 w-8 transition-colors duration-300 ${
              isDragOver ? 'text-white' : 'text-gray-300'
            }`} />
          </div>
          
          <div>
            <p className="text-lg font-dm-sans font-semibold text-white mb-2">
              {isDragOver ? 'Drop your file here' : 'Drag & drop your file here'}
            </p>
            <p className="text-gray-400 font-dm-sans mb-4">
              or click to browse your files
            </p>
            <p className="text-sm text-gray-500 font-dm-sans">
              Supported formats: {formatFileTypes()}
            </p>
            <p className="text-sm text-gray-500 font-dm-sans">
              Maximum size: {Math.floor(maxSize / (1024 * 1024))}MB
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-dm-sans font-medium"
          >
            <File className="h-4 w-4" />
            <span>Browse Files</span>
          </motion.div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center justify-between"
        >
          <p className="text-red-400 font-dm-sans text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;