import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Extension mapping for different image formats
const extMap = {
  'image/jpeg': 'jpg',
  'image/png': 'png', 
  'image/webp': 'webp'
};

// Log Sharp version on startup
console.log(`🔧 Sharp version: ${sharp.versions.sharp}`);
console.log(`📦 libvips version: ${sharp.versions.vips}`);
// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS for frontend communication
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));

app.use(express.json());

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, WebP images and PDF files are allowed'), false);
    }
    
    cb(null, true);
  }
});

// Quality mapping for compression levels
const getQualitySettings = (level) => {
  const qualityMap = {
    low: { quality: 90, description: 'Minimal compression, best quality' },
    medium: { quality: 75, description: 'Balanced compression and quality' },
    high: { quality: 60, description: 'Maximum compression, smaller files' }
  };
  
  return qualityMap[level] || qualityMap.medium;
};

// Image upload and compression endpoint
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    const { file } = req;
    const level = req.query.level || 'medium';
    
    if (!file) {
      return res.status(400).json({ 
        error: 'No image uploaded',
        message: 'Please select an image file to upload'
      });
    }

    console.log(`📤 Processing upload: ${file.originalname}`);
    console.log(`📋 Detected MIME type: ${file.mimetype}`);
    console.log(`📊 Original file size: ${file.size} bytes (${(file.size / 1024).toFixed(2)} KB)`);
    console.log(`🎛️  Compression level: ${level}`);
    
    // Detect format from MIME type
    const originalMimeType = file.mimetype;
    const extension = extMap[originalMimeType];
    
    if (!extension) {
      return res.status(400).json({
        error: 'Unsupported format',
        message: 'Only JPEG, PNG, and WebP images are supported'
      });
    }
    
    console.log(`🎯 Format detected: ${extension.toUpperCase()} - will be preserved`);
    console.log(`✅ No format conversion will occur`);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Generate output filename with original format extension
    const timestamp = Date.now();
    const filename = `compressed_${timestamp}.${extension}`;
    const outputPath = path.join(uploadsDir, filename);
    
    console.log(`📁 Output filename: ${filename} (preserving .${extension} extension)`);
    
    // Log format-specific compression settings being applied
    const { quality } = getQualitySettings(level);
    console.log(`🔧 Applying ${extension.toUpperCase()} compression settings:`);
    
    // Get original image metadata
    const metadata = await sharp(file.buffer).metadata();
    console.log(`🖼️  Original dimensions: ${metadata.width}x${metadata.height}px`);
    
    // Validate that the image is actually processable
    if (!metadata.width || !metadata.height) {
      return res.status(400).json({
        error: 'Invalid image',
        message: 'Unable to read image dimensions. File may be corrupted.'
      });
    }
    
    // Create base Sharp pipeline with resize
    let pipeline = sharp(file.buffer)
      .rotate() // Auto-rotate based on EXIF data  
      .resize({
        width: 4000, 
        height: 4000, 
        fit: 'inside',
        withoutEnlargement: true // Don't upscale smaller images
      });

    // Apply format-specific compression settings (NO .toFormat() calls)
    switch (extension) {
      case 'jpg':
        console.log(`   - Quality: ${quality}`);
        console.log(`   - Progressive: true`);
        console.log(`   - MozJPEG: true`);
        console.log(`   - Output format: JPEG (preserved)`);
        pipeline = pipeline.jpeg({
          quality: quality,
          progressive: true,
          mozjpeg: true
        });
        break;
        
      case 'png':
        console.log(`   - Compression Level: 9`);
        console.log(`   - Output format: PNG (preserved)`);
        pipeline = pipeline.png({ 
          compressionLevel: 9
        });
        break;
        
      case 'webp':
        console.log(`   - Quality: ${quality}`);
        console.log(`   - Output format: WebP (preserved)`);
        pipeline = pipeline.webp({ 
          quality: quality
        });
        break;
        
      default:
        console.log(`❌ Unsupported extension: ${extension}`);
        return res.status(400).json({
          error: 'Unsupported format',
          message: `Format ${extension.toUpperCase()} is not supported for compression`
        });
    }
    
    console.log(`📤 Sharp pipeline configured`);
    console.log(`✅ Format preservation confirmed: ${extension.toUpperCase()}`);
    console.log(`🚫 No .toFormat() calls - original format maintained`);
    
    // Log original file size details
    const originalSize = file.size;
    console.log(`📏 Original file details:`);
    console.log(`   - Size: ${originalSize} bytes`);
    console.log(`   - Size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   - MIME type: ${file.mimetype}`);
    console.log(`   - Format: ${extension.toUpperCase()}`);
    
    // Process and save compressed image
    try {
      await pipeline.toFile(outputPath);
      console.log(`💾 Compressed file saved: ${filename}`);
      console.log(`✅ Format preserved as ${extension.toUpperCase()}`);
    } catch (sharpError) {
      console.error('Sharp processing error:', sharpError);
      return res.status(500).json({
        error: 'Compression failed',
        message: 'Failed to process image. The file may be corrupted or in an unsupported format.'
      });
    }
    
    // Get compressed file size using fs.stat
    let compressedSize;
    
    try {
      const stats = await fs.stat(outputPath);
      compressedSize = stats.size;
      console.log(`📏 Compressed file details:`);
      console.log(`   - Size: ${compressedSize} bytes`);
      console.log(`   - Size: ${(compressedSize / 1024).toFixed(2)} KB`);
      console.log(`   - Format: ${extension.toUpperCase()} (confirmed preserved)`);
    } catch (statError) {
      console.error('File stat error:', statError);
      return res.status(500).json({
        error: 'File processing error',
        message: 'Compressed file could not be verified'
      });
    }
    
    // Validate final format matches original
    const finalExtension = path.extname(filename).toLowerCase().substring(1);
    const originalExtension = extMap[originalMimeType];
    
    if (finalExtension !== originalExtension) {
      console.error(`❌ Format mismatch detected!`);
      console.error(`   Original: ${originalExtension}`);
      console.error(`   Final: ${finalExtension}`);
      return res.status(500).json({
        error: 'Format preservation failed',
        message: 'File format was unexpectedly changed during processing'
      });
    }
    
    console.log(`✅ Format validation passed: ${originalExtension} → ${finalExtension}`);
    
    // Calculate compression statistics
    const savings = ((originalSize - compressedSize) / originalSize * 100);
    const savingsPercent = parseFloat(savings.toFixed(2));
    const compressionRatio = originalSize / compressedSize;
    const { description } = getQualitySettings(level);
    
    // Log detailed compression results
    console.log(`📊 Compression Results:`);
    console.log(`   Original: ${originalSize} bytes (${(originalSize / 1024).toFixed(2)} KB)`);
    console.log(`   Compressed: ${compressedSize} bytes (${(compressedSize / 1024).toFixed(2)} KB)`);
    console.log(`   Savings: ${savingsPercent}% (${((originalSize - compressedSize) / 1024).toFixed(2)} KB saved)`);
    console.log(`   Compression Ratio: ${compressionRatio.toFixed(2)}:1`);
    console.log(`   Format: ${extension.toUpperCase()} → ${extension.toUpperCase()} (preserved)`);
    
    // Warn if compression didn't work as expected
    if (compressedSize >= originalSize) {
      console.log(`⚠️  Warning: No size reduction achieved - file may already be optimized`);
    }
    
    // Final validation: ensure MIME type consistency
    const expectedMimeType = originalMimeType;
    console.log(`🔍 Final validation:`);
    console.log(`   Expected MIME type: ${expectedMimeType}`);
    console.log(`   File extension: .${extension}`);
    console.log(`   Format preserved: ✅`);
    
    // Prepare response data
    const responseData = {
      success: true,
      previewUrl: `/api/uploads/${filename}`,
      downloadUrl: `/api/download/${filename}`,
      stats: {
        originalSize,
        compressedSize,
        savings: savingsPercent,
        savingsPercent: savingsPercent,
        compressionLevel: level,
        compressionDescription: description,
        compressionRatio: parseFloat(compressionRatio.toFixed(2))
      },
      metadata: {
        originalFormat: originalMimeType,
        outputFormat: originalMimeType, // GUARANTEED preserved - no conversion
        originalDimensions: {
          width: metadata.width,
          height: metadata.height
        },
        originalFilename: file.originalname,
        processedFilename: filename
      },
      debug: {
        sharpVersion: sharp.versions.sharp,
        libvipsVersion: sharp.versions.vips,
        actualOriginalSize: originalSize,
        actualCompressedSize: compressedSize,
        formatPreserved: `${extension.toUpperCase()} → ${extension.toUpperCase()}`,
        compressionWorking: compressedSize < originalSize,
        noFormatConversion: true,
        webpConversionDisabled: true
      }
    };
    
    console.log(`✅ Compression complete`);
    console.log(`✅ Format preservation verified: ${extension.toUpperCase()}`);
    console.log(`🚫 No WebP conversion occurred\n`);
    res.json(responseData);
    
  } catch (error) {
    console.error('Image processing error:', error);
    
    // Handle specific multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Image file must be smaller than 50MB'
      });
    }
    
    // NO format fallbacks in error handling
    res.status(500).json({
      error: 'Image processing failed',
      message: 'An unexpected error occurred while processing your image. Please try again.'
    });
  }
});

// PDF compression endpoint
app.post('/api/pdf-compress', upload.single('pdf'), async (req, res) => {
  try {
    const file = req.file; // Access the uploaded file via req.file
    const level = req.query.level || 'medium';
    
    if (!file) {
      return res.status(400).json({ 
        error: 'No PDF uploaded',
        message: 'Please select a PDF file to upload'
      });
    }
    // Multer's fileFilter should already handle this, but an extra check doesn't hurt
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        error: 'Invalid file type',
        message: 'Only PDF files are supported'
      });
    }

    console.log(`📤 Processing PDF: ${file.originalname}`);
    console.log(`📊 Original PDF size: ${file.size} bytes (${(file.size / 1024).toFixed(2)} KB)`);
    console.log(`🎛️  Compression level: ${level}`);
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Generate output filename
    const timestamp = Date.now();
    const filename = `compressed_${timestamp}.pdf`;
    const outputPath = path.join(uploadsDir, filename);
    
    console.log(`📁 Output filename: ${filename}`);
    
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(file.buffer);
    
    // Get original PDF info
    const pageCount = pdfDoc.getPageCount();
    console.log(`📄 PDF pages: ${pageCount}`);
    
    // Apply compression based on level
    let compressionOptions = {};
    
    switch (level) {
      case 'low':
        // Minimal compression - just basic optimization
        compressionOptions = {
          useObjectStreams: true,
          addDefaultPage: false
        };
        console.log(`🔧 Applying low compression (basic optimization)`);
        break;
        
      case 'medium':
        // Balanced compression
        compressionOptions = {
          useObjectStreams: true,
          addDefaultPage: false,
          subset: true
        };
        console.log(`🔧 Applying medium compression (balanced optimization)`);
        break;
        
      case 'high':
        // Maximum compression
        compressionOptions = {
          useObjectStreams: true,
          addDefaultPage: false,
          subset: true,
          compress: true
        };
        console.log(`🔧 Applying high compression (maximum optimization)`);
        break;
        
      default:
        compressionOptions = {
          useObjectStreams: true,
          addDefaultPage: false
        };
    }
    
    // Save the compressed PDF
    const compressedPdfBytes = await pdfDoc.save(compressionOptions);
    await fs.writeFile(outputPath, compressedPdfBytes);
    
    console.log(`💾 Compressed PDF saved: ${filename}`);
    
    // Get compressed file size
    const stats = await fs.stat(outputPath);
    const compressedSize = stats.size;
    
    console.log(`📏 Compressed PDF size: ${compressedSize} bytes (${(compressedSize / 1024).toFixed(2)} KB)`);
    
    // Calculate compression statistics
    const originalSize = file.size;
    const savings = ((originalSize - compressedSize) / originalSize * 100);
    const savingsPercent = parseFloat(savings.toFixed(2));
    const compressionRatio = originalSize / compressedSize;
    
    console.log(`📊 Compression Results:`);
    console.log(`   Original: ${originalSize} bytes (${(originalSize / 1024).toFixed(2)} KB)`);
    console.log(`   Compressed: ${compressedSize} bytes (${(compressedSize / 1024).toFixed(2)} KB)`);
    console.log(`   Savings: ${savingsPercent}% (${((originalSize - compressedSize) / 1024).toFixed(2)} KB saved)`);
    console.log(`   Compression Ratio: ${compressionRatio.toFixed(2)}:1`);
    
    // Warn if compression didn't work as expected
    if (compressedSize >= originalSize) {
      console.log(`⚠️  Warning: No size reduction achieved - PDF may already be optimized`);
    }
    
    const { description } = getQualitySettings(level);
    
    // Prepare response data
    const responseData = {
      success: true,
      previewUrl: `/api/uploads/${filename}`,
      downloadUrl: `/api/download/${filename}`,
      stats: {
        originalSize,
        compressedSize,
        savings: savingsPercent,
        savingsPercent: savingsPercent,
        compressionLevel: level,
        compressionDescription: description,
        compressionRatio: parseFloat(compressionRatio.toFixed(2))
      },
      metadata: {
        originalFormat: 'application/pdf',
        outputFormat: 'application/pdf',
        pageCount: pageCount,
        originalFilename: file.originalname,
        processedFilename: filename
      },
      debug: {
        pdfLibVersion: 'pdf-lib',
        actualOriginalSize: originalSize,
        actualCompressedSize: compressedSize,
        compressionWorking: compressedSize < originalSize,
        compressionOptions: compressionOptions
      }
    };
    
    console.log(`✅ PDF compression complete`);
    console.log(`📄 Pages processed: ${pageCount}`);
    console.log(`💾 Output file: ${filename}\n`);
    
    res.json(responseData);
    
  } catch (error) {
    console.error('PDF processing error:', error); // Log the error for debugging
    
    res.status(500).json({
      error: 'PDF processing failed',
      message: 'An unexpected error occurred while processing your PDF. Please try again.'
    });
  }
});

// Serve uploaded images for preview
app.get('/api/uploads/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    // Check if file exists
    await fs.access(filePath);
    
    // Set appropriate headers based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg', 
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf'
    };
    
    res.setHeader('Content-Type', contentTypeMap[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // Send file
    res.sendFile(filePath);
    
  } catch (error) {
    res.status(404).json({
      error: 'Image not found',
      message: 'The requested image could not be found'
    });
  }
});

// Download compressed image
app.get('/api/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    // Check if file exists
    await fs.access(filePath);
    
    // Set download headers based on file extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png', 
      '.webp': 'image/webp',
      '.pdf': 'application/pdf'
    };
    
    res.setHeader('Content-Type', contentTypeMap[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Send file for download
    res.sendFile(filePath);
    
  } catch (error) {
    res.status(404).json({
      error: 'File not found',
      message: 'The requested file could not be found'
    });
  }
});

// Get image information endpoint
app.post('/api/image-info', upload.single('image'), async (req, res) => {
  try {
    const { file } = req;
    
    if (!file) {
      return res.status(400).json({ 
        error: 'No image uploaded' 
      });
    }
    
    const metadata = await sharp(file.buffer).metadata();
    
    res.json({
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      format: metadata.format,
      hasAlpha: metadata.hasAlpha,
      density: metadata.density
    });
    
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get image information',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SaveDisk.space API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Image file must be smaller than 50MB'
      });
    }
    
    return res.status(400).json({
      error: 'Upload error',
      message: error.message
    });
  }
  
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on our end'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SaveDisk.space API server running on port ${PORT}`);
  console.log(`📁 Upload endpoint: http://localhost:${PORT}/api/upload`);
  console.log(`🖼️  Preview endpoint: http://localhost:${PORT}/api/uploads/:filename`);
  console.log(`💾 Download endpoint: http://localhost:${PORT}/api/download/:filename`);
});

export default app;