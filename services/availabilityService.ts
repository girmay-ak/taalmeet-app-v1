/**
 * Availability Service
 * Backend service for managing user availability and schedules
 */

import { supabase } from '@/lib/supabase';
import {
  DatabaseError,
  RecordNotFoundError,
  ValidationError,
  parseSupabaseError,
} from '@/utils/errors';
import type {
  AvailabilityStatus,
  AvailabilityStatusInsert,
  AvailabilityStatusUpdate,
  WeeklySchedule,
  WeeklyScheduleInsert,
} from '@/types/database';

// ============================================================================
// TYPES
// ============================================================================

export interface AvailabilityData {
  status: string;
  until: string | null;
  preferences: {
    inPerson: boolean;
    voice: boolean;
    video: boolean;
    chat: boolean;
  };
  weeklySchedule: WeeklySchedule[];
}

export interface UpdateAvailabilityStatusInput {
  status: 'available' | 'soon' | 'busy' | 'offline';
  until: string | null;
}

export interface UpdatePreferencesInput {
  meetingTypes: {
    inPerson?: boolean;
    voice?: boolean;
    video?: boolean;
    chat?: boolean;
  };
}

export interface AddScheduleSlotInput {
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // Format: "HH:MM" or "HH:MM:SS"
  end_time: string; // Format: "HH:MM" or "HH:MM:SS"
  repeat: boolean;
}

// ============================================================================
// GET AVAILABILITY
// ============================================================================

/**
 * Get complete availability data for a user
 * Returns status, until, preferences, and weekly schedule
 */
export async function getAvailability(userId: string): Promise<AvailabilityData> {
  // Fetch status and schedule in parallel
  const [statusResult, scheduleResult] = await Promise.all([
    supabase
      .from('availability_status')
      .select('*')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('weekly_schedule')
      .select('*')
      .eq('user_id', userId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true }),
  ]);

  // Handle status
  if (statusResult.error && statusResult.error.code !== 'PGRST116') {
    throw parseSupabaseError(statusResult.error);
  }

  const status = statusResult.data || null;
  const preferencesArray = Array.isArray(status?.preferences) ? status.preferences : [];

  // Convert preferences array to object
  const preferences = {
    inPerson: preferencesArray.includes('in-person') || preferencesArray.includes('inPerson'),
    voice: preferencesArray.includes('voice') || preferencesArray.includes('call'),
    video: preferencesArray.includes('video'),
    chat: preferencesArray.includes('chat'),
  };

  // Handle schedule
  if (scheduleResult.error) {
    throw parseSupabaseError(scheduleResult.error);
  }

  return {
    status: status?.status || 'offline',
    until: status?.until || null,
    preferences,
    weeklySchedule: scheduleResult.data || [],
  };
}

// ============================================================================
// UPDATE AVAILABILITY STATUS
// ============================================================================

/**
 * Update availability status and until timestamp
 */
export async function updateAvailabilityStatus(
  userId: string,
  input: UpdateAvailabilityStatusInput
): Promise<AvailabilityData> {
  // Calculate duration_minutes from until if provided
  let durationMinutes: number | null = null;
  if (input.until) {
    const untilDate = new Date(input.until);
    const now = new Date();
    const diffMs = untilDate.getTime() - now.getTime();
    durationMinutes = Math.max(0, Math.floor(diffMs / 60000));
  }

  const updateData: AvailabilityStatusUpdate = {
    status: input.status,
    until: input.until,
    duration_minutes: durationMinutes,
  };

  // Determine is_online based on status
  const isOnline = input.status === 'available' || input.status === 'soon';

  // Update both availability_status and profiles.is_online in parallel
  const [existingResult] = await Promise.all([
    supabase
      .from('availability_status')
      .select('*')
      .eq('user_id', userId)
      .single(),
    // Update profile's is_online field
    supabase
      .from('profiles')
      .update({ is_online: isOnline })
      .eq('id', userId),
  ]);

  let result;
  if (existingResult.error && existingResult.error.code === 'PGRST116') {
    // Create new
    const insertData: AvailabilityStatusInsert = {
      user_id: userId,
      ...updateData,
      preferences: [],
    };

    const { data, error } = await supabase
      .from('availability_status')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }
    result = data;
  } else {
    if (existingResult.error) {
      throw parseSupabaseError(existingResult.error);
    }

    // Update existing
    const { data, error } = await supabase
      .from('availability_status')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }
    result = data;
  }

  // Return full availability data
  return getAvailability(userId);
}

// ============================================================================
// UPDATE PREFERENCES
// ============================================================================

/**
 * Update meeting type preferences
 */
export async function updatePreferences(
  userId: string,
  input: UpdatePreferencesInput
): Promise<AvailabilityData> {
  // Convert preferences object to array
  const preferencesArray: string[] = [];
  if (input.meetingTypes.inPerson) {
    preferencesArray.push('in-person');
  }
  if (input.meetingTypes.voice) {
    preferencesArray.push('voice');
  }
  if (input.meetingTypes.video) {
    preferencesArray.push('video');
  }
  if (input.meetingTypes.chat) {
    preferencesArray.push('chat');
  }

  const updateData: AvailabilityStatusUpdate = {
    preferences: preferencesArray,
  };

  // Check if status exists
  const existingResult = await supabase
    .from('availability_status')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existingResult.error && existingResult.error.code === 'PGRST116') {
    // Create new with default status
    const insertData: AvailabilityStatusInsert = {
      user_id: userId,
      status: 'offline',
      preferences: preferencesArray,
      duration_minutes: null,
      until: null,
    };

    const { error } = await supabase
      .from('availability_status')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw parseSupabaseError(error);
    }
  } else {
    if (existingResult.error) {
      throw parseSupabaseError(existingResult.error);
    }

    // Update existing
    const { error } = await supabase
      .from('availability_status')
      .update(updateData)
      .eq('user_id', userId);

    if (error) {
      throw parseSupabaseError(error);
    }
  }

  // Return full availability data
  return getAvailability(userId);
}

// ============================================================================
// WEEKLY SCHEDULE
// ============================================================================

/**
 * Get weekly schedule for a user
 */
export async function getWeeklySchedule(userId: string): Promise<WeeklySchedule[]> {
  const { data, error } = await supabase
    .from('weekly_schedule')
    .select('*')
    .eq('user_id', userId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) {
    throw parseSupabaseError(error);
  }

  return data || [];
}

/**
 * Add a schedule slot
 */
export async function addScheduleSlot(
  userId: string,
  input: AddScheduleSlotInput
): Promise<WeeklySchedule> {
  // Normalize time format
  const startTime = normalizeTime(input.start_time);
  const endTime = normalizeTime(input.end_time);

  // Validate end time is after start time
  if (endTime <= startTime) {
    throw new ValidationError('End time must be after start time');
  }

  // Validate day_of_week
  if (input.day_of_week < 0 || input.day_of_week > 6) {
    throw new ValidationError('day_of_week must be between 0 (Sunday) and 6 (Saturday)');
  }

  const insertData: WeeklyScheduleInsert = {
    user_id: userId,
    day_of_week: input.day_of_week,
    start_time: startTime,
    end_time: endTime,
    repeat_weekly: input.repeat,
  };

  const { data, error } = await supabase
    .from('weekly_schedule')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    throw parseSupabaseError(error);
  }

  return data;
}

/**
 * Remove a schedule slot
 */
export async function removeScheduleSlot(slotId: string): Promise<void> {
  const { error } = await supabase
    .from('weekly_schedule')
    .delete()
    .eq('id', slotId);

  if (error) {
    throw parseSupabaseError(error);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize time string to HH:MM:SS format
 */
function normalizeTime(time: string): string {
  // If already in HH:MM:SS format, return as is
  if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
    return time;
  }

  // If in HH:MM format, add :00 seconds
  if (time.match(/^\d{2}:\d{2}$/)) {
    return `${time}:00`;
  }

  throw new ValidationError(`Invalid time format: ${time}. Use HH:MM or HH:MM:SS`);
}
