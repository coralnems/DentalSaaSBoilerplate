// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Image validation error types
export type ImageValidationError =
  | 'FILE_TOO_LARGE'
  | 'INVALID_TYPE'
  | 'INVALID_DIMENSIONS'
  | 'LOAD_ERROR';

// Image validation result
export interface ImageValidationResult {
  isValid: boolean;
  error?: ImageValidationError;
  message?: string;
}

// Image dimensions interface
export interface ImageDimensions {
  width: number;
  height: number;
}

// Validate image file
export const validateImage = async (
  file: File,
  maxSize: number = MAX_FILE_SIZE,
  allowedTypes: string[] = ALLOWED_IMAGE_TYPES,
  minDimensions?: ImageDimensions,
  maxDimensions?: ImageDimensions
): Promise<ImageValidationResult> => {
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'FILE_TOO_LARGE',
      message: `File size must be less than ${formatFileSize(maxSize)}`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'INVALID_TYPE',
      message: `File type must be one of: ${allowedTypes.join(', ')}`,
    };
  }

  // Check dimensions if required
  if (minDimensions || maxDimensions) {
    try {
      const dimensions = await getImageDimensions(file);

      if (minDimensions) {
        if (dimensions.width < minDimensions.width || dimensions.height < minDimensions.height) {
          return {
            isValid: false,
            error: 'INVALID_DIMENSIONS',
            message: `Image dimensions must be at least ${minDimensions.width}x${minDimensions.height}px`,
          };
        }
      }

      if (maxDimensions) {
        if (dimensions.width > maxDimensions.width || dimensions.height > maxDimensions.height) {
          return {
            isValid: false,
            error: 'INVALID_DIMENSIONS',
            message: `Image dimensions must be at most ${maxDimensions.width}x${maxDimensions.height}px`,
          };
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'LOAD_ERROR',
        message: 'Failed to load image dimensions',
      };
    }
  }

  return { isValid: true };
};

// Get image dimensions
export const getImageDimensions = (file: File): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
};

// Format file size to human readable string
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Convert base64 to blob
export const base64ToBlob = (base64: string, type: string = 'image/jpeg'): Blob => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type });
};

// Convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Failed to convert blob to base64'));
    };
    reader.readAsDataURL(blob);
  });
};

// Resize image maintaining aspect ratio
export const resizeImage = async (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to convert canvas to blob'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
};

// Create image thumbnail
export const createThumbnail = async (
  file: File,
  size: number = 100,
  quality: number = 0.6
): Promise<string> => {
  const blob = await resizeImage(file, size, size, quality);
  return blobToBase64(blob);
};

// Get image orientation from EXIF data
export const getImageOrientation = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result || typeof e.target.result !== 'string') {
        resolve(1);
        return;
      }

      const view = new DataView(e.target.result as unknown as ArrayBuffer);
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(1);
        return;
      }

      const length = view.byteLength;
      let offset = 2;

      while (offset < length) {
        const marker = view.getUint16(offset, false);
        offset += 2;

        if (marker === 0xFFE1) {
          if (view.getUint32(offset += 2, false) !== 0x45786966) {
            resolve(1);
            return;
          }
          const little = view.getUint16(offset += 6, false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          const tags = view.getUint16(offset, little);
          offset += 2;

          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + (i * 12), little) === 0x0112) {
              resolve(view.getUint16(offset + (i * 12) + 8, little));
              return;
            }
          }
        } else if ((marker & 0xFF00) !== 0xFF00) {
          break;
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      resolve(1);
    };
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}; 