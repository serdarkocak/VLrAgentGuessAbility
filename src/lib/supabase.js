import { createClient } from '@supabase/supabase-js';
import { getSupabaseCredentials, isValidSupabaseConfig } from './supabaseConfig.js';

const { url, key } = getSupabaseCredentials();

export const isSupabaseConfigured = isValidSupabaseConfig(url, key);

export const supabase = isSupabaseConfigured ? createClient(url, key) : null;
