/**
 * Supabase Wrapper for Web
 * This file makes the web supabase client available to shared services
 * by exporting it with the same path structure they expect
 */

export { supabase } from './supabase';
export { getCurrentUser, getCurrentSession } from './supabase';

