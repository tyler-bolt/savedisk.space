# SaveDisk.space - Image & PDF Processing API

A professional Express.js API for image compression and processing with Sharp and Multer.

## Features

- **Image Upload & Compression**: Support for JPEG, PNG, and WebP formats
- **Quality Control**: Three compression levels (low, medium, high)
- **Real-time Preview**: Instant preview of compressed images
- **Compression Stats**: Detailed statistics including file size savings
- **Download Support**: Direct download of compressed images
- **Error Handling**: Comprehensive error handling and validation

## API Endpoints

### POST `/api/upload`
Upload and compress an image.

**Parameters:**
- `image` (file): Image file (JPEG, PNG, or WebP)
- `level` (query): Compression level (`low`, `medium`, `high`)

**Response:**
```json
{
  "success": true,
  "previewUrl": "/api/uploads/compressed_1234567890.jpg",
  "downloadUrl": "/api/download/compressed_1234567890.jpg",
  "stats": {
    "originalSize": 2048576,
    "compressedSize": 512000,
    "savingsPercent": 75.0,
    "compressionLevel": "medium",
    "compressionDescription": "Balanced compression and quality"
  },
  "metadata": {
    "originalFormat": "image/png",
    "outputFormat": "image/jpeg",
    "originalDimensions": { "width": 1920, "height": 1080 },
    "originalFilename": "photo.png",
    "processedFilename": "compressed_1234567890.jpg"
  }
}
```

### GET `/api/uploads/:filename`
Serve compressed image for preview.

### GET `/api/download/:filename`
Download compressed image file.

### POST `/api/image-info`
Get detailed information about an uploaded image.

### GET `/api/health`
Health check endpoint.

## Usage

### Start the API server:
```bash
npm run server
```

### Start both frontend and backend:
```bash
npm run dev:full
```

### Example cURL request:
```bash
curl -X POST \
  -F "image=@/path/to/your/image.jpg" \
  "http://localhost:3001/api/upload?level=medium"
```

## Configuration

- **Port**: Default 3001 (configurable via PORT environment variable)
- **File Size Limit**: 50MB maximum
- **Supported Formats**: JPEG, PNG, WebP
- **Output Format**: Always JPEG for optimal compression
- **Max Dimensions**: 4000x4000px (images are resized if larger)

## Compression Levels

- **Low (90% quality)**: Minimal compression, best quality
- **Medium (70% quality)**: Balanced compression and quality  
- **High (50% quality)**: Maximum compression, smaller files

## Error Handling

The API provides detailed error responses for various scenarios:
- Invalid file types
- File size limits exceeded
- Processing errors
- Missing files

All errors include both an error code and user-friendly message.