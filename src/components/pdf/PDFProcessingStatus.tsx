import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import ProgressBar from '../ProgressBar';

type ProcessingType = 'compress' | 'word' | 'powerpoint' | 'jpeg' | null;

interface PDFProcessingStatusProps {
  isProcessing: boolean;
  progress: number;
  processingType: ProcessingType;
}

const PDFProcessingStatus: React.FC<PDFProcessingStatusProps> = ({
  isProcessing,
  progress,
  processingType
}) => {
  if (!isProcessing) return null;

  const getProcessingMessage = () => {
    switch (processingType) {
      case 'compress':
        return 'Compressing your PDF with advanced algorithms...';
      case 'word':
        return 'Converting PDF to Word document...';
      case 'powerpoint':
        return 'Creating PowerPoint presentation...';
      case 'jpeg':
        return 'Extracting pages as JPEG images...';
      default:
        return 'Processing your PDF...';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-md bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 rounded-2xl p-6 mb-8"
    >
      <h3 className="text-xl font-bold font-space-grotesk text-white mb-4 flex items-center">
        <Zap className="h-5 w-5 mr-2 text-purple-400" />
        Processing your PDF...
      </h3>
      <ProgressBar progress={progress} />
      <p className="text-center text-gray-300 font-dm-sans mt-4">
        {getProcessingMessage()}
      </p>
    </motion.div>
  );
};

export default PDFProcessingStatus;