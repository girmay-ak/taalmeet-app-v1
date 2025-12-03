/**
 * Storage Service
 * Clean, production-ready file upload operations
 */

import { supabase } from '@/lib/supabase';
import {
  StorageError,
  FileUploadError,
  FileTooLargeError,
  InvalidFileTypeError,
  parseSupabaseError,
} from '@/utils/errors';
import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';

// ============================================================================
// CONSTANTS
// ============================================================================

const AVATAR_BUCKET = 'avatars';
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

// ============================================================================
// TYPES
// ============================================================================

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export interface FileInfo {
  uri: string;
  type: string;
  size?: number;
}

// ============================================================================
// AVATAR UPLOAD
// ============================================================================

/**
 * Upload user avatar
 * @param userId - User's ID (used as folder name)
 * @param fileUri - Local file URI from image picker
 * @returns Public URL of uploaded avatar
 */
export async function uploadAvatar(
  userId: string,
  fileUri: string
): Promise<UploadResult> {
  try {
    // Read file info
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (!fileInfo.exists) {
      throw new FileUploadError('File does not exist');
    }

    // Check file size
    if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE_BYTES) {
      throw new FileTooLargeError(MAX_FILE_SIZE_MB);
    }

    // Get file extension
    const extension = getFileExtension(fileUri);
    const mimeType = getMimeType(extension);

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      throw new InvalidFileTypeError(ALLOWED_IMAGE_TYPES);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}.${extension}`;

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert to ArrayBuffer
    const arrayBuffer = decode(base64);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(fileName, arrayBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('Avatar upload error:', error);
      throw parseSupabaseError(error);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(data.path);

    return {
      path: data.path,
      publicUrl: urlData.publicUrl,
    };
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    console.error('Upload avatar error:', error);
    throw new FileUploadError('Failed to upload avatar');
  }
}

/**
 * Delete user avatar
 */
export async function deleteAvatar(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .remove([filePath]);

  if (error) {
    throw parseSupabaseError(error);
  }
}

/**
 * Delete all avatars for a user
 */
export async function deleteUserAvatars(userId: string): Promise<void> {
  const { data: files, error: listError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(userId);

  if (listError) {
    throw parseSupabaseError(listError);
  }

  if (files && files.length > 0) {
    const filePaths = files.map((file) => `${userId}/${file.name}`);
    
    const { error: deleteError } = await supabase.storage
      .from(AVATAR_BUCKET)
      .remove(filePaths);

    if (deleteError) {
      throw parseSupabaseError(deleteError);
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get file extension from URI
 */
function getFileExtension(uri: string): string {
  const match = uri.match(/\.(\w+)$/);
  if (match) {
    return match[1].toLowerCase();
  }
  // Default to jpeg if no extension found
  return 'jpeg';
}

/**
 * Get MIME type from extension
 */
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  };
  return mimeTypes[extension] || 'image/jpeg';
}

/**
 * Generate avatar URL from path
 */
export function getAvatarUrl(path: string): string {
  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Validate image file before upload
 */
export async function validateImageFile(fileUri: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      return { valid: false, error: 'File does not exist' };
    }

    if (fileInfo.size && fileInfo.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit` };
    }

    const extension = getFileExtension(fileUri);
    const mimeType = getMimeType(extension);

    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return { valid: false, error: 'Invalid file type. Use JPEG, PNG, or WebP.' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Could not validate file' };
  }
}

