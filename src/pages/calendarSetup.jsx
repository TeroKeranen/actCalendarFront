import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../lib/auth";
import { listSites, listDoors } from "../lib/api";

/**
 * 1) Valitse Site
 * 2) Valitse Ovi
 * Tallennus localStorageen -> siirrytään kalenteriin ---> doorCalendar.jsx
 */
export default function CalendarSetup() {
  const nav = useNavigate();
  const auth = getUser();

  if (!auth?.token || !auth?.tenantId) {
    return <div style={{ padding: 24 }}>Ei kirjautunutta tenanttia. Kirjaudu sisään.</div>;
  }

  const [sites, setSites] = useState([]);
  const [doors, setDoors] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);
  const [loadingDoors, setLoadingDoors] = useState(false);
  const [err, setErr] = useState("");

  const [siteId, setSiteId] = useState(localStorage.getItem("act.selectedSiteId") || "");
  const [doorId, setDoorId] = useState(localStorage.getItem("act.selectedDoorId") || "");

  // apu: normaali muoto (site)
  const normalizeSites = (resp) => {
    const arr = Array.isArray(resp) ? resp : (resp?.items || resp?.sites || []);
    return (arr || [])
      .map(s => ({
        siteId: Number(s.SiteID ?? s.siteid ?? s.SiteId ?? s.Id ?? s.id ?? s.ID),
        name: String(s.Name ?? s.SiteName ?? s.name ?? `Site ${s.SiteID ?? s.Id ?? s.id ?? s.ID ?? "?"}`)
      }))
      .filter(x => Number.isFinite(x.siteId));
  };

  // apu: normaali muoto (door)
  const normalizeDoors = (resp) => {
    const arr = Array.isArray(resp) ? resp : (resp?.items || resp?.doors || []);
    return (arr || [])
      .map(d => ({
        doorId: Number(d.DoorID ?? d.doorId ?? d.ID ?? d.Id ?? d.id),
        name: String(d.Name ?? d.DoorName ?? d.name ?? `Door ${d.DoorID ?? d.Id ?? d.id ?? "?"}`),
        siteId: Number(d.SiteID ?? d.siteId ?? (siteId || d.siteid))
      }))
      .filter(x => Number.isFinite(x.doorId));
  };

  // Hae sitet
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        setErr(""); setLoadingSites(true);
        const r = await listSites(auth.tenantId, auth.token);
        if (dead) return;
        const s = normalizeSites(r);
        setSites(s);
        if (!siteId && s.length === 1) setSiteId(String(s[0].siteId));
      } catch (e) {
        if (!dead) setErr(e?.message || "Sitejen haku epäonnistui");
      } finally {
        if (!dead) setLoadingSites(false);
      }
    })();
    return () => { dead = true; };
  }, [auth.tenantId, auth.token]);

  // Hae ovet kun site valittu
  useEffect(() => {
    let dead = false;
    setDoors([]);
    if (!siteId) return;
    (async () => {
      try {
        setErr(""); setLoadingDoors(true);
        const r = await listDoors(auth.tenantId, siteId, auth.token);
        if (dead) return;
        const d = normalizeDoors(r);
        setDoors(d);
        if (d.length === 1) setDoorId(String(d[0].doorId));
      } catch (e) {
        if (!dead) setErr(e?.message || "Ovilistan haku epäonnistui");
      } finally {
        if (!dead) setLoadingDoors(false);
      }
    })();
    return () => { dead = true; };
  }, [siteId, auth.tenantId, auth.token]);

  const proceed = () => {
    if (!siteId || !doorId) {
      setErr("Valitse sekä site että ovi");
      return;
    }
    localStorage.setItem("act.selectedSiteId", String(siteId));
    localStorage.setItem("act.selectedDoorId", String(doorId));
    // Voit tallettaa myös oven nimen UX:ää varten:
    const doorName = doors.find(d => String(d.doorId) === String(doorId))?.name || "";
    localStorage.setItem("act.selectedDoorName", doorName);
    nav("/calendar/door");
  };

  return (
    <div style={{ maxWidth: 640, margin: "24px auto", padding: 16 }}>
      <h2>Kalenterin asetukset</h2>

      {loadingSites ? <p>Ladataan site-listaa…</p> : (
        <>
          <label>Site</label>
          <select
            value={siteId}
            onChange={(e) => { setSiteId(e.target.value); setDoorId(""); }}
            style={{ width: "100%", padding: 8, marginBottom: 12 }}
          >
            <option value="">Valitse site…</option>
            {sites.map(s => (
              <option key={s.siteId} value={s.siteId}>
                {s.name} (ID: {s.siteId})
              </option>
            ))}
          </select>
        </>
      )}

      {siteId && (loadingDoors ? <p>Ladataan ovia…</p> : (
        <>
          <label>Ovi</label>
          <select
            value={doorId}
            onChange={(e) => setDoorId(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 12 }}
          >
            <option value="">Valitse ovi…</option>
            {doors.map(d => (
              <option key={d.doorId} value={d.doorId}>
                {d.name} (ID: {d.doorId})
              </option>
            ))}
          </select>
        </>
      ))}

      <button onClick={proceed} style={{ padding: "8px 14px" }}>
        Jatka kalenteriin »
      </button>

      {err && <p style={{ color: "crimson", marginTop: 12 }}>{err}</p>}
    </div>
  );
}
