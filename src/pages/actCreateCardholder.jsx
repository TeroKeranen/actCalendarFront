import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../lib/auth";
import { listSites, createCardholder, listCardholderGroups } from "../lib/api";


//// HENKILÖN LUOMINEN


export default function ActCreateCardholder() {
  const auth = getUser(); // { token, tenantId, ... }
  const nav = useNavigate();

  if (!auth?.token || !auth?.tenantId) {
    return <div style={{ padding: 24 }}>Ei kirjautunutta tenanttia. Kirjaudu sisään.</div>;
  }

  const [sites, setSites] = useState([]);
  const [meta, setSitesMeta] = useState(null);
  const [loadingSites, setLoadingSites] = useState(true);
  const [siteErr, setSiteErr] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitErr, setSubmitErr] = useState("");
  const [result, setResult] = useState(null);

    // --- ryhmät ---
    const [groups, setGroups] = useState([]); // [{ id, name, accessRights? }]
    const [loadingGroups, setLoadingGroups] = useState(false);
    const [groupsErr, setGroupsErr] = useState("")

  const [form, setForm] = useState({
    siteId: "",
    forename: "",
    surname: "",
    email: "",
    pin: "",
    selectedGroupIds: []
  });

  useEffect(() => {
    let abort = false;
  
    const coerceSites = (resp) => {
      // resp voi olla array (RAW ACT) tai object {items, via, count}
      const arr = Array.isArray(resp) ? resp : (resp?.items || resp?.sites || []);
      const mapped = (arr || [])
        .map((s) => ({
          // huomioi myös isolla ID
          siteId: Number(s.SiteID ?? s.siteid ?? s.SiteId ?? s.Id ?? s.id ?? s.ID),
          name: String(s.Name ?? s.SiteName ?? s.name ?? `Site ${s.SiteID ?? s.Id ?? s.id ?? s.ID ?? "?"}`),
        }))
        .filter((x) => Number.isFinite(x.siteId));
      return {
        items: mapped,
        via: Array.isArray(resp) ? "raw" : (resp?.via || "?"),
        count: mapped.length,
      };
    };
  
    (async () => {
      try {
        const r = await listSites(auth.tenantId, auth.token);
        if (abort) return;
        console.log("ACT sites response:", r);
        const { items, via, count } = coerceSites(r);
        setSites(items);
        setSitesMeta({ via, count });
        if (items.length === 1) {
          setForm((f) => ({ ...f, siteId: String(items[0].siteId) }));
        }
      } catch (e) {
        setSiteErr(e?.message || String(e));
      } finally {
        if (!abort) setLoadingSites(false);
      }
    })();
  
    return () => { abort = true; };
  }, [auth.tenantId, auth.token]);

  // Hae ryhmät kun site valitaan/vaihtuu
  useEffect(() => {
    let abort = false;
    setGroups([]); setGroupsErr("");
    if (!form.siteId) return;

    (async () => {
      try {
        setLoadingGroups(true);
        const resp = await listCardholderGroups(auth.tenantId, form.siteId, auth.token);
        if (abort) return;
        const items = resp?.items || (Array.isArray(resp) ? resp : []);
        setGroups(items);
        // nollaa valinnat kun site vaihtuu
        setForm((f) => ({ ...f, selectedGroupIds: [] }));
      } catch (e) {
        if (!abort) setGroupsErr(e?.message || "Ryhmälistan haku epäonnistui");
      } finally {
        if (!abort) setLoadingGroups(false);
      }
    })();

    return () => { abort = true; };
  }, [form.siteId, auth.tenantId, auth.token]);




  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitErr("");
    setResult(null);

    if (!form.siteId || !form.forename || !form.surname) {
      setSubmitErr("Täytä vähintään SiteID, etunimi ja sukunimi.");
      return;
    }

    const groups = form.groupIdsCsv
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(x => (isNaN(Number(x)) ? x : Number(x)));

    const payload = {
      siteId: form.siteId,
      forename: form.forename,
      surname: form.surname,
      pin: form.pin,
      ...(form.email ? { email: form.email } : {}),
      ...(form.selectedGroupIds.length ? { groups: form.selectedGroupIds.map(Number) } : {}),
    };

    try {
      setSubmitting(true);
      const r = await createCardholder(auth.tenantId, payload, auth.token);
      setResult(r);
    } catch (e) {
      setSubmitErr(e?.message || "Cardholderin luonti epäonnistui");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "24px auto", padding: 16 }}>
      <h2>Luo ACT365 Cardholder</h2>

      {loadingSites && <p>Ladataan site-listaa…</p>}
      {siteErr && <p style={{ color: "crimson" }}>{siteErr}</p>}

      {!loadingSites && !siteErr && (
        <>
          <p style={{ color: "#555" }}>
            Debug: via={meta?.via || "?"}, count={meta?.count ?? "?"}
          </p>

          {sites.length === 0 ? (
            <>
              <p style={{ color: "#555" }}>
                Ei yhtään siteä löytynyt tälle asiakkaalle. Jos olet varma, että
                niitä on, tarkista backendin vastauksen muoto DevTools-konsolista (katso "ACT sites response").
              </p>
              {/* Salli manuaalinen syöttö, jotta pääset testaamaan */}
              <label>SiteID (manuaalinen)</label>
              <input
                type="text"
                value={form.siteId}
                onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                placeholder="Esim. 1"
                style={{ width: "100%", padding: 8, marginBottom: 12 }}
              />
            </>
          ) : (
            <>
              <label>Site</label>
              <select
                value={form.siteId}
                onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                required
                style={{ width: "100%", padding: 8, marginBottom: 12 }}
              >
                <option value="" disabled>Valitse site…</option>
                {sites.map(s => (
                  <option key={s.siteId} value={s.siteId}>
                    {s.name} (ID: {s.siteId})
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Etunimi</label>
          <input
            type="text"
            value={form.forename}
            onChange={(e) => setForm({ ...form, forename: e.target.value })}
            required
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
            placeholder="Matti"
          />

          <label>Sukunimi</label>
          <input
            type="text"
            value={form.surname}
            onChange={(e) => setForm({ ...form, surname: e.target.value })}
            required
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
            placeholder="Meikäläinen"
          />

          <label>pin koodi</label>
          <input 
            type="text"
            value={form.pin}
            onChange={(e) => setForm({...form, pin: e.target.value})}
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
          />

          <label>Sähköposti (valinnainen)</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={{ width: "100%", padding: 8, marginBottom: 10 }}
            placeholder="matti@example.com"
          />

          {form.siteId && (
            <>
              {loadingGroups ? (
                <p>Ladataan ryhmiä…</p>
              ) : groupsErr ? (
                <p style={{ color: "crimson" }}>{groupsErr}</p>
              ) : (
                <>
                  <label>Kulkuoikeusryhmät (monivalinta)</label>
                  <select
                    multiple
                    value={(form.selectedGroupIds || []).map(String)}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(o => Number(o.value));
                      setForm(f => ({ ...f, selectedGroupIds: selected }));
                    }}
                    style={{ width: "100%", padding: 8, marginBottom: 12, minHeight: 140 }}
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name || `Group ${g.id}`}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </>
          )}

          <button type="button" onClick={onSubmit} disabled={submitting} style={{ padding: "8px 14px" }}>
            {submitting ? "Luodaan..." : "Luo cardholder"}
          </button>

          {submitErr && <p style={{ color: "crimson", marginTop: 12 }}>{submitErr}</p>}

          {result && (
            <div style={{ marginTop: 16, border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
              <h3>Tulos</h3>
              <p><strong>CardholderID:</strong> {result.cardholderId}</p>
              <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result.summary ?? result, null, 2)}</pre>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <button onClick={() => nav("/welcome")} style={{ padding: "6px 10px" }}>← Takaisin</button>
          </div>
        </>
      )}
    </div>
  );
}
