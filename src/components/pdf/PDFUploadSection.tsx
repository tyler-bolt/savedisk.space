import React from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText } from 'lucide-react';
import FileUpload from '../FileUpload';

interface PDFFile {
  name: string;
  size: number;
  pageCount: number;
  url: string;
}

interface PDFUploadSectionProps {
  uploadedPDF: PDFFile | null;
  onFileUpload: (file: File) => void;
  onRemoveFile: () => void;
  formatFileSize: (bytes: number) => string;
}

const PDFUploadSection: React.FC<PDFUploadSectionProps> = ({
  uploadedPDF,
  onFileUpload,
  onRemoveFile,
  formatFileSize
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-8"
    >
      <div className="backdrop-blur-md bg-gradient-to-br from-green-500/10 to-purple-600/10 border border-green-500/20 rounded-2xl p-6">
        <h2 className="text-2xl font-bold font-space-grotesk text-white mb-6 flex items-center">
          <Upload className="h-6 w-6 mr-3 text-green-400" />
          Upload PDF
        </h2>

        {!uploadedPDF ? (
          <FileUpload
            onFileUpload={onFileUpload}
            acceptedTypes={['application/pdf']}
            maxSize={50 * 1024 * 1024} // 50MB
          />
        ) : (
          <div className="bg-black/20 rounded-xl p-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-500/20 rounded-lg">
                <FileText className="h-8 w-8 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-dm-sans font-semibold text-white truncate">{uploadedPDF.name}</h3>
                <div className="text-sm text-gray-300 mt-1">
                  <span>Size: {formatFileSize(uploadedPDF.size)}</span>
                  <span className="mx-2">•</span>
                  <span>Pages: ~{uploadedPDF.pageCount}</span>
                </div>
              </div>
              <button
                onClick={onRemoveFile}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PDFUploadSection;