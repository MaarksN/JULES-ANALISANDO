type Session = { user: { id: string; email?: string } } | null;

type AuthChangeCallback = (_event: string, session: Session) => void;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SESSION_KEY = 'supabase_mock_session';

const listeners = new Set<AuthChangeCallback>();

const getStoredSession = (): Session => {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
};

const setStoredSession = (session: Session) => {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
  listeners.forEach((cb) => cb('SESSION', session));
};

const request = async (path: string, init?: RequestInit) => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return { data: null, error: { message: 'Supabase não configurado' } };
  const res = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) return { data: null, error: { message: await res.text() } };
  return { data: await res.json(), error: null };
};

export const supabase = {
  auth: {
    async getSession() {
      return { data: { session: getStoredSession() } };
    },
    onAuthStateChange(callback: AuthChangeCallback) {
      listeners.add(callback);
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    },
    async signInWithOtp({ email }: { email: string }) {
      if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        await request('/auth/v1/otp', { method: 'POST', body: JSON.stringify({ email, create_user: true }) });
      }
      setStoredSession({ user: { id: crypto.randomUUID(), email } });
      return { error: null };
    },
  },
  from(table: string) {
    return {
      select() {
        return {
          async order() {
            return request(`/rest/v1/${table}?select=*`);
          },
        };
      },
      async upsert(payload: any) {
        const body = Array.isArray(payload) ? payload : [payload];
        return request(`/rest/v1/${table}`, {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates' },
          body: JSON.stringify(body),
        });
      },
    };
  },
};
