// Verification Types for TAALMEET

export type VerificationSessionType = 'id_card' | 'face_recognition' | 'full';
export type VerificationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'expired';
export type DocumentType = 'passport' | 'drivers_license' | 'national_id' | 'residence_permit';
export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired';
export type FaceRecognitionStatus = 'pending' | 'active' | 'failed' | 'disabled';
export type VerificationAttemptType = 'id_upload' | 'selfie_capture' | 'face_scan' | 'document_verification';
export type VerificationLevel = 'none' | 'basic' | 'standard' | 'enhanced';

export interface VerificationSession {
  id: string;
  user_id: string;
  session_type: VerificationSessionType;
  status: VerificationStatus;
  provider?: string;
  provider_session_id?: string;
  started_at: string;
  completed_at?: string;
  expires_at: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface IDDocument {
  id: string;
  user_id: string;
  verification_session_id?: string;
  document_type: DocumentType;
  document_number?: string;
  country_code: string;
  front_image_url?: string;
  back_image_url?: string;
  selfie_with_id_url?: string;
  status: DocumentStatus;
  verified_at?: string;
  expires_at?: string;
  rejection_reason?: string;
  extracted_data: {
    name?: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    religion?: string;
    marital_status?: string;
    nationality?: string;
    issue_date?: string;
    expiry_date?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface FaceRecognition {
  id: string;
  user_id: string;
  verification_session_id?: string;
  face_data?: string;
  status: FaceRecognitionStatus;
  confidence_score?: number;
  enrolled_at?: string;
  last_verified_at?: string;
  verification_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface VerificationAttempt {
  id: string;
  user_id: string;
  verification_session_id?: string;
  attempt_type: VerificationAttemptType;
  status: 'success' | 'failure' | 'error';
  error_code?: string;
  error_message?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface VerificationProgress {
  step: 'id_card' | 'selfie' | 'face_recognition' | 'complete';
  percentage: number;
  message: string;
}

export interface UploadIDCardRequest {
  document_type: DocumentType;
  country_code: string;
  front_image: string; // base64 or file URI
  back_image?: string;
}

export interface UploadSelfieRequest {
  document_id: string;
  selfie_image: string; // base64 or file URI
}

export interface FaceRecognitionRequest {
  face_image: string; // base64 or file URI
  session_id: string;
}

export interface VerificationResult {
  success: boolean;
  verification_level: VerificationLevel;
  message: string;
  errors?: string[];
}

