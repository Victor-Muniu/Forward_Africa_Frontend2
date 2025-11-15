import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import Button from './Button';
import Image from 'next/image';
import { useFirebaseImageUpload } from '../../hooks/useFirebaseImageUpload';
import { validateFile } from '../../utils/fileValidator';

interface InstructorImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  instructorId?: string;
  label?: string;
  className?: string;
  required?: boolean;
}

const InstructorImageUpload: React.FC<InstructorImageUploadProps> = ({
  onImageUpload,
  currentImage,
  instructorId: providedInstructorId,
  label = 'Profile Image',
  className = '',
  required = false
}) => {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempInstructorId] = useState<string>(() => {
    return providedInstructorId || `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  });

  const {
    isUploading,
    error,
    uploadFile,
    clearError
  } = useFirebaseImageUpload({
    uploadType: 'instructorImage',
    entityId: tempInstructorId,
    onSuccess: (url) => {
      onImageUpload(url);
    },
    onError: (errorMessage) => {
      setPreview(null);
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file before preview
    const validation = validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    });

    if (!validation.isValid) {
      alert(validation.error || 'Invalid file');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file to Firebase Storage
    uploadFile(file);
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageUpload('');
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    clearError();
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="flex items-center space-x-4">
        {/* Preview */}
        {preview && (
          <div className="relative w-20 h-20">
            <Image
              src={preview}
              alt="Instructor preview"
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-lg border-2 border-gray-600"
              priority={false}
            />
            {!isUploading && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Upload Button */}
        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={isUploading}
            className="w-full flex items-center justify-center space-x-2 py-3"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>{preview ? 'Change Image' : 'Upload Image'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-500/10 border border-red-500/30 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Help Text */}
      <p className="text-xs text-gray-400">
        Supported formats: JPG, PNG, GIF, WebP. Max size: 5MB
      </p>
    </div>
  );
};

export default InstructorImageUpload;
