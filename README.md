# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



// import React, { useEffect, useMemo, useState } from "react";

// // Yksinkertainen admin-UI backendin testaamiseen ilman Postmania (Vite + React JS).
// // Oletus-API: http://localhost:4000
// // Käyttää seuraavia reittejä:
// //  - GET    /health
// //  - GET    /api/tenants
// //  - POST   /api/tenants { name, slug? }
// //  - POST   /api/tenants/:tenantId/link-act-customer { actCustomerId }
// //  - POST   /api/tenants/:tenantId/link-act365-credentials { username, password } (valinn.)
// //  - DELETE /api/tenants/:tenantId/link-act365-credentials (valinn.)
// //  - GET    /api/tenants/:tenantId/ping
// //  - GET    /api/doors?tenantId=...
// //  - POST   /api/doors { tenantId, name, actDoorId }
// //  - GET    /api/bookings?tenantId=... (valinn.)
// //  - POST   /api/bookings { tenantId, doorId, startsAt, endsAt, createdBy? }

// export default function App() {
//   const [baseUrl, setBaseUrl] = useState("http://localhost:4000");
//   const [health, setHealth] = useState("");

//   // Tenants
//   const [tenants, setTenants] = useState([]);
//   const [name, setName] = useState("");
//   const [slug, setSlug] = useState("");
//   const [selectedTenantId, setSelectedTenantId] = useState("");
//   const selectedTenant = useMemo(() => tenants.find((t) => t._id === selectedTenantId), [tenants, selectedTenantId]);

//   // Linkitys ACT-asiakkaaseen
//   const [actCustomerId, setActCustomerId] = useState("");

//   // BYO credsit (valinnainen)
//   const [byoUser, setByoUser] = useState("");
//   const [byoPass, setByoPass] = useState("");

//   // Doors
//   const [doors, setDoors] = useState([]);
//   const [doorName, setDoorName] = useState("");
//   const [actDoorId, setActDoorId] = useState("");

//   // Bookings
//   const [startsAt, setStartsAt] = useState(""); // HTML datetime-local
//   const [endsAt, setEndsAt] = useState("");
//   const [createdBy, setCreatedBy] = useState("");
//   const [bookings, setBookings] = useState([]);

//   // tilat
//   const [siteIdCH, setSiteIdCH] = useState("");
//   const [forename, setForename] = useState("");
//   const [surname, setSurname] = useState("");
//   const [pinCH, setPinCH] = useState("");
//   const [startvalid, setStartvalid] = useState("");
//   const [endvalid, setEndvalid] = useState("");

//   // kutsu
//   async function createCardholder() {
//     if (!selectedTenantId || !siteIdCH || !forename || !surname) return;
//     const r = await fetch(`${baseUrl}/api/tenants/${selectedTenantId}/act/cardholders`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         siteId: siteIdCH,
//         forename,
//         surname,
//         pin: pinCH || undefined,
//         startvalid: startvalid || undefined, // muoto "dd/MM/yyyy HH:mm"
//         endvalid: endvalid || undefined,
//       }),
//     });
//     const data = await r.json();
//     logLine(`Create cardholder: ${r.ok ? JSON.stringify(data) : r.status}`);
//   }

//   const [log, setLog] = useState("");
//   function logLine(msg) {
//     setLog(
//       (prev) =>
//         `[${new Date().toLocaleTimeString()}] ${msg}
// ` + prev
//     );
//   }

//   async function fetchJson(path, init) {
//     const res = await fetch(`${baseUrl}${path}`, init);
//     const text = await res.text();
//     try {
//       return { ok: res.ok, status: res.status, data: JSON.parse(text) };
//     } catch {
//       return { ok: res.ok, status: res.status, data: text };
//     }
//   }

//   async function checkHealth() {
//     const r = await fetchJson("/health");
//     setHealth(r.ok ? "OK" : `ERR ${r.status}`);
//     logLine(`Health: ${r.ok ? "OK" : r.status}`);
//   }

//   async function loadTenants() {
//     const r = await fetchJson("/api/tenants");
//     if (r.ok) setTenants(r.data);
//     logLine(`Tenants loaded (${r.ok ? r.data.length : r.status})`);
//   }

//   async function createTenant() {
//     if (!name.trim()) return;
//     const r = await fetchJson("/api/tenants", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ name, slug: slug || undefined }),
//     });
//     if (r.ok) {
//       logLine(`Tenant created: ${r.data._id}`);
//       setName("");
//       setSlug("");
//       await loadTenants();
//       setSelectedTenantId(r.data._id);
//     } else {
//       logLine(`Create tenant failed: ${r.status} -> ${JSON.stringify(r.data)}`);
//     }
//   }

//   async function linkActCustomer() {
//     if (!selectedTenantId || !actCustomerId.trim()) return;
//     const r = await fetchJson(`/api/tenants/${selectedTenantId}/link-act-customer`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ actCustomerId }),
//     });
//     logLine(`Link ACT customer: ${r.ok ? "OK" : r.status}`);
//     await loadTenants();
//   }

//   async function saveByoCreds() {
//     if (!selectedTenantId) return;
//     const r = await fetchJson(`/api/tenants/${selectedTenantId}/link-act365-credentials`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username: byoUser, password: byoPass }),
//     });
//     logLine(`Save BYO creds: ${r.ok ? "OK" : r.status}`);
//   }

//   async function deleteByoCreds() {
//     if (!selectedTenantId) return;
//     const r = await fetchJson(`/api/tenants/${selectedTenantId}/link-act365-credentials`, { method: "DELETE" });
//     logLine(`Delete BYO creds: ${r.ok ? "OK" : r.status}`);
//   }

//   async function pingTenant() {
//     if (!selectedTenantId) return;
//     const r = await fetchJson(`/api/tenants/${selectedTenantId}/ping`);
//     logLine(`Ping: ${r.ok ? JSON.stringify(r.data) : r.status}`);
//   }

//   async function loadDoors() {
//     if (!selectedTenantId) return;
//     const r = await fetchJson(`/api/doors?tenantId=${encodeURIComponent(selectedTenantId)}`);
//     if (r.ok) setDoors(r.data);
//     logLine(`Doors loaded (${r.ok ? r.data.length : r.status})`);
//   }

//   async function createDoor() {
//     if (!selectedTenantId || !doorName.trim() || !actDoorId.trim()) return;
//     const r = await fetchJson(`/api/doors`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ tenantId: selectedTenantId, name: doorName, actDoorId }),
//     });
//     logLine(`Create door: ${r.ok ? "OK" : r.status}`);
//     if (r.ok) {
//       setDoorName("");
//       setActDoorId("");
//       await loadDoors();
//     }
//   }

//   async function loadBookings() {
//     if (!selectedTenantId) return;
//     const r = await fetchJson(`/api/bookings?tenantId=${encodeURIComponent(selectedTenantId)}`);
//     if (r.ok) setBookings(r.data);
//     logLine(`Bookings loaded (${r.ok ? r.data.length : r.status})`);
//   }

//   async function createBooking() {
//     if (!selectedTenantId || doors.length === 0 || !startsAt || !endsAt) return;
//     const doorId = doors[0]._id; // demossa käytetään ekaa ovea
//     const r = await fetchJson(`/api/bookings`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         tenantId: selectedTenantId,
//         doorId,
//         startsAt,
//         endsAt,
//         createdBy: createdBy || undefined,
//       }),
//     });
//     logLine(`Create booking: ${r.ok ? JSON.stringify(r.data) : r.status}`);
//     if (r.ok) {
//       setStartsAt("");
//       setEndsAt("");
//       await loadBookings();
//     }
//   }

//   useEffect(() => {
//     checkHealth();
//     loadTenants();
//   }, [baseUrl]);
//   useEffect(() => {
//     if (selectedTenantId) {
//       loadDoors();
//       loadBookings();
//     }
//   }, [selectedTenantId]);

//   const cardStyle = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 };
//   const row = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" };
//   const input = { padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", minWidth: 220 };
//   const btn = { padding: "8px 12px", borderRadius: 8, border: "1px solid #111827", background: "#111827", color: "white", cursor: "pointer" };
//   const pill = (active) => ({ padding: "6px 10px", borderRadius: 999, border: "1px solid #d1d5db", background: active ? "#111827" : "#fff", color: active ? "#fff" : "#111827", cursor: "pointer" });

//   return (
//     <div style={{ fontFamily: "Inter, system-ui, Arial", padding: 24, display: "grid", gap: 16 }}>
//       <h1>ACT365 Admin – Mini UI (Vite + React JS)</h1>

//       <section style={cardStyle}>
//         <h2>Yhteys</h2>
//         <div style={row}>
//           <input style={{ ...input, minWidth: 320 }} value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
//           <button style={btn} onClick={checkHealth}>
//             Testaa /health
//           </button>
//           <span>{health}</span>
//         </div>
//       </section>

//       <section style={cardStyle}>
//         <h2>Tenantit</h2>
//         <div style={row}>
//           <input style={input} placeholder="Nimi (esim. Konehuolto Oy)" value={name} onChange={(e) => setName(e.target.value)} />
//           <input style={input} placeholder="Slug (valinn.) esim. konehuolto" value={slug} onChange={(e) => setSlug(e.target.value)} />
//           <button style={btn} onClick={createTenant}>
//             Luo tenant
//           </button>
//           <button style={btn} onClick={loadTenants}>
//             Päivitä lista
//           </button>
//         </div>
//         <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
//           {tenants.map((t) => (
//             <button key={t._id} style={pill(selectedTenantId === t._id)} onClick={() => setSelectedTenantId(t._id)}>
//               {t.name} ({t._id.slice(-6)}) {t.actCustomerId ? `· ${t.actCustomerId}` : ""}
//             </button>
//           ))}
//         </div>
//       </section>

//       <section style={cardStyle}>
//         <h2>Linkitä ACT-asiakkaaseen</h2>
//         <div style={row}>
//           <input style={input} placeholder="actCustomerId" value={actCustomerId} onChange={(e) => setActCustomerId(e.target.value)} />
//           <button style={btn} disabled={!selectedTenantId} onClick={linkActCustomer}>
//             Linkitä
//           </button>
//           <button style={btn} disabled={!selectedTenantId} onClick={pingTenant}>
//             Ping (login-testi)
//           </button>
//         </div>
//         {selectedTenant && (
//           <p style={{ opacity: 0.8 }}>
//             Valittu tenant: <b>{selectedTenant.name}</b> {selectedTenant.actCustomerId ? `→ ${selectedTenant.actCustomerId}` : "(ei linkitetty)"}
//           </p>
//         )}
//       </section>

//       <section style={cardStyle}>
//         <h2>BYO ACT365 -tunnukset (valinn.)</h2>
//         <div style={row}>
//           <input style={input} placeholder="username" value={byoUser} onChange={(e) => setByoUser(e.target.value)} />
//           <input style={input} placeholder="password" type="password" value={byoPass} onChange={(e) => setByoPass(e.target.value)} />
//           <button style={btn} disabled={!selectedTenantId} onClick={saveByoCreds}>
//             Tallenna
//           </button>
//           <button style={btn} disabled={!selectedTenantId} onClick={deleteByoCreds}>
//             Poista credsit
//           </button>
//         </div>
//       </section>

//       <section style={cardStyle}>
//         <h2>Ovet</h2>
//         <div style={row}>
//           <input style={input} placeholder="Oven nimi" value={doorName} onChange={(e) => setDoorName(e.target.value)} />
//           <input style={input} placeholder="actDoorId" value={actDoorId} onChange={(e) => setActDoorId(e.target.value)} />
//           <button style={btn} disabled={!selectedTenantId} onClick={createDoor}>
//             Lisää ovi
//           </button>
//           <button style={btn} disabled={!selectedTenantId} onClick={loadDoors}>
//             Päivitä ovet
//           </button>
//         </div>
//         <ul>
//           {doors.map((d) => (
//             <li key={d._id}>
//               {d.name} – <code>{d.actDoorId}</code> (id {d._id.slice(-6)})
//             </li>
//           ))}
//         </ul>
//       </section>

//       <section style={cardStyle}>
//         <h2>Varaus (demo, ilman ACT365-kutsuja vielä)</h2>
//         <div style={row}>
//           <input style={input} type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
//           <input style={input} type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
//           <input style={input} placeholder="createdBy (email, valinn.)" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} />
//           <button style={btn} disabled={!selectedTenantId || doors.length === 0 || !startsAt || !endsAt} onClick={createBooking}>
//             Luo varaus
//           </button>
//           <button style={btn} disabled={!selectedTenantId} onClick={loadBookings}>
//             Päivitä varaukset
//           </button>
//         </div>
//         <ul>
//           {bookings.map((b) => (
//             <li key={b._id}>
//               {new Date(b.startsAt).toLocaleString()} – {new Date(b.endsAt).toLocaleString()} · door {String(b.doorId).slice(-6)} · {b.status}
//             </li>
//           ))}
//         </ul>
//       </section>

//       <section style={cardStyle}>
//         <h2>Luo cardholder (Jacquet)</h2>
//         <div style={row}>
//           <input style={input} placeholder="siteId (esim. 10169)" value={siteIdCH} onChange={e=>setSiteIdCH(e.target.value)} />
//           <input style={input} placeholder="Etunimi" value={forename} onChange={e=>setForename(e.target.value)} />
//           <input style={input} placeholder="Sukunimi" value={surname} onChange={e=>setSurname(e.target.value)} />
//           <input style={input} placeholder="PIN (valinn.)" value={pinCH} onChange={e=>setPinCH(e.target.value)} />
//           <input style={input} placeholder='startvalid dd/MM/yyyy HH:mm' value={startvalid} onChange={e=>setStartvalid(e.target.value)} />
//           <input style={input} placeholder='endvalid dd/MM/yyyy HH:mm' value={endvalid} onChange={e=>setEndvalid(e.target.value)} />
//           <button style={btn} disabled={!selectedTenantId} onClick={createCardholder}>Luo cardholder</button>
//         </div>
//       </section>

//       <section style={cardStyle}>
//         <h2>Lokit</h2>
//         <textarea style={{ width: "100%", minHeight: 160, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }} value={log} onChange={() => {}} />
//       </section>
//     </div>
//   );
// }
