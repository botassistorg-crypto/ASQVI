// ImageBB API Configuration
const IMGBB_API_KEY = '249d6156eb00d39b61ac4b421fd59003';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

// ── IMAGE PROCESSING CONFIG ───────────────────────────────
const TARGET_SIZE = 800;           // 800 x 800 px
const BACKGROUND_COLOR = '#FAF9F6'; // ASQVI natural white
const WEBP_QUALITY = 0.85;         // 85% quality — good balance
const MAX_FILE_KB = 200;           // Target under 200KB
const PADDING = 40;                // Padding around image inside canvas

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  originalSize?: number;
  processedSize?: number;
}

// ============ MAIN UPLOAD FUNCTION ============

/**
 * Process + Upload image to ImageBB
 * Auto-resizes to 800x800, converts to WebP, adds background
 */
export async function uploadImage(file: File): Promise<UploadResult> {
  try {
    const originalSize = file.size;

    // ── Step 1: Process the image ──
    const processedFile = await processImage(file);
    const processedSize = processedFile.size;

    // ── Step 2: Convert to base64 ──
    const base64 = await fileToBase64(processedFile);

    // ── Step 3: Upload to ImageBB ──
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', base64.split(',')[1]);

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        url: result.data.url,
        originalSize,
        processedSize,
      };
    } else {
      return {
        success: false,
        error: result.error?.message || 'Upload failed',
      };
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// ============ IMAGE PROCESSOR ============

/**
 * Transforms any image to:
 * - 800 x 800 px square canvas
 * - #FAF9F6 background (ASQVI natural white)
 * - Image centered with padding, aspect ratio preserved
 * - WebP format at 85% quality
 * - If still over 200KB, quality is reduced automatically
 */
async function processImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      try {
        // ── Create 800x800 canvas ──
        const canvas = document.createElement('canvas');
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }

        // ── Fill background ──
        ctx.fillStyle = BACKGROUND_COLOR;
        ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

        // ── Calculate centered position with padding ──
        const drawArea = TARGET_SIZE - PADDING * 2;
        const scale = Math.min(drawArea / img.width, drawArea / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const drawX = (TARGET_SIZE - drawWidth) / 2;
        const drawY = (TARGET_SIZE - drawHeight) / 2;

        // ── Enable smooth rendering ──
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // ── Draw image centered ──
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // ── Export as WebP, reduce quality if over 200KB ──
        const processedFile = await canvasToFile(canvas, file.name);
        resolve(processedFile);

      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}

// ============ CANVAS TO FILE WITH AUTO COMPRESSION ============

/**
 * Converts canvas to WebP File
 * Auto-reduces quality if file is over 200KB
 */
async function canvasToFile(canvas: HTMLCanvasElement, originalName: string): Promise<File> {
  const maxBytes = MAX_FILE_KB * 1024;
  let quality = WEBP_QUALITY;
  let blob: Blob | null = null;

  // Try WebP first, reduce quality if too large
  for (let attempt = 0; attempt < 6; attempt++) {
    blob = await canvasToBlob(canvas, 'image/webp', quality);
    if (!blob) break;
    if (blob.size <= maxBytes) break;
    quality -= 0.1; // Reduce quality by 10% each attempt
    if (quality < 0.3) break; // Never go below 30% quality
  }

  // Fallback: if WebP not supported, try JPEG
  if (!blob || blob.size === 0) {
    blob = await canvasToBlob(canvas, 'image/jpeg', 0.85);
  }

  if (!blob) {
    throw new Error('Failed to process image');
  }

  // Generate clean filename
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9]/gi, '-');
  const fileName = `${baseName}-asqvi.webp`;

  return new File([blob], fileName, { type: 'image/webp' });
}

// ============ HELPERS ============

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), type, quality);
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// ============ VALIDATION ============

/**
 * Validate if file is a valid image
 * Accepts any common image format — will be converted to WebP
 */
export function isValidImage(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
  ];
  const maxSize = 32 * 1024 * 1024; // 32MB max input
  return validTypes.includes(file.type) && file.size <= maxSize;
}

/**
 * Get file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
