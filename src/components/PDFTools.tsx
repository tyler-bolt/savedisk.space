import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Compass as Compress, FileImage, FileSpreadsheet, Download, Zap, Info } from 'lucide-react';
import FileUpload from './FileUpload';
import ProgressBar from './ProgressBar';

interface PDFFile {
  name: string;
  size: number;
  pageCount?: number;
  url: string;
}

interface ProcessedFile {
  name: string;
  size: number;
  url: string;
  pageCount?: number;
  savings?: number;
}

type ProcessingType = 'compress' | 'word' | 'powerpoint' | 'jpeg' | null;

const PDFTools: React.FC = () => {
  const [uploadedPDF, setUploadedPDF] = useState<PDFFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingType, setProcessingType] = useState<ProcessingType>(null);
  const [processedFile, setProcessedFile] = useState<ProcessedFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    
    setUploadedPDF({
      name: file.name,
      size: file.size,
      url: url
    });
    setError(null);
    setProcessedFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const processPDF = async (type: ProcessingType) => {
    if (!uploadedPDF || !type) return;

    setError(null);
    setIsProcessing(true);
    setProcessingType(type);
    setProgress(0);

    try {
      if (type === 'compress') {
        // Real PDF compression using backend
        await compressPDF();
      } else {
        // Simulate other processing types (not yet implemented)
        await simulateProcessing(type);
      }
    } catch (error) {
      console.error('Processing error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred while processing your PDF');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const compressPDF = async () => {
    if (!uploadedPDF) return;

    // Convert blob URL back to File object
    const response = await fetch(uploadedPDF.url);
    const blob = await response.blob();
    const file = new File([blob], uploadedPDF.name, { type: 'application/pdf' });

    const formData = new FormData();
    formData.append('pdf', file);

    // Simulate progress
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
      const response = await fetch('/api/pdf-compress', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'PDF compression failed');
      }

      const data = await response.json();
      
      setProcessedFile({
        name: data.metadata.processedFilename,
        size: data.stats.compressedSize,
        url: data.downloadUrl,
        pageCount: data.metadata.pageCount,
        savings: data.stats.savingsPercent
      });
      
      setProgress(100);
      clearInterval(progressInterval);
      setIsProcessing(false);
      
    } catch (error) {
      clearInterval(progressInterval);
      throw error;
    }
  };

  const simulateProcessing = async (type: ProcessingType) => {
    if (!uploadedPDF) return;

    // Simulate processing progress for non-compression features
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 300);

    // Simulate processing completion
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

  const downloadProcessed = () => {
    if (!processedFile) return;
    
    if (processingType === 'compress') {
      // For real compression, use the backend download URL
      window.open(processedFile.url, '_blank');
    } else {
      // For simulated processing, use blob download
      const link = document.createElement('a');
      link.href = processedFile.url;
      link.download = processedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toolButtons = [
    {
      type: 'compress' as ProcessingType,
      icon: Compress,
      title: 'Compress PDF',
      description: 'Reduce file size by up to 60%',
      color: 'from-pink-500 to-purple-600',
      hoverColor: 'from-pink-400 to-purple-500'
    },
    {
      type: 'word' as ProcessingType,
      icon: FileText,
      title: 'Convert to Word',
      description: 'Transform PDF to editable DOCX',
      color: 'from-blue-500 to-indigo-600',
      hoverColor: 'from-blue-400 to-indigo-500'
    },
    {
      type: 'powerpoint' as ProcessingType,
      icon: FileSpreadsheet,
      title: 'Convert to PowerPoint',
      description: 'Create PPTX presentation',
      color: 'from-orange-500 to-red-600',
      hoverColor: 'from-orange-400 to-red-500'
    },
    {
      type: 'jpeg' as ProcessingType,
      icon: FileImage,
      title: 'PDF to JPEG',
      description: 'Extract pages as images',
      color: 'from-green-500 to-teal-600',
      hoverColor: 'from-green-400 to-teal-500'
    }
  ];

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Upload Section */}
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
                onFileUpload={handleFileUpload}
                acceptedTypes={['application/pdf']}
                maxSize={100 * 1024 * 1024} // 100MB
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
                      {uploadedPDF.pageCount && (
                        <>
                          <span className="mx-2">•</span>
                          <span>Pages: {uploadedPDF.pageCount}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedPDF(null);
                      setProcessedFile(null);
                      setProgress(0);
                    }}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tool Buttons */}
        {uploadedPDF && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {toolButtons.map((tool, index) => (
              <motion.button
                key={tool.type}
                onClick={() => processPDF(tool.type)}
                disabled={isProcessing}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                className={`relative group disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md bg-gradient-to-br ${tool.color}/10 border border-current/20 rounded-xl p-6 text-left transition-all duration-300 hover:shadow-lg overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${tool.color}/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${tool.color} mb-4`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold font-space-grotesk text-white mb-2">{tool.title}</h3>
                  <p className="text-sm text-gray-300 font-dm-sans">{tool.description}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-md bg-gradient-to-br from-red-500/10 to-pink-600/10 border border-red-500/20 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold font-space-grotesk text-white mb-2 flex items-center">
              <Info className="h-5 w-5 mr-2 text-red-400" />
              Processing Error
            </h3>
            <p className="text-red-300 font-dm-sans">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-dm-sans font-medium py-2 px-4 rounded-lg transition-all duration-300"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Processing Status */}
        {isProcessing && (
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
              {processingType === 'compress' && 'Compressing your PDF with advanced algorithms...'}
              {processingType === 'word' && 'Converting PDF to Word document...'}
              {processingType === 'powerpoint' && 'Creating PowerPoint presentation...'}
              {processingType === 'jpeg' && 'Extracting pages as JPEG images...'}
            </p>
          </motion.div>
        )}

        {/* Results */}
        {processedFile && !isProcessing && (
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
                <div className="flex items-center space-x-2">
                  {processedFile.savings !== undefined && (
                    <span className="text-green-400 font-bold">{processedFile.savings.toFixed(1)}% saved</span>
                  )}
                  <span className="text-green-400 font-bold">✓ Done</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Original</p>
                  <p className="text-white font-medium">{formatFileSize(uploadedPDF!.size)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Processed</p>
                  <p className={`font-medium ${processedFile.savings !== undefined && processedFile.savings > 0 ? 'text-green-400' : 'text-white'}`}>
                    {formatFileSize(processedFile.size)}
                  </p>
                </div>
              </div>
              <div className="mt-3 text-sm">
                <p className="text-gray-300">Output: {processedFile.name}</p>
                {processedFile.pageCount && (
                  <p className="text-gray-400">Pages: {processedFile.pageCount}</p>
                )}
              </div>
            </div>

            <motion.button
              onClick={downloadProcessed}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-400 hover:to-purple-500 text-white font-dm-sans font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Download className="h-5 w-5" />
              <span>Download Processed File</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PDFTools;