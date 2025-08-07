import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Import the refactored components
import PDFUploadSection from './pdf/PDFUploadSection';
import PDFToolButtons from './pdf/PDFToolButtons';
import PDFProcessingStatus from './pdf/PDFProcessingStatus';
import PDFResults from './pdf/PDFResults';

// Type definitions
interface PDFFile {
  name: string;
  size: number;
  pageCount: number;
  url: string;
}

type ProcessingType = 'compress' | 'word' | 'powerpoint' | 'jpeg' | null;

/**
 * Main PDF Tools component that serves as a router for all PDF-related functionality
 * This component manages the overall state and coordinates between child components
 */
const PDFTools: React.FC = () => {
  // State management for PDF processing workflow
  const [uploadedPDF, setUploadedPDF] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingType, setProcessingType] = useState<ProcessingType>(null);
  const [processedFile, setProcessedFile] = useState<{ name: string; size: number; url: string } | null>(null);

  /**
   * Handles file upload and creates a PDF file object with metadata
   */
  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    // Simulate getting PDF info (in real app, this would be backend processing)
    const estimatedPages = Math.floor(file.size / 50000); // Rough estimate
    
    setUploadedPDF({
      name: file.name,
      size: file.size,
      pageCount: Math.max(1, estimatedPages),
      url: url
    });
  };

  /**
   * Utility function to format file sizes in human-readable format
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Main processing function that handles different PDF operations
   * Routes to appropriate processing logic based on the selected tool
   */
  const processPDF = (type: ProcessingType) => {
    if (!uploadedPDF || !type) return;

    // Handle PDF compression with real backend API
    if (type === 'compress') {
      handlePDFCompression();
      return;
    }

    // Handle other conversion tools (simulated for now)
    handleSimulatedConversion(type);
  };

  /**
   * Real PDF compression using backend API
   */
  const handlePDFCompression = async () => {
    if (!uploadedPDF) return;

    setIsProcessing(true);
    setProcessingType('compress');
    setProgress(0);

    // Start progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Convert data URL back to File object for upload
      const response = await fetch(uploadedPDF.url);
      const blob = await response.blob();
      const file = new File([blob], uploadedPDF.name, { type: 'application/pdf' });

      const formData = new FormData();
      formData.append('pdf', file);

      const compressionLevel = 'medium'; // You can make this configurable
      const apiResponse = await fetch(`http://localhost:3001/api/pdf-compress?level=${compressionLevel}`, {
        method: 'POST',
        body: formData
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.message || 'PDF compression failed');
      }

      const data = await apiResponse.json();
      
      // Update with real compression results
      setProcessedFile({
        name: data.metadata.processedFilename,
        size: data.stats.compressedSize,
        url: `http://localhost:3001${data.previewUrl}`
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      setIsProcessing(false);
      
    } catch (error) {
      console.error('PDF compression error:', error);
      clearInterval(progressInterval);
      setIsProcessing(false);
      alert(`Compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Simulated conversion for non-compression tools
   * TODO: Replace with real backend implementations
   */
  const handleSimulatedConversion = (type: ProcessingType) => {
    if (!uploadedPDF) return;

    setIsProcessing(true);
    setProcessingType(type);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    setTimeout(() => {
      let newName = '';
      let newSize = uploadedPDF.size;

      switch (type) {
        case 'word':
          newName = uploadedPDF.name.replace('.pdf', '.docx');
          newSize = Math.floor(uploadedPDF.size * 0.8);
          break;
        case 'powerpoint':
          newName = uploadedPDF.name.replace('.pdf', '.pptx');
          newSize = Math.floor(uploadedPDF.size * 1.2);
          break;
        case 'jpeg':
          newName = uploadedPDF.name.replace('.pdf', '_pages.zip');
          newSize = Math.floor(uploadedPDF.size * 0.6);
          break;
      }

      setProcessedFile({
        name: newName,
        size: newSize,
        url: uploadedPDF.url
      });
      setProgress(100);
      setIsProcessing(false);
    }, 3000);
  };

  /**
   * Handles downloading of processed files
   */
  const downloadProcessed = () => {
    if (!processedFile) return;
    
    // In a real app, this would download the actual processed file
    const link = document.createElement('a');
    link.href = processedFile.url;
    link.download = processedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Resets the application state for a new PDF processing session
   */
  const handleRemoveFile = () => {
    setUploadedPDF(null);
    setProcessedFile(null);
    setProgress(0);
    setProcessingType(null);
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold font-space-grotesk mb-4 bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
            PDF Processing Tools
          </h1>
          <p className="text-xl text-gray-300 font-dm-sans max-w-3xl mx-auto">
            Compress, convert, and transform your PDF files with professional-grade tools.
          </p>
        </motion.div>

        {/* PDF Upload Section */}
        <PDFUploadSection
          uploadedPDF={uploadedPDF}
          onFileUpload={handleFileUpload}
          onRemoveFile={handleRemoveFile}
          formatFileSize={formatFileSize}
        />

        {/* PDF Tool Buttons */}
        <PDFToolButtons
          uploadedPDF={uploadedPDF}
          isProcessing={isProcessing}
          onProcessPDF={processPDF}
        />

        {/* Processing Status */}
        <PDFProcessingStatus
          isProcessing={isProcessing}
          progress={progress}
          processingType={processingType}
        />

        {/* Results Section */}
        <PDFResults
          processedFile={processedFile}
          uploadedPDF={uploadedPDF}
          isProcessing={isProcessing}
          onDownload={downloadProcessed}
          formatFileSize={formatFileSize}
        />
      </div>
    </div>
  );
};

export default PDFTools;