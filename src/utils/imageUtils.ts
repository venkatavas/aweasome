/**
 * Validates if a file is an acceptable image (PNG or JPG/JPEG)
 */
export const isValidImageFile = (file: File): boolean => {
  const acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  return acceptedTypes.includes(file.type);
};

/**
 * Validates if a file is within the size limit (10MB)
 */
export const isWithinSizeLimit = (file: File): boolean => {
  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  return file.size <= MAX_SIZE_BYTES;
};

/**
 * Downscales an image to a maximum width of 1920px if needed
 * Returns a data URL of the downscaled image
 */
export const downscaleImageIfNeeded = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const MAX_WIDTH = 1920;
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Check if downscaling is needed
        if (img.width <= MAX_WIDTH) {
          // No need to downscale, return the original data URL
          resolve(event.target?.result as string);
          return;
        }
        
        // Calculate new dimensions while maintaining aspect ratio
        const scaleFactor = MAX_WIDTH / img.width;
        const newWidth = MAX_WIDTH;
        const newHeight = img.height * scaleFactor;
        
        // Create a canvas to draw the downscaled image
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL(file.type);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};