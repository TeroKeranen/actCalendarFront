import { apiPost } from "./api";

const KEY = "user";

export function getUser() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}
export function setUser(user) {
  localStorage.setItem(KEY, JSON.stringify(user));
}
export function clearUser() {
  localStorage.removeItem(KEY);
}

export async function signUp({ email, password, role, tenantName, tenantSlug }) {
    const data = await apiPost("/api/auth/signup", { email, password, role, tenantName, tenantSlug });
    if (!data?.ok) throw new Error(data?.error || "Signup failed");
    const user = { token: data.token, role: data.role, email: data.email, tenantId: data.tenantId || null };
    setUser(user);
    return user;
  }
// Yritä lukea tenantId/role/email JWT:stä varalta
function parseJwtClaims(token) {
  try {
    const [, payload] = token.split(".");
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const data = JSON.parse(json);
    return {
      tenantId: data.tenantId ?? data.tenantID ?? data.tid ?? null,
      role: data.role,
      email: data.email,
    };
  } catch {
    return {};
  }
}

export async function signIn({ email, password }) {
  const data = await apiPost("/api/auth/signin", { email, password });
  console.log("APIPOST DATA", data);
  if (!data?.ok) throw new Error(data?.error || "Signin failed");

  // ensisijaisesti backendin kenttä
  let tenantId = data.tenantId ?? null;
  let role = data.role;
  let emailResp = data.email;

  // fallback: poimi JWT:stä
  if (!tenantId || !role || !emailResp) {
    const claims = parseJwtClaims(data.token);
    tenantId = tenantId ?? claims.tenantId ?? null;
    role = role ?? claims.role;
    emailResp = emailResp ?? claims.email;
  }

  const user = { token: data.token, role, email: emailResp, tenantId };
  // setUser(user);
  return user;
}

// Hakee /me ja päivittää localStoragen (fallback, jos tenantId puuttuu)
export async function hydrateFromMe() {
  const auth = getUser();
  if (!auth?.token) return null;
  try {
    const me = await apiGet("/api/auth/me", auth.token);
    if (me?.ok) {
      const merged = {
        ...auth,
        role: me.role ?? auth.role,
        email: me.email ?? auth.email,
        tenantId: me.tenantId ?? auth.tenantId ?? null,
      };
      setUser(merged);
      return merged;
    }
  } catch {
    // ignore
  }
  return auth;
}

// Varmistaa että authissa on tenantId (JWT -> /me)
export async function ensureTenantInAuth() {
  let auth = getUser();
  if (!auth?.token) return null;

  if (!auth.tenantId) {
    const claims = parseJwtClaims(auth.token);
    if (claims.tenantId) {
      auth = { ...auth, tenantId: claims.tenantId, role: auth.role ?? claims.role, email: auth.email ?? claims.email };
      setUser(auth);
      return auth;
    }
    // vieläkin puuttuu → kysy palvelimelta
    auth = await hydrateFromMe();
  }
  return auth;
}
