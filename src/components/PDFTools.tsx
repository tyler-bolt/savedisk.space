import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PDFDocument } from 'pdf-lib';

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
  file: File;
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
      url: url,
      file: file
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
   * PDF compression - now works entirely client-side for deployment compatibility
   */
  const handlePDFCompression = async () => {
    if (!uploadedPDF) return;

    setIsProcessing(true);
    setProcessingType('compress');
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

    console.log('🔧 PDF Compression Debug Log');
    console.log('================================');
    console.log(`📁 Original file: ${uploadedPDF.name}`);
    console.log(`📏 Original size: ${uploadedPDF.file.size} bytes (${(uploadedPDF.file.size / 1024).toFixed(2)} KB)`);
    console.log(`📄 Estimated pages: ${uploadedPDF.pageCount}`);
    console.log(`🕐 Starting compression at: ${new Date().toISOString()}`);

    try {
      // Read the file as ArrayBuffer
      console.log('📖 Reading file as ArrayBuffer...');
      const arrayBuffer = await uploadedPDF.file.arrayBuffer();
      console.log(`✅ ArrayBuffer created: ${arrayBuffer.byteLength} bytes`);
      
      // Load the PDF document
      console.log('📋 Loading PDF document with pdf-lib...');
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get detailed PDF information
      const pageCount = pdfDoc.getPageCount();
      const title = pdfDoc.getTitle();
      const author = pdfDoc.getAuthor();
      const creator = pdfDoc.getCreator();
      const producer = pdfDoc.getProducer();
      
      console.log('📊 PDF Document Analysis:');
      console.log(`   Pages: ${pageCount}`);
      console.log(`   Title: ${title || 'Not set'}`);
      console.log(`   Author: ${author || 'Not set'}`);
      console.log(`   Creator: ${creator || 'Not set'}`);
      console.log(`   Producer: ${producer || 'Not set'}`);
      
      // Analyze PDF structure
      console.log('🔍 Analyzing PDF structure...');
      const pages = pdfDoc.getPages();
      let totalTextContent = 0;
      let totalImages = 0;
      
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        console.log(`   Page ${index + 1}: ${width.toFixed(1)} x ${height.toFixed(1)} pts`);
        
        // Try to get some basic content info (this is limited with pdf-lib)
        try {
          const pageNode = page.node;
          if (pageNode && pageNode.Contents) {
            console.log(`   Page ${index + 1}: Has content streams`);
          }
        } catch (e) {
          // pdf-lib doesn't expose detailed content analysis easily
        }
      });
      
      console.log('⚙️ Applying compression settings:');
      console.log('   useObjectStreams: true (groups PDF objects for better compression)');
      console.log('   addDefaultPage: false (prevents adding unnecessary blank pages)');
      console.log('   subset: true (creates font subsets with only used characters)');
      console.log('   objectsPerTick: 50 (processing batch size)');
      console.log('   updateFieldAppearances: false (skips form field re-rendering)');
      console.log('   compress: true (applies stream compression)');
      
      // Save with compression options
      console.log('💾 Saving compressed PDF...');
      const startTime = performance.now();
      const compressedPdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        subset: true,
        objectsPerTick: 50,
        updateFieldAppearances: false,
        compress: true
      });
      const endTime = performance.now();
      
      console.log(`✅ Compression completed in ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`📏 Compressed size: ${compressedPdfBytes.length} bytes (${(compressedPdfBytes.length / 1024).toFixed(2)} KB)`);
      
      // Calculate compression statistics
      const originalSize = uploadedPDF.file.size;
      const compressedSize = compressedPdfBytes.length;
      const savedBytes = originalSize - compressedSize;
      const compressionRatio = originalSize / compressedSize;
      const compressionPercent = (savedBytes / originalSize) * 100;
      
      console.log('📊 Compression Results:');
      console.log(`   Original: ${originalSize} bytes (${(originalSize / 1024).toFixed(2)} KB)`);
      console.log(`   Compressed: ${compressedSize} bytes (${(compressedSize / 1024).toFixed(2)} KB)`);
      console.log(`   Saved: ${savedBytes} bytes (${(savedBytes / 1024).toFixed(2)} KB)`);
      console.log(`   Compression ratio: ${compressionRatio.toFixed(2)}:1`);
      console.log(`   Compression percentage: ${compressionPercent.toFixed(2)}%`);
      
      if (savedBytes <= 0) {
        console.log('⚠️ WARNING: No compression achieved or file size increased!');
        console.log('   Possible reasons:');
        console.log('   - PDF was already highly optimized');
        console.log('   - PDF contains mostly compressed images');
        console.log('   - PDF structure overhead from pdf-lib processing');
      } else if (compressionPercent < 5) {
        console.log('ℹ️ INFO: Minimal compression achieved (<5%)');
        console.log('   This is normal for:');
        console.log('   - Already optimized PDFs');
        console.log('   - PDFs with mostly image content');
        console.log('   - Small PDFs with little redundant data');
      } else {
        console.log('🎉 Good compression achieved!');
      }
      
      // Create a blob from the compressed bytes
      const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const compressedUrl = URL.createObjectURL(compressedBlob);
      
      console.log('🔗 Created download URL for compressed PDF');
      console.log('================================');
      
      setProcessedFile({
        name: uploadedPDF.name.replace('.pdf', '_compressed.pdf'),
        size: compressedBlob.size,
        url: compressedUrl
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      setIsProcessing(false);
    } catch (error) {
      console.error('PDF compression error:', error);
      console.log('🔍 Error details:');
      console.log(`   Error type: ${error.constructor.name}`);
      console.log(`   Error message: ${error.message}`);
      if (error.stack) {
        console.log(`   Stack trace: ${error.stack}`);
      }
      console.log('================================');
      clearInterval(progressInterval);
      setIsProcessing(false);
      // You could add error state handling here if needed
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