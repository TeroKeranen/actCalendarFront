import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicCalendar, publicBook } from "../lib/api";

function pad2(n) { return String(n).padStart(2, "0"); }
function parseHHMM(s = "00:00") {
  const [hh, mm] = s.split(":").map(Number);
  return (Number.isFinite(hh) ? hh : 0) * 60 + (Number.isFinite(mm) ? mm : 0);
}
function fmtMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

export default function PublicCalendar() {
  const { slug } = useParams();
  const [cal, setCal] = useState(null);
  const [msg, setMsg] = useState("");

  const [forename, setForename] = useState("");
  const [surname, setSurname]   = useState("");

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [start, setStart] = useState(""); // täyttyy slot-valinnasta
  const [end, setEnd]     = useState(""); // täyttyy slot-valinnasta
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [pickedIdx, setPickedIdx] = useState(-1);

  // Hae kalenteri
  useEffect(() => {
    (async () => {
      try {
        const r = await getPublicCalendar(slug);
        setCal(r?.calendar || null);
      } catch (e) {
        setMsg(e?.message || "Kalenteria ei löytynyt");
      }
    })();
  }, [slug]);

  // Laske päivän slotit
// korvaa nykyinen useMemo(slots) tällä
const slots = useMemo(() => {
  if (!cal) return [];
  const slotMinutes = Number(cal.slotMinutes || 60);
  const open = cal.open || { days: [1,2,3,4,5,6,0], start: "08:00", end: "18:00" };

  // onko päivä auki viikonpäivien puolesta?
  const d = new Date(date);
  const wd = d.getDay(); // 0=Su ... 6=La
  if (!open.days?.includes(wd)) return [];

  // *** PAKOTETTU AIKAVÄLI 06:00–23:00 ***
  const RANGE_MIN = 6 * 60;   // 06:00
  const RANGE_MAX = 23 * 60;  // 23:00

  // Jos haluat huomioida myös open.start/end ja silti rajata 06–23 väliin, käytä näitä kahta riviä yhtenä vaihtoehtona:
  // const openStart = parseHHMM(open.start || "00:00");
  // const openEnd   = parseHHMM(open.end   || "23:59");
  // const windowStart = Math.max(openStart, RANGE_MIN);
  // const windowEnd   = Math.min(openEnd,   RANGE_MAX);

  // Tässä pyydetty: täysin kiinteä 06:00–23:00
  const windowStart = RANGE_MIN;
  const windowEnd   = RANGE_MAX;

  if (windowEnd <= windowStart || !Number.isFinite(windowStart) || !Number.isFinite(windowEnd)) return [];

  // piilota menneet slotit tältä päivältä
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const out = [];
  for (let t = windowStart; t + slotMinutes <= windowEnd; t += slotMinutes) {
    if (isToday && t <= nowMinutes) continue;
    out.push({ s: fmtMinutes(t), e: fmtMinutes(t + slotMinutes) });
  }
  return out;
}, [cal, date]);

  // Slotin valinta täyttää start/end
  const pickSlot = (idx) => {
    setPickedIdx(idx);
    setStart(slots[idx].s);
    setEnd(slots[idx].e);
    setMsg(""); // nollaa mahdollinen virhe
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!forename.trim() || !surname.trim()) {
      setMsg("Anna etunimi ja sukunimi");
      return;
    }
    if (!date || !start || !end) {
      setMsg("Valitse päivä ja kellonaika listasta");
      return;
    }
    try {
      setSubmitting(true);
      const r = await publicBook(slug, {
        forename: forename.trim(),
        surname: surname.trim(),
        date,
        start,
        end,
        email: email || undefined,
      });
      const pin = r?.booking?.accessCode;
      setMsg(pin ? `Varaus OK. PIN: ${pin}` : "Varaus OK.");
      // Tyhjennä valinta halutessasi:
      // setPickedIdx(-1); setStart(""); setEnd("");
    } catch (e) {
      setMsg(e?.message || "Varaus epäonnistui");
    } finally {
      setSubmitting(false);
    }
  };

  if (!cal) return <div style={{ padding: 24 }}>{msg || "Ladataan…"}</div>;

  const dayOpen = slots.length > 0; // jos tyhjä -> ei auki tai kaikki menneet tältä päivältä

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold">{cal.title || "Kalenteri"}</h2>
        {cal.doorName && <p className="mt-1 text-gray-600">Ovi: {cal.doorName}</p>}
      </div>

      <form onSubmit={submit} className="grid gap-4">
        {/* Nimet */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="form-control">
            <span className="label-text">Etunimi</span>
            <input
              type="text"
              value={forename}
              onChange={(e) => setForename(e.target.value)}
              className="input input-bordered"
              required
            />
          </label>
          <label className="form-control">
            <span className="label-text">Sukunimi</span>
            <input
              type="text"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              className="input input-bordered"
              required
            />
          </label>
        </div>

        {/* Päivä */}
        <label className="form-control grid">

          <div className="label">

            <span className="label-text">Päivä</span>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPickedIdx(-1); setStart(""); setEnd(""); }}
            className="input input-bordered"
            required
          />
        </label>

        {/* Tunnit/slottirivit */}
        <div>
          <div className="mb-2 text-sm font-medium text-gray-700">Valitse kellonaika</div>

          {!dayOpen ? (
            <p className="text-gray-600">
              Ei varattavia aikoja tälle päivälle (suljettu tai kaikki menneet).
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {slots.map((slot, idx) => {
                const active = pickedIdx === idx;
                return (
                  <li key={`${slot.s}-${slot.e}`}>
                    <button
                      type="button"
                      className={`btn btn-sm w-full ${active ? "btn-primary" : ""}`}
                      onClick={() => pickSlot(idx)}
                    >
                      {slot.s}–{slot.e}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Sähköposti */}
        <label className="form-control">
          <span className="label-text">Sähköposti</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered"
            placeholder="PIN lähetetään tähän (tulostetaan myös näytölle)"
          />
        </label>

        {/* Piilotetaan start/end, mutta lähetetään ne mukaan */}
        <input type="hidden" name="start" value={start} />
        <input type="hidden" name="end" value={end} />

        <button
          type="submit"
          disabled={submitting || !date || !start || !end}
          className="mt-1 inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
        >
          {submitting ? "Varataan…" : "Varaa aika"}
        </button>
      </form>

      {msg && (
        <p className={`mt-3 ${msg.startsWith("Varaus OK") ? "text-emerald-600" : "text-rose-600"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
