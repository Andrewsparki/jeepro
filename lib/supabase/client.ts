import { createBrowserClient } from '@supabase/ssr'

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

const serverCookies = new Map<string, string>();

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  // If we're on the server / non-browser runtime, provide in-memory cookie storage
  if (typeof window === 'undefined') {
    return createBrowserClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return Array.from(serverCookies.entries()).map(([name, value]) => ({ name, value }));
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => serverCookies.set(name, value));
          },
        },
      }
    );
  }

  // If on the client, use a singleton to prevent memory leaks and connection issues
  if (!clientInstance) {
    clientInstance = createBrowserClient(url, key);
  }
  
  return clientInstance;
}
