// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rhgpijtagirvxekhaznq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoZ3BpanRhZ2lydnhla2hhem5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MDMzMDcsImV4cCI6MjA2MjA3OTMwN30.88hjygeu454nCtgL1m4lIfg1N4EhotntcQ9w7X-G9Cg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);