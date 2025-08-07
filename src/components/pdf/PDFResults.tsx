import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

interface ProcessedFile {
  name: string;
  size: number;
  url: string;
}

interface PDFFile {
  name: string;
  size: number;
  pageCount: number;
  url: string;
}

interface PDFResultsProps {
  processedFile: ProcessedFile | null;
  uploadedPDF: PDFFile | null;
  isProcessing: boolean;
  onDownload: () => void;
  formatFileSize: (bytes: number) => string;
}

const PDFResults: React.FC<PDFResultsProps> = ({
  processedFile,
  uploadedPDF,
  isProcessing,
  onDownload,
  formatFileSize
}) => {
  if (!processedFile || isProcessing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-md bg-gradient-to-br from-green-500/10 to-purple-600/10 border border-green-500/20 rounded-2xl p-6"
    >
      <h3 className="text-xl font-bold font-space-grotesk text-white mb-6 flex items-center">
        <Download className="h-5 w-5 mr-2 text-green-400" />
        Processing Complete!
      </h3>

      <div className="bg-black/20 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-dm-sans text-gray-300">File Ready</span>
          <span className="text-green-400 font-bold">✓ Done</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Original</p>
            <p className="text-white font-medium">{formatFileSize(uploadedPDF!.size)}</p>
          </div>
          <div>
            <p className="text-gray-400">Processed</p>
            <p className="text-green-400 font-medium">{formatFileSize(processedFile.size)}</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm mt-2">Output: {processedFile.name}</p>
      </div>

      <motion.button
        onClick={onDownload}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-400 hover:to-purple-500 text-white font-dm-sans font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
      >
        <Download className="h-5 w-5" />
        <span>Download Processed File</span>
      </motion.button>
    </motion.div>
  );
};

export default PDFResults;