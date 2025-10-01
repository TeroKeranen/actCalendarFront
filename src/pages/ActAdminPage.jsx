// src/pages/ActAdminPage.jsx
import { useState } from "react";
import {  redirect, useLoaderData, useRevalidator } from "react-router-dom";
import { getUser } from "../lib/auth";
import { apiDelete, apiGet } from "../lib/api";

// --- LOADER (JS-versio) ---
// --- LOADER: hae lista api.js:n kautta ---
export async function loader() {
    const auth = getUser();
    if (!auth || !auth.tenantId || !auth.token) {
      throw redirect("/signin?redirectTo=/app/test/act");
    }
  
    try {
      const data = await apiGet(`/api/tenants/${auth.tenantId}/act/cardholders`, auth.token);
      // hyväksy array tai { items: [...] }

      console.log("Data", data);
      
      const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
      return items;
    } catch (e) {
      throw json({ error: e?.message || "Haku epäonnistui" }, { status: 500 });
    }
  }

export default function ActAdminPage() {
    const rows = useLoaderData() || [];

    console.log("ROWS", rows);
    const { revalidate } = useRevalidator();
    const auth = getUser();
  
    async function handleDelete(cardholderId) {
      const ok = window.confirm(
        `Poistetaanko CardHolder ${cardholderId}? Tämä poistaa myös siihen liittyvät varaukset tietokannasta.`
      );
      if (!ok) return;
  
      try {
        await apiDelete(
          `/api/tenants/${auth.tenantId}/act/cardholders/${encodeURIComponent(cardholderId)}`,
          auth.token
        );
        revalidate(); // päivitä lista
      } catch (e) {
        alert(`Poisto epäonnistui: ${e?.message || e}`);
      }
    }
  
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">ACT365 testisivu</h1>
        <p className="text-sm text-gray-500 mb-6">
          Lista sovelluksen luomista CardHoldereista (bookingit, joilla on actCardholderId). Poista-nappi yrittää poistaa
          henkilön ACT:stä ja siivoaa varaukset kannasta.
        </p>
  
        <div className="overflow-x-auto border rounded-lg">
          <table className="table w-full">
            <thead>
              <tr>
                <th>CardHolderID</th>
                <th>Ovi</th>
                <th>Nimi</th>
                <th>Aika</th>
                <th>Koodi</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap">{r.actCardholderId}</td>
                    <td className="whitespace-nowrap">
                      {r.doorName} ({r.actDoorId})
                    </td>
                    <td className="whitespace-nowrap">{r.bookerName || "-"}</td>
                    <td className="whitespace-nowrap">
                      {new Date(r.startsAt).toLocaleString("fi-FI")} –{" "}
                      {new Date(r.endsAt).toLocaleString("fi-FI")}
                    </td>
                    <td className="whitespace-nowrap">{r.accessCode || "-"}</td>
                    <td className="whitespace-nowrap">{r.status}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-xs btn-error"
                        onClick={() => handleDelete(r.actCardholderId)}
                      >
                        Poista
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-sm text-gray-500">
                    Ei henkilöitä listattavana.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
}
