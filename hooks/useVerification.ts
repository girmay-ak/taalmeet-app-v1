// Verification Hooks for TAALMEET
// React Query hooks for ID verification and face recognition

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as VerificationService from "@/services/verificationService";
import type {
  VerificationSession,
  IDDocument,
  FaceRecognition,
  UploadIDCardRequest,
  UploadSelfieRequest,
  FaceRecognitionRequest,
  VerificationSessionType,
} from "@/types/verification";

// ============================================
// QUERY KEYS
// ============================================

export const verificationKeys = {
  all: ['verification'] as const,
  sessions: () => [...verificationKeys.all, 'sessions'] as const,
  session: (id: string) => [...verificationKeys.sessions(), id] as const,
  documents: () => [...verificationKeys.all, 'documents'] as const,
  document: (id: string) => [...verificationKeys.documents(), id] as const,
  faceRecognition: () => [...verificationKeys.all, 'face-recognition'] as const,
  status: () => [...verificationKeys.all, 'status'] as const,
  attempts: (sessionId: string) => [...verificationKeys.all, 'attempts', sessionId] as const,
};

// ============================================
// VERIFICATION SESSIONS
// ============================================

export function useVerificationSessions() {
  return useQuery({
    queryKey: verificationKeys.sessions(),
    queryFn: () => VerificationService.getUserVerificationSessions(),
  });
}

export function useVerificationSession(sessionId: string) {
  return useQuery({
    queryKey: verificationKeys.session(sessionId),
    queryFn: () => VerificationService.getVerificationSession(sessionId),
    enabled: !!sessionId,
  });
}

export function useCreateVerificationSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionType: VerificationSessionType) =>
      VerificationService.createVerificationSession(sessionType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.sessions() });
    },
  });
}

export function useCompleteVerificationSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      VerificationService.completeVerificationSession(sessionId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: verificationKeys.session(data.id) });
      queryClient.invalidateQueries({ queryKey: verificationKeys.status() });
    },
  });
}

// ============================================
// ID DOCUMENTS
// ============================================

export function useIDDocuments() {
  return useQuery({
    queryKey: verificationKeys.documents(),
    queryFn: () => VerificationService.getUserIDDocuments(),
  });
}

export function useUploadIDCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ request, sessionId }: { request: UploadIDCardRequest; sessionId?: string }) =>
      VerificationService.uploadIDCard(request, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.documents() });
    },
  });
}

export function useUploadSelfieWithID() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ request, sessionId }: { request: UploadSelfieRequest; sessionId?: string }) =>
      VerificationService.uploadSelfieWithID(request, sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.documents() });
    },
  });
}

export function useUpdateIDDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId, updates }: { documentId: string; updates: Partial<IDDocument> }) =>
      VerificationService.updateIDDocument(documentId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.documents() });
    },
  });
}

// ============================================
// FACE RECOGNITION
// ============================================

export function useFaceRecognition() {
  return useQuery({
    queryKey: verificationKeys.faceRecognition(),
    queryFn: () => VerificationService.getUserFaceRecognition(),
  });
}

export function useEnrollFaceRecognition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: FaceRecognitionRequest) =>
      VerificationService.enrollFaceRecognition(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.faceRecognition() });
      queryClient.invalidateQueries({ queryKey: verificationKeys.status() });
    },
  });
}

export function useDisableFaceRecognition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => VerificationService.disableFaceRecognition(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.faceRecognition() });
      queryClient.invalidateQueries({ queryKey: verificationKeys.status() });
    },
  });
}

// ============================================
// VERIFICATION STATUS
// ============================================

export function useVerificationStatus() {
  return useQuery({
    queryKey: verificationKeys.status(),
    queryFn: () => VerificationService.getUserVerificationStatus(),
  });
}

// ============================================
// FULL VERIFICATION FLOW
// ============================================

export function useStartFullVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => VerificationService.startFullVerification(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.sessions() });
    },
  });
}

export function useCompleteFullVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      VerificationService.completeFullVerification(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: verificationKeys.status() });
      queryClient.invalidateQueries({ queryKey: verificationKeys.documents() });
      queryClient.invalidateQueries({ queryKey: verificationKeys.faceRecognition() });
    },
  });
}

// ============================================
// VERIFICATION ATTEMPTS
// ============================================

export function useVerificationAttempts(sessionId: string) {
  return useQuery({
    queryKey: verificationKeys.attempts(sessionId),
    queryFn: () => VerificationService.getVerificationAttempts(sessionId),
    enabled: !!sessionId,
  });
}

