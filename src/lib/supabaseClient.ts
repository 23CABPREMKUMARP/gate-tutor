import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'public-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)
