const BASE_URL = "http://localhost:4000";
// const BASE_URL = "https://actbackend-23f7fc138015.herokuapp.com"

export async function apiPost(path, body, token) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.error || `API virhe (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export async function apiDelete(path, token) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `API error ${res.status}`);
    return data;
  }
  
  export async function apiGet(path, token) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `API error ${res.status}`);
    return data;
  }

  // ---- Tenants link APIs ----
export const linkActCustomer = (tenantId, actCustomerId, token) =>
    apiPost(`/api/tenants/${tenantId}/link-act-customer`, { actCustomerId }, token);
  
  export const linkActCreds = (tenantId, username, password, token) =>
    apiPost(`/api/tenants/${tenantId}/link-act365-credentials`, { username, password }, token);
  
  export const unlinkActCreds = (tenantId, token) =>
    apiDelete(`/api/tenants/${tenantId}/link-act365-credentials`, token);
  
  export const pingTenant = (tenantId, token) =>
    apiGet(`/api/tenants/${tenantId}/ping`, token);

  export const linkActAll = (tenantId, { actCustomerId, username, password }, token) =>
    apiPost(`/api/tenants/${tenantId}/link-act`, { actCustomerId, username, password }, token);

  export const createCardholder = (tenantId, payload, token) =>
    apiPost(`/api/tenants/${tenantId}/act/cardholders`, payload, token);

  export const listSites = (tenantId, token) =>
    apiGet(`/api/tenants/${tenantId}/act/sites`, token);

 export const listCardholderGroups = (tenantId, siteId, token) => 
    apiGet(`/api/tenants/${tenantId}/act/cardholder-groups?siteid=${encodeURIComponent(siteId)}`, token);

 export const listDoors = (tenantId, siteId, token) => 
    apiGet(`/api/tenants/${tenantId}/act/doors?siteid=${encodeURIComponent(siteId)}`, token)

 export const createBooking = (tenantId, payload, token) =>
    apiPost(`/api/tenants/${tenantId}/bookings`, payload, token);

 // Luo kalenteri (admin)
export const createCalendar = (tenantId, payload, token) =>
  apiPost(`/api/tenants/${tenantId}/calendars`, payload, token);

// Listaa kalenterit (admin)
export const listCalendars = (tenantId, token) =>
  apiGet(`/api/tenants/${tenantId}/calendars`, token);

// Julkinen: hae kalenteri slugilla
export const getPublicCalendar = (slug) =>
  apiGet(`/api/calendar/${encodeURIComponent(slug)}`);

// Julkinen: tee varaus slugilla
export const publicBook = (slug, payload) =>
  apiPost(`/api/calendar/${encodeURIComponent(slug)}/book`, payload);

export const listDoorGroups = (tenantId, siteId, token) =>
  apiGet(`/api/tenants/${tenantId}/act/door-groups?siteid=${encodeURIComponent(siteId)}`, token);