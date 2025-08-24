import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Upload, CheckCircle, Loader2, AlertCircle, RefreshCw, Clock, Trash2 } from 'lucide-react';
import { StageProps } from '../../types';
import { uploadFileToS3 } from '../../../../utils/awsConfig';
import { useSupabaseUserId } from '../../../../hooks/useSupabaseUserId';
import { supabase } from '../../../../lib/supabase';

// Add interface for ref methods
export interface PrototypeStageRef {
  uploadSelectedFile: () => Promise<boolean>;
}

const PrototypeStage = forwardRef(
  ({ formData, onFormDataChange, isMobileHorizontal }: StageProps, ref: React.ForwardedRef<PrototypeStageRef>) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [s3Url, setS3Url] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileValidationError, setFileValidationError] = useState<string | null>(null);
  const MAX_RETRY_ATTEMPTS = 3;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userId } = useSupabaseUserId();
  
  // Focus the file input when the component mounts (stage changes)
  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(focusTimeout);
  }, []);

  // Expose upload method to parent via ref
  useImperativeHandle(ref, () => ({
    uploadSelectedFile: async (): Promise<boolean> => {
      if (!selectedFile) {
        console.log('No file selected to upload');
        return true; // No file is OK for optional stage
      }
      
      try {
        return await uploadFileToCloud(selectedFile);
      } catch (error) {
        console.error('Upload failed during confirmation:', error);
        return false;
      }
    }
  }));

  const uploadFileToCloud = async (file: File, isRetry = false): Promise<boolean> => {
    try {
      setIsUploading(true);
      setUploadError(null);
      
      if (!isRetry) {
        setRetryCount(0);
      }
      
      // Generate custom filename with user ID
      const fileExtension = file.name.split('.').pop() || 'pdf';
      const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const timestamp = Date.now();
      const customFileName = userId 
        ? `prototypes/${userId}_${timestamp}_${sanitizedOriginalName}`
        : `prototypes/anonymous_${timestamp}_${sanitizedOriginalName}`;
      
      // Upload to S3 with custom filename
      const s3Location = await uploadFileToS3(file, customFileName);
      
      if (!s3Location) {
        throw new Error('Upload failed: No URL returned');
      }
      
      setS3Url(s3Location);
      console.log('File uploaded successfully to S3:', s3Location);
      
      // Save the S3 URL and filename to the database
      try {
        if (userId) {
          console.log('💾 Saving S3 file data to database...');
          const { error: dbError } = await supabase
            .from('level2_screen3_progress')
            .update({
              stage9_prototype_file_name: customFileName,
              stage9_prototype_file_data: s3Location,
            })
            .eq('user_id', userId);
          
          if (dbError) {
            console.error('❌ Failed to save S3 file data to database:', dbError);
            // Don't fail the upload, but log the error
          } else {
            console.log('✅ S3 file data saved to database successfully');
          }
        }
      } catch (dbSaveError) {
        console.error('❌ Error saving S3 file data to database:', dbSaveError);
        // Don't fail the upload, but log the error
      }
      
      // Reset retry count on successful upload
      setRetryCount(0);
      return true;
      
    } catch (uploadError: any) {
      console.error('S3 upload failed:', uploadError);
      
      let errorMessage = 'Failed to upload file to cloud storage.';
      
      // Handle specific error types
      if (uploadError?.name === 'NetworkError' || uploadError?.code === 'NetworkingError') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (uploadError?.code === 'AccessDenied') {
        errorMessage = 'Access denied. Please contact support.';
      } else if (uploadError?.code === 'InvalidAccessKeyId') {
        errorMessage = 'Authentication error. Please contact support.';
      } else if (uploadError?.code === 'SignatureDoesNotMatch') {
        errorMessage = 'Authentication signature error. Please contact support.';
      } else if (uploadError?.message?.includes('fetch')) {
        errorMessage = 'Connection failed. Please check your internet and try again.';
      } else if (uploadError?.message?.includes('timeout')) {
        errorMessage = 'Upload timed out. Please try with a smaller file or better connection.';
      } else if (uploadError?.message) {
        errorMessage = uploadError.message;
      }
      
      // Add retry information to error message
      if (retryCount > 0) {
        errorMessage += ` (Attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS + 1})`;
      }
      
      setUploadError(errorMessage);
      return false;
      
    } finally {
      setIsUploading(false);
    }
  };

  const isPdfFile = (file: File): boolean => {
    // Multiple validation layers for PDF files
    
    // 1. Check MIME type
    if (file.type !== 'application/pdf') {
      return false;
    }
    
    // 2. Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      return false;
    }
    
    // 3. Additional MIME type checks (some browsers may report different types)
    const allowedMimeTypes = [
      'application/pdf',
      'application/x-pdf',
      'application/x-bzpdf',
      'application/x-gzpdf'
    ];
    
    return allowedMimeTypes.includes(file.type);
  };

  const validateAndSelectFile = (file: File): boolean => {
    // Reset previous states
    setFileValidationError(null);
    setUploadError(null);
    setS3Url(null);
    
    try {
      // Enhanced PDF validation
      if (!isPdfFile(file)) {
        throw new Error('Only PDF files are allowed. Please select a valid PDF document.');
      }
      
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        throw new Error('File size must be less than 2MB');
      }
      
      // File is valid - store it locally
      setSelectedFile(file);
      onFormDataChange('file', file); // Update form data for UI purposes
      console.log('File selected and validated:', file.name);
      return true;
      
    } catch (error: any) {
      console.error('File validation error:', error);
      setFileValidationError(error.message || 'File validation failed');
      return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || !e.target.files[0]) {
        return;
      }

      const file = e.target.files[0];
      validateAndSelectFile(file);
      
    } finally {
      // Clear the input to allow re-uploading the same file if needed
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleRetryUpload = async () => {
    if (!selectedFile) {
      setUploadError('No file to retry upload');
      return;
    }
    
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setUploadError('Maximum retry attempts reached. Please try selecting the file again.');
      return;
    }
    
    try {
      setRetryCount(prev => prev + 1);
      await uploadFileToCloud(selectedFile, true);
    } catch (error) {
      console.error('Retry upload failed:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    try {
      const files = Array.from(e.dataTransfer.files);
      
      if (files.length === 0) {
        setFileValidationError('No files dropped');
        return;
      }
      
      if (files.length > 1) {
        setFileValidationError('Please drop only one PDF file at a time.');
        return;
      }
      
      const file = files[0];
      validateAndSelectFile(file);
      
    } catch (error: any) {
      console.error('File drop error:', error);
      setFileValidationError(error.message || 'File drop failed');
    }
  };

  const handleRemoveFile = async () => {
    // Reset all file-related state
    setSelectedFile(null);
    setS3Url(null);
    setUploadError(null);
    setFileValidationError(null);
    setRetryCount(0);
    onFormDataChange('file', null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear S3 data from database
    try {
      if (userId) {
        console.log('🗑️ Clearing S3 file data from database...');
        const { error: dbError } = await supabase
          .from('level2_screen3_progress')
          .update({
            stage9_prototype_file_name: null,
            stage9_prototype_file_data: null,
          })
          .eq('user_id', userId);
        
        if (dbError) {
          console.error('❌ Failed to clear S3 file data from database:', dbError);
        } else {
          console.log('✅ S3 file data cleared from database successfully');
        }
      }
    } catch (dbClearError) {
      console.error('❌ Error clearing S3 file data from database:', dbClearError);
    }
    
    console.log('File removed successfully');
  };

  return (
    <div className={`${isMobileHorizontal ? 'space-y-3' : 'space-y-8'} animate-fadeIn`}>
      <div className="space-y-6">
        <div className="group">
          <div className="pixel-border-thick bg-gray-900/50 p-4 relative overflow-hidden group-hover:bg-gray-900/70 transition-all duration-300">
            <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
            <div className="relative z-10">
              {/* Stage Header moved inside */}
              <div className={`text-center ${isMobileHorizontal ? 'mb-3' : 'mb-6'}`}>
                <div className="pixel-border-thick bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                      <div className="pixel-border bg-gradient-to-br from-gray-500 to-slate-500 p-3 relative overflow-hidden">
                        <Upload className="w-8 h-8 text-white" />
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-slate-500 blur-sm opacity-50 -z-10"></div>
                      </div>
                      <div>
                        <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xl' : 'text-4xl'} font-black text-white mb-1`} style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(100,116,139,0.3)' }}>
                          PROTOTYPE/DEMO/SKETCH
                        </h2>
                        <div className="flex items-center justify-center space-x-2">
                          <span className="pixel-text text-xs font-bold text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                            OPTIONAL
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-2 leading-relaxed text-center`}>
                Upload your prototype, demo, or sketch as a PDF document.
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="pixel-text text-xs font-bold text-red-400 bg-red-900/30 px-2 py-1 rounded border border-red-500/30">
                  📄 PDF ONLY
                </span>
                <span className="pixel-text text-xs font-bold text-blue-400 bg-blue-900/30 px-2 py-1 rounded border border-blue-500/30">
                  📏 MAX 2MB
                </span>
              </div>
              
              <div 
                className={`border-2 border-dashed ${
                  isDragOver 
                    ? 'border-pink-400 bg-pink-900/20' 
                    : 'border-gray-600 hover:border-gray-500'
                } text-center transition-colors duration-300 bg-gray-900/50 ${isMobileHorizontal ? 'p-4' : 'p-8'} relative`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`${isMobileHorizontal ? 'w-12 h-12' : 'w-16 h-16'} ${
                  isDragOver ? 'text-pink-400' : 'text-gray-400'
                } mx-auto mb-4 transition-colors duration-300`} />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className={`${isMobileHorizontal ? 'text-base' : 'text-lg'} font-black text-white mb-2 block`}>
                    {isDragOver ? 'DROP YOUR PDF HERE' : 'UPLOAD PDF PROTOTYPE'}
                  </span>
                  <span className={`${
                    isDragOver ? 'text-pink-300' : 'text-gray-400'
                  } block mb-4 font-bold ${isMobileHorizontal ? 'text-sm' : ''} transition-colors duration-300`}>
                    {isDragOver ? 'RELEASE TO SELECT PDF' : 'DRAG & DROP OR CLICK TO BROWSE'}
                  </span>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div 
                    className={`pixel-border inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-pink-600 hover:to-yellow-600 text-white transition-colors duration-300 font-black shadow-lg ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 mr-2" />
                    )}
                    {isUploading ? 'UPLOADING...' : 'SELECT FILE'}
                  </div>
                </label>
                {/* File Validation Error Display */}
                {fileValidationError && (
                  <div 
                    className={`pixel-border mt-4 bg-red-900/30 relative overflow-hidden ${isMobileHorizontal ? 'p-3' : 'p-4'}`}
                  >
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 4px,
                          rgba(255,0,0,0.1) 4px,
                          rgba(255,0,0,0.1) 8px
                        )`
                      }}></div>
                    </div>
                    <div className="relative z-10">
                      <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <p className="text-red-300 text-sm font-bold text-center">{fileValidationError}</p>
                    </div>
                  </div>
                )}

                {/* Upload Error Display */}
                {uploadError && (
                  <div 
                    className={`pixel-border mt-4 bg-red-900/30 relative overflow-hidden ${isMobileHorizontal ? 'p-3' : 'p-4'}`}
                  >
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 4px,
                          rgba(255,0,0,0.1) 4px,
                          rgba(255,0,0,0.1) 8px
                        )`
                      }}></div>
                    </div>
                    <div className="relative z-10">
                      <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <p className="text-red-300 text-sm font-bold text-center mb-3">{uploadError}</p>
                      
                      {/* Retry Button */}
                      {selectedFile && retryCount < MAX_RETRY_ATTEMPTS && (
                        <div className="text-center">
                          <button
                            onClick={handleRetryUpload}
                            disabled={isUploading}
                            className={`pixel-border inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white transition-colors duration-300 font-black text-sm ${
                              isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
                            }`}
                          >
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            {isUploading ? 'RETRYING...' : `RETRY UPLOAD (${retryCount}/${MAX_RETRY_ATTEMPTS})`}
                          </button>
                        </div>
                      )}
                      
                      {/* Max retries reached message */}
                      {retryCount >= MAX_RETRY_ATTEMPTS && (
                        <div className="text-center mt-2">
                          <p className="text-red-200 text-xs font-bold">
                            Max retry attempts reached. Please select the file again.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* File Selected - Pending Upload */}
                {formData.file && !s3Url && !uploadError && !isUploading && (
                  <div 
                    className={`pixel-border mt-4 bg-blue-900/30 relative overflow-hidden ${isMobileHorizontal ? 'p-3' : 'p-4'}`}
                  >
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 4px,
                          rgba(59,130,246,0.1) 4px,
                          rgba(59,130,246,0.1) 8px
                        )`
                      }}></div>
                    </div>
                    <div className="relative z-10">
                      <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <span className="text-blue-400 font-black block">{formData.file.name}</span>
                      <p className="text-blue-300 text-sm mt-1 font-bold">
                        FILE READY - WILL UPLOAD WHEN YOU PROCEED
                      </p>
                      <p className="text-blue-200 text-xs mt-1 mb-3">
                        Click "PROCEED" to upload this file to cloud storage
                      </p>
                      
                      {/* Remove Button */}
                      <div className="text-center">
                        <button
                          onClick={handleRemoveFile}
                          className="pixel-border inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-colors duration-300 font-black text-sm hover:shadow-lg"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* File Uploaded Successfully */}
                {formData.file && s3Url && (
                  <div 
                    className={`pixel-border mt-4 bg-green-900/30 relative overflow-hidden ${isMobileHorizontal ? 'p-3' : 'p-4'}`}
                  >
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `repeating-linear-gradient(
                          45deg,
                          transparent,
                          transparent 4px,
                          rgba(0,255,0,0.1) 4px,
                          rgba(0,255,0,0.1) 8px
                        )`
                      }}></div>
                    </div>
                    <div className="relative z-10">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <span className="text-green-400 font-black">{formData.file.name}</span>
                      <p className="text-green-300 text-sm mt-1 font-bold">
                        FILE UPLOADED TO CLOUD STORAGE
                      </p>
                      <p className="text-green-200 text-xs mt-1 break-all mb-3">
                        URL: {s3Url}
                      </p>
                      
                      {/* Remove Button */}
                      <div className="text-center">
                        <button
                          onClick={handleRemoveFile}
                          className="pixel-border inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-colors duration-300 font-black text-sm hover:shadow-lg"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Progress Indicator */}
                <div className="absolute top-2 right-2">
                  {isUploading ? (
                    <div className="flex items-center space-x-1">
                      <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                    </div>
                  ) : formData.file ? (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-3 h-3 border-2 border-gray-500 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}) as React.ForwardRefExoticComponent<StageProps & React.RefAttributes<PrototypeStageRef>>;

export default PrototypeStage;
