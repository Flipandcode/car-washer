"use client";

import { createBrowserClient } from "@supabase/ssr";

// No generated `Database` generic is used here. The app casts query results to
// the hand-written interfaces in src/lib/types.ts instead. If you want full
// end-to-end type safety on `.from()` calls, run:
//   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
// and pass that type as the generic to both clients.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
