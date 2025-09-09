import { useEffect, useState } from "react";
import { Form, redirect, useActionData, useNavigate, useNavigation } from "react-router-dom";
import { getUser } from "../lib/auth";
import { listSites, listDoors, listCardholderGroups, createCalendar } from "../lib/api";
import { FormInput, SubmitBtn } from "../components";
import { toast } from "react-toastify";


export const action = async ({request}) => {

  const auth = getUser();
  if (!auth?.tenantId ||!auth?.token) {
    return redirect("/signin")
  }


  const fd = await request.formData();

  const siteId        = Number(fd.get("siteId") || 0);
  const doorId        = Number(fd.get("doorId") || 0);
  // tukee myös vanhaa nimeä cardholderGroupId varmuuden vuoksi
  const cardholderGroupId   = Number(fd.get("doorGroupId") || fd.get("cardholderGroupId") || 0);

  
  const doorName      = (fd.get("doorName") || "").toString();
  const cardholderGroupName = (fd.get("doorGroupName") || "").toString();
  const title         = (fd.get("title") || "").toString();
  const slotMinutes   = Number(fd.get("slotMinutes") || 60);



 


  if (!siteId || !doorId || !cardholderGroupName) {
    // return ({ok: false, error: "Valitse site, ovi ja ryhmö"}, {status: 400})
    // return JSON({ok: false, error: "valitse site ovi ja ryhmä"}, {status: 400})
    // console.log("jotain puutttuu");
  }

  try {
    const response = await createCalendar(auth.tenantId, {siteId, doorId, doorName, cardholderGroupId, cardholderGroupName, title: title || doorName || 'Ovikalenteri', slotMinutes}, auth.token)
    

    
    
    
    const slug = response?.calendar?.slug;
    if (slug) {
      toast.success("Kalenteri luotu");
       return ({ ok: true, slug });
     
    }
    return json({ ok: true });
  } catch (error) {
    console.log("ERRORE", error);

    const msg = error?.message || "Kalenterin luonti epäonnistui";
     return ({ ok: false, error: msg }, { status: 400 });
    
    
  }



}

export default function CalendarCreate() {
  const auth = getUser();
  const nav = useNavigate();
  if (!auth?.token || !auth?.tenantId) return <div style={{padding:24}}>Ei kirjautunutta tenanttia.</div>;
  const { tenantId, token } = auth;
  
  const actionData = useActionData();

  
  const navigation = useNavigation();

  const [sites, setSites] = useState([]);
  const [doors, setDoors] = useState([]);
  const [groups, setGroups] = useState([]);
  const [msg, setMsg] = useState("");
  const submitting = navigation.state === "submitting";

  const [form, setForm] = useState({
    siteId: "",
    doorId: "",
    cardholderGroupId: "",
    title: "",
    slotMinutes: 60,
  });

  const normalizeSites = (resp) => {
    const arr = Array.isArray(resp) ? resp : (resp?.items || resp?.sites || []);
    return (arr || [])
      .map(s => ({ id: Number(s.SiteID ?? s.siteid ?? s.ID ?? s.Id ?? s.id),
                   name: String(s.Name ?? s.SiteName ?? s.name ?? `Site ${s.SiteID ?? s.ID ?? "?"}`)}))
      .filter(x => Number.isFinite(x.id));
  };
  const normalizeDoors = (resp) => {
    const arr = Array.isArray(resp) ? resp : (resp?.items || resp?.doors || []);
    return (arr || [])
      .map(d => ({ id: Number(d.DoorID ?? d.ID ?? d.Id ?? d.id),
                   name: String(d.Name ?? d.DoorName ?? d.name ?? `Door ${d.DoorID ?? d.ID ?? "?"}`)}))
      .filter(x => Number.isFinite(x.id));
  };
  // CHG-endpoint normalisoituna (voit näyttää myös nimen suoraan)
  const normalizeCHG = (resp) => {
    const arr = resp?.items || [];
    return (arr || [])
      .map(g => ({ id: Number(g.id ?? g.ID ?? g.GroupID),
                   name: String(g.name ?? g.Name ?? `Group ${g.id ?? g.ID}`)}))
      .filter(x => Number.isFinite(x.id));
  };

  // sitet
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        setMsg("");
        const r = await listSites(tenantId, token);
        if (dead) return;
        const s = normalizeSites(r);
        setSites(s);
        if (s.length === 1) setForm(prev => prev.siteId ? prev : { ...prev, siteId: String(s[0].id) });
      } catch (e) {
        if (!dead) setMsg(e?.message || "Sitejen haku epäonnistui");
      }
    })();
    return () => { dead = true; };
  }, [tenantId, token]);

  // ovet + CHG kun site vaihtuu
  useEffect(() => {
    let dead = false;
    if (!form.siteId) { setDoors([]); setGroups([]); return; }
    (async () => {
      try {
        setMsg("");
        const [dResp, gResp] = await Promise.all([
          listDoors(tenantId, form.siteId, token),
          listCardholderGroups(tenantId, form.siteId, token),
        ]);
        if (dead) return;
        setDoors(normalizeDoors(dResp));
        setGroups(normalizeCHG(gResp));
      } catch (e) {
        if (!dead) setMsg(e?.message || "Ovien / ryhmien haku epäonnistui");
      }
    })();
    return () => { dead = true; };
  }, [form.siteId, tenantId, token]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!form.siteId || !form.doorId || !form.cardholderGroupId) {
      setMsg("Valitse site, ovi ja CardHolderGroup");
      return;
    }
    try {
      const doorName = doors.find(d => String(d.id) === String(form.doorId))?.name;
      const chgName  = groups.find(g => String(g.id) === String(form.cardholderGroupId))?.name;

      const resp = await createCalendar(
        tenantId,
        {
          siteId: Number(form.siteId),
          doorId: Number(form.doorId),
          doorName,
          cardholderGroupId: Number(form.cardholderGroupId),
          cardholderGroupName: chgName,
          title: form.title || doorName || "Ovikalenteri",
          slotMinutes: Number(form.slotMinutes) || 60,
        },
        token
      );
      const slug = resp?.calendar?.slug;
      setMsg(slug ? `OK. Jaa linkki: ${window.location.origin}/c/${slug}` : "Kalenteri luotu.");
    } catch (e) {
      setMsg(e?.message || "Kalenterin luonti epäonnistui");
    }
  };

  return (

    <div style={{ padding: 24 }}>
    <h2>Tervetuloa {auth.email}</h2>
    <p>Rooli: {auth.role}</p>
    

    <section className="h-screen grid place-items-center">
      <Form method="post" className="card w-96 p-8 bg-base-100 shadow-xl/20 flex flex-col gap-y-4">

      {/* SITE */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Site</legend>
        <select 
          name="siteId" 
          value={form.siteId} 
          onChange={e => setForm(prev => ({ ...prev, siteId: e.target.value, doorId: "", cardholderGroupId: "" }))}
          required
          className="select w-full"
          
        >
        <option value="">Valitse site…</option>

          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} (ID:{s.id})
            </option>
          ))}
     
        </select>
        
      </fieldset>
      
      {/* DOOR */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">door</legend>
        <select 
          name="doorId" 
          value={form.doorId} 
          onChange={e => setForm(prev => ({ ...prev, doorId: e.target.value }))}
          disabled={!form.siteId}
          
          required
          className="select w-full"
        >
        <option value="">{form.siteId ? "Valitse ovi…" : "Valitse ensin site"}</option>

        {doors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} (ID:{d.id})
            </option>
          ))}
     
        </select>
        
      </fieldset>

      {/* CARDHOLDER GROUP */}
      <fieldset className="fieldset">
        <legend className="fieldset-legend">CardHolderGroup (Door Group)</legend>
        <select 
          name="doorGroupId" 
          value={form.doorGroupId}
          onChange={(e) => setForm((prev) => ({ ...prev, doorGroupId: e.target.value }))}
          className="select w-full"
          disabled={!form.siteId}
          required
        >
          <option value="">
            {form.siteId ? "Valitse CardHolderGroup…" : "Valitse ensin site"}
          </option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} (ID:{g.id})
            </option>
          ))}
     
        </select>
        
      </fieldset>

        {/* NIMET HIDDENIIN (helpottaa backendia) */}
        {/* <input type="hidden" name="doorName" value={selectedDoorName} />
        <input type="hidden" name="doorGroupName" value={selectedGroupName} /> */}


        {/* TITLE */}
        <label className="text-sm font-medium">Otsikko (julkinen)</label>
          <input
            name="title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            className="input w-full"
            placeholder="Esim. Vierailijaportti"
          />

        {/* SLOT MINUTES */}
        <label className="text-sm font-medium">Aikaväli (min)</label>
          <input
            type="number"
            name="slotMinutes"
            value={form.slotMinutes}
            onChange={(e) => setForm((prev) => ({ ...prev, slotMinutes: e.target.value }))}
            className="input w-full"
            min={5}
            step={5}
            required
          />

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-gray-800 shadow-lg shadow-gray-800/50 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
        >
          {submitting ? "Luodaan…" : "Luo kalenteri"}
        </button>

         {/* Palaute */}
         {actionData && (
          <p
            className={`mt-2 ${
              actionData.ok ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {actionData.ok
              ? actionData.slug
                ? `OK. Jaa linkki: ${window.location.origin}/c/${actionData.slug}`
                : "Kalenteri luotu."
              : actionData.error}
          </p>
        )}

        {msg && (
          <p className="text-rose-600">
            {msg}
          </p>
        )}


      </Form>

    </section>

  </div>

  );
}
