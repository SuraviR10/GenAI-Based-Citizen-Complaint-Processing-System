import { supabase, isSupabaseConfigured } from './supabase';

export interface UploadResult {
  url: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
}

const BUCKET_NAME = 'evidence-files';
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
  
  if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file format "${file.type}". Only JPG, PNG, and WebP images are allowed.`
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds the maximum 5MB size limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`
    };
  }

  return { valid: true };
};

export const uploadEvidenceImage = async (
  file: File,
  userId: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> => {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (!isSupabaseConfigured()) {
    // If Supabase credentials are not yet entered, generate a local blob object preview URL so the user can test the UI smoothly
    const blobUrl = URL.createObjectURL(file);
    if (onProgress) onProgress(100);
    return {
      url: blobUrl,
      storagePath: `local_preview/${file.name}`,
      fileName: file.name,
      fileSize: file.size
    };
  }

  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniquePath = `${userId}/${Date.now()}_${cleanFileName}`;

  if (onProgress) onProgress(30);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(uniquePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  if (onProgress) onProgress(80);

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  if (onProgress) onProgress(100);

  return {
    url: publicUrlData.publicUrl,
    storagePath: data.path,
    fileName: file.name,
    fileSize: file.size
  };
};
