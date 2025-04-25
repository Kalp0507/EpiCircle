
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://twouhmjqotgpmiyxlbuc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3b3VobWpxb3RncG1peXhsYnVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzOTc3NjcsImV4cCI6MjA2MDk3Mzc2N30.uowrsHtMmGd_JfuiHDshekXtE4qJa1UNwrZn__m7cXk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
