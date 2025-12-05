/**
 * Storage Service for Web
 * Web-compatible file upload operations using browser APIs
 */

import { supabase } from '../lib/supabase';
import type { UploadResult } from '../../services/storageService';

// ============================================================================
// CONSTANTS
// ============================================================================

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// ============================================================================
// AVATAR UPLOAD (Web Version)
// ============================================================================

/**
 * Upload user avatar (web version)
 * @param userId - User's ID (used as folder name)
 * @param fileUri - File URI or File object (web-compatible)
 * @returns Public URL of uploaded avatar
 */
export async function uploadAvatar(
  userId: string,
  fileUri: string | File
): Promise<UploadResult> {
  try {
    let file: File;
    let fileName: string;

    // Handle different input types
    if (fileUri instanceof File) {
      file = fileUri;
      fileName = file.name;
    } else if (typeof fileUri === 'string') {
      // If it's a data URL or blob URL, convert to File
      if (fileUri.startsWith('data:')) {
        // Data URL
        const response = await fetch(fileUri);
        const blob = await response.blob();
        file = new File([blob], 'avatar.png', { type: blob.type });
        fileName = 'avatar.png';
      } else if (fileUri.startsWith('blob:')) {
        // Blob URL
        const response = await fetch(fileUri);
        const blob = await response.blob();
        file = new File([blob], 'avatar.png', { type: blob.type });
        fileName = 'avatar.png';
      } else {
        // Assume it's a URL - fetch and convert
        const response = await fetch(fileUri);
        const blob = await response.blob();
        file = new File([blob], 'avatar.png', { type: blob.type });
        fileName = 'avatar.png';
      }
    } else {
      throw new Error('Invalid file input');
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`);
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = fileName.split('.').pop() || 'png';
    const uniqueFileName = `${userId}/${timestamp}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(uniqueFileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      console.error('Avatar upload error:', error);
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error: any) {
    console.error('Upload avatar error:', error);
    throw new Error(error?.message || 'Failed to upload avatar');
  }
}

/**
 * Convert File to base64 data URL (for preview)
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Create file input element and trigger file picker
 */
export function triggerFilePicker(
  accept: string = 'image/*',
  multiple: boolean = false
): Promise<FileList | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      resolve(target.files);
    };
    input.click();
  });
}

