// Verification Service for TAALMEET
// Handles ID verification and face recognition

import { supabase } from "@/lib/supabase";
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import type {
  VerificationSession,
  IDDocument,
  FaceRecognition,
  VerificationAttempt,
  UploadIDCardRequest,
  UploadSelfieRequest,
  FaceRecognitionRequest,
  VerificationResult,
  VerificationSessionType,
  DocumentType,
} from "@/types/verification";

// ============================================
// VERIFICATION SESSIONS
// ============================================

export async function createVerificationSession(
  sessionType: VerificationSessionType
): Promise<VerificationSession> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("verification_sessions")
    .insert({
      user_id: user.id,
      session_type: sessionType,
      status: 'in_progress',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getVerificationSession(
  sessionId: string
): Promise<VerificationSession | null> {
  const { data, error } = await supabase
    .from("verification_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function getUserVerificationSessions(): Promise<VerificationSession[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("verification_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateVerificationSession(
  sessionId: string,
  updates: Partial<VerificationSession>
): Promise<VerificationSession> {
  const { data, error } = await supabase
    .from("verification_sessions")
    .update(updates)
    .eq("id", sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function completeVerificationSession(
  sessionId: string
): Promise<VerificationSession> {
  return updateVerificationSession(sessionId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  });
}

// ============================================
// ID DOCUMENT VERIFICATION
// ============================================

async function uploadImageToStorage(
  imageUri: string,
  folder: string,
  fileName: string
): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Read file as base64
  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const filePath = `${folder}/${user.id}/${fileName}`;
  const arrayBuffer = decode(base64);

  const { data, error } = await supabase.storage
    .from('verification-documents')
    .upload(filePath, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('verification-documents')
    .getPublicUrl(filePath);

  return publicUrl;
}

export async function uploadIDCard(
  request: UploadIDCardRequest,
  sessionId?: string
): Promise<IDDocument> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // Upload front image
    const frontImageUrl = await uploadImageToStorage(
      request.front_image,
      'id-cards',
      `front-${Date.now()}.jpg`
    );

    // Upload back image if provided
    let backImageUrl: string | undefined;
    if (request.back_image) {
      backImageUrl = await uploadImageToStorage(
        request.back_image,
        'id-cards',
        `back-${Date.now()}.jpg`
      );
    }

    // Create document record
    const { data, error } = await supabase
      .from("id_documents")
      .insert({
        user_id: user.id,
        verification_session_id: sessionId,
        document_type: request.document_type,
        country_code: request.country_code,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Log attempt
    await logVerificationAttempt(
      user.id,
      sessionId,
      'id_upload',
      'success',
      { document_id: data.id }
    );

    return data;
  } catch (error: any) {
    // Log failed attempt
    await logVerificationAttempt(
      user.id,
      sessionId,
      'id_upload',
      'failure',
      { error: error.message }
    );
    throw error;
  }
}

export async function uploadSelfieWithID(
  request: UploadSelfieRequest,
  sessionId?: string
): Promise<IDDocument> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // Upload selfie image
    const selfieUrl = await uploadImageToStorage(
      request.selfie_image,
      'selfies',
      `selfie-${Date.now()}.jpg`
    );

    // Update document with selfie
    const { data, error } = await supabase
      .from("id_documents")
      .update({
        selfie_with_id_url: selfieUrl,
        status: 'pending',
      })
      .eq("id", request.document_id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    // Log attempt
    await logVerificationAttempt(
      user.id,
      sessionId,
      'selfie_capture',
      'success',
      { document_id: request.document_id }
    );

    return data;
  } catch (error: any) {
    await logVerificationAttempt(
      user.id,
      sessionId,
      'selfie_capture',
      'failure',
      { error: error.message }
    );
    throw error;
  }
}

export async function getUserIDDocuments(): Promise<IDDocument[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("id_documents")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateIDDocument(
  documentId: string,
  updates: Partial<IDDocument>
): Promise<IDDocument> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("id_documents")
    .update(updates)
    .eq("id", documentId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================
// FACE RECOGNITION
// ============================================

export async function enrollFaceRecognition(
  request: FaceRecognitionRequest
): Promise<FaceRecognition> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // Upload face image
    const faceImageUrl = await uploadImageToStorage(
      request.face_image,
      'face-recognition',
      `face-${Date.now()}.jpg`
    );

    // TODO: Process face image with ML model to extract biometric template
    // For now, we'll store the image URL
    const faceData = faceImageUrl; // In production, this would be encrypted biometric template

    // Check if face recognition already exists
    const { data: existing } = await supabase
      .from("face_recognition")
      .select("*")
      .eq("user_id", user.id)
      .single();

    let data: FaceRecognition;

    if (existing) {
      // Update existing
      const { data: updated, error } = await supabase
        .from("face_recognition")
        .update({
          face_data: faceData,
          status: 'active',
          confidence_score: 0.95, // Mock score
          enrolled_at: new Date().toISOString(),
          verification_session_id: request.session_id,
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      data = updated;
    } else {
      // Create new
      const { data: created, error } = await supabase
        .from("face_recognition")
        .insert({
          user_id: user.id,
          verification_session_id: request.session_id,
          face_data: faceData,
          status: 'active',
          confidence_score: 0.95, // Mock score
          enrolled_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      data = created;
    }

    // Update user's verification status
    await supabase
      .from("users")
      .update({
        face_recognition_enabled: true,
        verification_level: 'enhanced',
      })
      .eq("id", user.id);

    // Log attempt
    await logVerificationAttempt(
      user.id,
      request.session_id,
      'face_scan',
      'success',
      { confidence_score: 0.95 }
    );

    return data;
  } catch (error: any) {
    await logVerificationAttempt(
      user.id,
      request.session_id,
      'face_scan',
      'failure',
      { error: error.message }
    );
    throw error;
  }
}

export async function getUserFaceRecognition(): Promise<FaceRecognition | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("face_recognition")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function disableFaceRecognition(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from("face_recognition")
    .update({ status: 'disabled' })
    .eq("user_id", user.id);

  if (error) throw error;

  await supabase
    .from("users")
    .update({ face_recognition_enabled: false })
    .eq("id", user.id);
}

// ============================================
// VERIFICATION ATTEMPTS
// ============================================

export async function logVerificationAttempt(
  userId: string,
  sessionId: string | undefined,
  attemptType: VerificationAttemptType,
  status: 'success' | 'failure' | 'error',
  metadata: Record<string, any> = {}
): Promise<VerificationAttempt> {
  const { data, error } = await supabase
    .from("verification_attempts")
    .insert({
      user_id: userId,
      verification_session_id: sessionId,
      attempt_type: attemptType,
      status,
      error_code: metadata.error_code,
      error_message: metadata.error || metadata.error_message,
      metadata,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getVerificationAttempts(
  sessionId: string
): Promise<VerificationAttempt[]> {
  const { data, error } = await supabase
    .from("verification_attempts")
    .select("*")
    .eq("verification_session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// ============================================
// COMPLETE VERIFICATION FLOW
// ============================================

export async function startFullVerification(): Promise<VerificationSession> {
  return createVerificationSession('full');
}

export async function completeFullVerification(
  sessionId: string
): Promise<VerificationResult> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    // Check if all requirements are met
    const session = await getVerificationSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Get ID document
    const { data: documents } = await supabase
      .from("id_documents")
      .select("*")
      .eq("user_id", user.id)
      .eq("verification_session_id", sessionId);

    const hasIDDocument = documents && documents.length > 0;
    const hasSelfie = hasIDDocument && documents[0].selfie_with_id_url;

    // Get face recognition
    const faceRecognition = await getUserFaceRecognition();
    const hasFaceRecognition = faceRecognition?.status === 'active';

    if (!hasIDDocument || !hasSelfie || !hasFaceRecognition) {
      return {
        success: false,
        verification_level: 'basic',
        message: 'Verification incomplete',
        errors: [
          !hasIDDocument ? 'ID document required' : null,
          !hasSelfie ? 'Selfie with ID required' : null,
          !hasFaceRecognition ? 'Face recognition required' : null,
        ].filter(Boolean) as string[],
      };
    }

    // Update session
    await completeVerificationSession(sessionId);

    // Update user verification status
    await supabase
      .from("users")
      .update({
        id_verified: true,
        id_verified_at: new Date().toISOString(),
        verification_level: 'enhanced',
      })
      .eq("id", user.id);

    // Update document status
    if (documents && documents[0]) {
      await updateIDDocument(documents[0].id, {
        status: 'verified',
        verified_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      verification_level: 'enhanced',
      message: 'Verification completed successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      verification_level: 'none',
      message: 'Verification failed',
      errors: [error.message],
    };
  }
}

export async function getUserVerificationStatus(): Promise<{
  id_verified: boolean;
  face_recognition_enabled: boolean;
  verification_level: string;
}> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("users")
    .select("id_verified, face_recognition_enabled, verification_level")
    .eq("id", user.id)
    .single();

  if (error) throw error;
  
  return {
    id_verified: data.id_verified || false,
    face_recognition_enabled: data.face_recognition_enabled || false,
    verification_level: data.verification_level || 'none',
  };
}

