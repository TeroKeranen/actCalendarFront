import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../lib/auth";
import { createBooking } from "../lib/api";

/**
 * Yksinkertainen "päivä + aikaikkuna" -kalenteri valitulle ovelle.
 * Luo varauksen ja pyytää backendiltä PINin ajastuksella (POST /bookings).
 */
export default function DoorCalendar() {
  const nav = useNavigate();
  const auth = getUser();

  if (!auth?.token || !auth?.tenantId) {
    return <div style={{ padding: 24 }}>Ei kirjautunutta tenanttia. Kirjaudu sisään.</div>;
  }

  const selectedDoorId = localStorage.getItem("act.selectedDoorId");
  const selectedDoorName = localStorage.getItem("act.selectedDoorName") || "";
  const selectedSiteId = localStorage.getItem("act.selectedSiteId");

  // Jos ei ole asetettu ovea, takaisin asetuksiin
  useEffect(() => {
    if (!selectedDoorId || !selectedSiteId) {
      nav("/calendar/setup");
    }
  }, [selectedDoorId, selectedSiteId, nav]);

  // Varauslomake
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [pin, setPin] = useState(""); // jos haluat joustavan pinin

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  // ISO-ajat (lähetetään backendiin; backend voi muuntaa ACT:n odottamaan formaattiin)
  const startsAtISO = useMemo(() => new Date(`${date}T${startTime}:00`).toISOString(), [date, startTime]);
  const endsAtISO   = useMemo(() => new Date(`${date}T${endTime}:00`).toISOString(),   [date, endTime]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!selectedDoorId) {
      setMsg("Valitse ovi asetuksista.");
      return;
    }

    // pieni validointi
    if (new Date(startsAtISO) >= new Date(endsAtISO)) {
      setMsg("Lopetusaika pitää olla aloitusajan jälkeen.");
      return;
    }
    if (!guestName.trim()) {
      setMsg("Nimi on pakollinen.");
      return;
    }

    const payload = {
      siteId: Number(selectedSiteId),
      doorId: Number(selectedDoorId),
      startsAt: startsAtISO,
      endsAt: endsAtISO,
      guestName,
      guestEmail: guestEmail || undefined,
      pin: pin || undefined, // jos tyhjä, backend voi generoida
    };

    try {
      setSubmitting(true);
      const r = await createBooking(auth.tenantId, payload, auth.token);
      setMsg(`OK – varaus luotu. BookingID: ${r?.booking?._id || "(?)"}; PIN: ${r?.booking?.accessCode || r?.accessCode || "(piilotettu)"}`);
    } catch (e) {
      setMsg(e?.message || "Varauksen luonti epäonnistui");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 680, margin: "24px auto", padding: 16 }}>
      <h2>Kalenteri – {selectedDoorName ? `${selectedDoorName} (ID: ${selectedDoorId})` : `Ovi ${selectedDoorId}`}</h2>

      <form onSubmit={submit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label>Päivä</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: "100%", padding: 8 }}
              required
            />
          </div>
          <div></div>

          <div>
            <label>Alkaa</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ width: "100%", padding: 8 }}
              required
            />
          </div>
          <div>
            <label>Päättyy</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={{ width: "100%", padding: 8 }}
              required
            />
          </div>

          <div>
            <label>Nimi</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              style={{ width: "100%", padding: 8 }}
              placeholder="Vierailija / urakoitsija tms."
              required
            />
          </div>
          <div>
            <label>Sähköposti (valinnainen)</label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              style={{ width: "100%", padding: 8 }}
              placeholder="ilmoitusosoite"
            />
          </div>

          <div>
            <label>PIN (valinnainen)</label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={{ width: "100%", padding: 8 }}
              placeholder="Jos tyhjä, generoidaan"
            />
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <button type="submit" disabled={submitting} style={{ padding: "8px 14px" }}>
            {submitting ? "Luodaan..." : "Luo varaus & PIN"}
          </button>
          <button
            type="button"
            onClick={() => nav("/calendar/setup")}
            style={{ padding: "8px 12px", marginLeft: 8 }}
          >
            ← Vaihda ovea
          </button>
        </div>
      </form>

      {msg && <p style={{ marginTop: 14, color: msg.startsWith("OK") ? "#0a7" : "crimson" }}>{msg}</p>}
    </div>
  );
}
