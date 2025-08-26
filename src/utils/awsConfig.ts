import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// AWS Configuration using Vite environment variables
// Note: Vite only exposes variables prefixed with VITE_
const AWS_ACCESS_KEY_ID = import.meta.env.VITE_AWS_ACCESS_KEY_ID!;
const AWS_SECRET_ACCESS_KEY = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY!;
const AWS_REGION = import.meta.env.VITE_AWS_REGION!;
const S3_BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME!;

// Create S3 client
export const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Upload file to S3 bucket
export const uploadFileToS3 = async (file: File, customFileName?: string): Promise<string> => {
  try {
    // Validate environment variables
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !S3_BUCKET_NAME) {
      throw new Error('AWS configuration is missing. Please check environment variables.');
    }
    
    // Validate file
    if (!file) {
      throw new Error('No file provided for upload');
    }
    
    if (file.size === 0) {
      throw new Error('Cannot upload empty file');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size exceeds 10MB limit');
    }
    
    const fileName = customFileName || `prototypes/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Convert file to ArrayBuffer for AWS SDK v3 compatibility
    let fileBuffer: ArrayBuffer;
    try {
      fileBuffer = await file.arrayBuffer();
    } catch (error) {
      throw new Error('Failed to read file contents');
    }
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: fileName,
      Body: new Uint8Array(fileBuffer),
      ContentType: file.type || 'application/pdf',
      // ACL: 'public-read', // Make file publicly accessible
    });

    try {
      const result = await s3Client.send(command);
      
      // Validate the upload result
      if (!result) {
        throw new Error('Upload completed but no result returned');
      }
      
      // Construct the public URL
      const publicUrl = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${fileName}`;
      
      // Basic URL validation
      try {
        new URL(publicUrl);
      } catch (urlError) {
        throw new Error('Generated URL is invalid');
      }
      
      return publicUrl;
    } catch (s3Error: any) {
      console.error('S3 upload error details:', s3Error);
      
      // Handle specific AWS S3 errors
      if (s3Error?.name === 'NoSuchBucket') {
        throw new Error('Storage bucket not found. Please contact support.');
      } else if (s3Error?.name === 'AccessDenied') {
        throw new Error('Access denied to storage. Please contact support.');
      } else if (s3Error?.name === 'InvalidAccessKeyId') {
        throw new Error('Invalid storage credentials. Please contact support.');
      } else if (s3Error?.name === 'SignatureDoesNotMatch') {
        throw new Error('Storage authentication failed. Please contact support.');
      } else if (s3Error?.name === 'NetworkingError' || s3Error?.code === 'NetworkingError') {
        throw new Error('Network error occurred. Please check your connection and try again.');
      } else if (s3Error?.name === 'TimeoutError' || s3Error?.message?.includes('timeout')) {
        throw new Error('Upload timed out. Please try again with a smaller file or better connection.');
      } else {
        // For any other S3 error, provide a generic message but preserve original error for logging
        throw new Error(s3Error?.message || 'Failed to upload file to storage');
      }
    }
  } catch (error: any) {
    console.error('Error in uploadFileToS3:', error);
    
    // If it's already our custom error, re-throw it
    if (error?.message && (
      error.message.includes('AWS configuration') ||
      error.message.includes('No file provided') ||
      error.message.includes('Cannot upload empty') ||
      error.message.includes('File size exceeds') ||
      error.message.includes('Failed to read file') ||
      error.message.includes('Storage bucket') ||
      error.message.includes('Access denied') ||
      error.message.includes('Invalid storage') ||
      error.message.includes('Storage authentication') ||
      error.message.includes('Network error') ||
      error.message.includes('Upload timed out') ||
      error.message.includes('Generated URL')
    )) {
      throw error;
    }
    
    // For any other unexpected error
    throw new Error('An unexpected error occurred during file upload');
  }
};

export { S3_BUCKET_NAME };
