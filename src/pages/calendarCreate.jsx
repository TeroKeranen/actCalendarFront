import { useEffect, useMemo, useState } from "react";
import { Form, redirect, useActionData, useNavigate, useNavigation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "../lib/auth";
import { listSites, listDoors, listCardholderGroups, createCalendar } from "../lib/api";
import { FormInput, SubmitBtn } from "../components";
import { toast } from "react-toastify";
import { selectSites, makeSelectDoorsForSite, makeSelectGroupsForSite, bootstrapTenant } from "../features/tenant/tenantSlice";



//// LUO KALENTERI SIVU




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

  const dispatch = useDispatch();
  const auth = getUser();

  if (!auth?.token || !auth?.tenantId) {
    return <div style={{ padding: 24 }}>Ei kirjautunutta tenanttia.</div>;
  }

   // Lataa tenantin data tarvittaessa
   const tenantStatus = useSelector((s) => s.tenant.status);

   useEffect(() => {
     if (tenantStatus === "idle") {
       dispatch(bootstrapTenant({ tenantId: auth.tenantId, token: auth.token }));
     }
   }, [tenantStatus, dispatch, auth.tenantId, auth.token]);

    // Memoidut selektorit tälle komponentille
  const selectDoorsForCurrentSite = useMemo(makeSelectDoorsForSite, []);
  const selectGroupsForCurrentSite = useMemo(makeSelectGroupsForSite, []);

  const sites = useSelector(selectSites);

  const [form, setForm] = useState({
    siteId: "",
    doorId: "",
    doorGroupId: "",      // valittu ryhmä
    cardholderGroupId: "",// lähetetään myös tällä nimellä varmuuden vuoksi
    title: "",
    slotMinutes: 60,
  });

    // // Ovien ja ryhmien listat valitulle sitelle suoraan storesta
    // const doors  = useSelector((state) => selectDoorsForSite(state, form.siteId));
    // const groups = useSelector((state) => selectGroupsForSite(state, form.siteId));
   // Oviet & ryhmät valitulle sitelle
   const doors = useSelector((state) => selectDoorsForCurrentSite(state, form.siteId));
   const groups = useSelector((state) => selectGroupsForCurrentSite(state, form.siteId));


  // Valitse aloitussite: localStoragesta tai jos vain yksi site
  useEffect(() => {
    if (form.siteId) return;
    let remembered = null;
    try { remembered = localStorage.getItem("cc:lastSiteId"); } catch {}
    if (remembered && sites.some(s => String(s.id) === String(remembered))) {
      setForm((p) => ({ ...p, siteId: String(remembered) }));
    } else if (sites.length === 1) {
      setForm((p) => ({ ...p, siteId: String(sites[0].id) }));
    }
  }, [sites, form.siteId]);



  // Kun site vaihtuu, muista valinta ja esivalitse 1. door & group
  useEffect(() => {
    if (!form.siteId) return;
    try { localStorage.setItem("cc:lastSiteId", form.siteId); } catch {}
    if (doors.length && !form.doorId) {
      setForm((p) => ({ ...p, doorId: String(doors[0].id) }));
    }
    if (groups.length && !form.doorGroupId) {
      const first = String(groups[0].id);
      setForm((p) => ({ ...p, doorGroupId: first, cardholderGroupId: first }));
    }
  }, [form.siteId, doors, groups, form.doorId, form.doorGroupId]);

  // Nimet hidden-kenttiin actionia varten
  const doorName = useMemo(
    () => doors.find((d) => String(d.id) === String(form.doorId))?.name || "",
    [doors, form.doorId]
  );
  const groupName = useMemo(
    () => groups.find((g) => String(g.id) === String(form.doorGroupId))?.name || "",
    [groups, form.doorGroupId]
  );

  const actionData  = useActionData();
  const navigation  = useNavigation();
  const submitting  = navigation.state === "submitting";

  // Pieni tilaindikaattori, jos bootstrap ei ole vielä valmis
  if (tenantStatus === "loading" || (!sites.length && tenantStatus !== "failed")) {
    return <div style={{ padding: 24 }}>Ladataan…</div>;
  }

  return (
    <div >
      <section className="grid place-items-center p-10">
        <Form method="post" className="card w-96 p-8 bg-base-100 shadow-xl/20 flex flex-col gap-y-4">
          {/* Piilokentät actionille */}
          <input type="hidden" name="doorName" value={doorName} />
          <input type="hidden" name="doorGroupName" value={groupName} />
          <input type="hidden" name="cardholderGroupId" value={form.cardholderGroupId} />

          {/* SITE */}
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Site</legend>
            <select
              name="siteId"
              value={form.siteId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  siteId: e.target.value,
                  doorId: "",
                  doorGroupId: "",
                  cardholderGroupId: "",
                }))
              }
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
            <legend className="fieldset-legend">Door</legend>
            <select
              name="doorId"
              value={form.doorId}
              onChange={(e) => setForm((p) => ({ ...p, doorId: e.target.value }))}
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
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  doorGroupId: e.target.value,
                  cardholderGroupId: e.target.value, // pidä synkassa
                }))
              }
              className="select w-full"
              disabled={!form.siteId}
              required
            >
              <option value="">{form.siteId ? "Valitse CardHolderGroup…" : "Valitse ensin site"}</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} (ID:{g.id})
                </option>
              ))}
            </select>
          </fieldset>

          {/* TITLE */}
          <label className="text-sm font-medium">Otsikko (julkinen)</label>
          <input
            name="title"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            className="input w-full"
            placeholder="Esim. Vierailijaportti"
          />

          {/* SLOT MINUTES */}
          <label className="text-sm font-medium">Aikaväli (min)</label>
          <input
            type="number"
            name="slotMinutes"
            value={form.slotMinutes}
            onChange={(e) => setForm((p) => ({ ...p, slotMinutes: e.target.value }))}
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
            <p className={`mt-2 ${actionData.ok ? "text-emerald-600" : "text-rose-600"}`}>
              {actionData.ok
                ? actionData.slug
                  ? `OK. Jaa linkki: ${window.location.origin}/c/${actionData.slug}`
                  : "Kalenteri luotu."
                : actionData.error}
            </p>
          )}
        </Form>
      </section>
    </div>
  );
}
