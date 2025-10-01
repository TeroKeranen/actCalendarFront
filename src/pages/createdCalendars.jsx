import { Link, redirect, useLoaderData, useRevalidator } from "react-router-dom";
import { getUser } from "../lib/auth"
import { deleteCalendar, listCalendars } from "../lib/api";

export async function loader () {
    const auth = getUser();

    if (!auth.tenantId || !auth.token) return redirect('/signin');

    const response = await listCalendars(auth.tenantId, auth.token);

    const items = Array.isArray(response?.items) ? response.items : Array.isArray(response) ? response : [];

    console.log("items", items);
    return {items};
}

export default function CreatedCalendar () {

    const {items } = useLoaderData() ?? {items: []};
    const {revalidate} = useRevalidator();
    const auth = getUser();

    async function handleDelete(idOrSlug) {
      const ok = window.confirm("Poistetaanko kalenteri? (Toiminto poistaa julkisen linkin)");

      if (!ok) return;

      try {
        await deleteCalendar(auth.tenantId, idOrSlug, auth.token);
        revalidate(); // Lataa listan uudelleen
      } catch (e) {
        alert(e?.message || "Poisto epäonnistui")
      }
    }


    if (!items.length) {
        return (
          <div className="mx-auto max-w-3xl p-6">
            <h2 className="mb-2 text-2xl font-semibold">Luodut kalenterit</h2>
            <p className="text-gray-600">Ei vielä kalentereita.</p>
            <div className="mt-4">
              <Link to="/calendarcreate" className="btn btn-primary">Luo ensimmäinen kalenteri</Link>
            </div>
          </div>
        );
      }
    
      return (
        <div className="mx-auto max-w-5xl p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-2xl font-semibold">Luodut kalenterit</h2>
            <Link to="/calendarcreate" className="btn btn-primary">+ Uusi kalenteri</Link>
          </div>
    
          <ul className="grid gap-4 sm:grid-cols-2">
            {items.map((c) => {
              const slug = c.slug;
              const publicHref = `/c/${slug}`;
              return (
                <li key={c.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {c.title || c.doorName || "Ovikalenteri"}
                    </h3>
                    <span className={`text-xs ${c.published ? "text-emerald-600" : "text-gray-500"}`}>
                      {c.published ? "julkaistu" : "piilotettu"}
                    </span>
                  </div>
    
                  <div className="space-y-1 text-sm text-gray-700">
                    {c.doorName && <p><span className="font-medium">Ovi:</span> {c.doorName}</p>}
                    <p><span className="font-medium">SiteID:</span> {c.siteId} &nbsp;·&nbsp; <span className="font-medium">DoorID:</span> {c.actDoorId}</p>
                    <p><span className="font-medium">Aikaväli:</span> {c.slotMinutes} min</p>
                    <p className="break-all">
                      <span className="font-medium">Julkinen linkki:</span>{" "}
                      <Link to={publicHref} className="link link-primary">{window.location.origin}{publicHref}</Link>
                    </p>
                  </div>
    
                  <div className="mt-3 flex gap-2">
                    <Link to={publicHref} className="btn btn-sm">Avaa</Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${publicHref}`)}
                    >
                      Kopioi linkki
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-error"
                      onClick={() => handleDelete(c.id)}
                    >
                      
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      );
}