import React from "react";

export default function BookingSuccess({
  open,
  onClose,
  pin,
  email,
  whenText,
  title,
  doorName,
}) {
  if (!open) return null;

  const copyPin = async () => {
    if (!pin) return;
    try {
      await navigator.clipboard.writeText(pin);
      alert("PIN kopioitu leikepöydälle");
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">
          {title ? `Varaus: ${title}` : "Varaus vahvistettu"}
        </h2>

        <div className="mt-3 space-y-1 text-sm text-gray-700">
          <p><b>Aika:</b> {whenText}</p>
          {doorName ? <p><b>Ovi:</b> {doorName}</p> : null}
          <p>
            {pin ? (
              <>PIN: <span className="font-mono tracking-widest">{pin}</span></>
            ) : (
              "PIN on lähetetty sähköpostiisi."
            )}
          </p>
          <p className="text-gray-600">
            Vahvistus ja PIN on lähetetty osoitteeseen <b>{email}</b>.
          </p>
        </div>

        {pin && (
          <button
            onClick={copyPin}
            className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-black"
          >
            Kopioi PIN
          </button>
        )}

        <button
          onClick={onClose}
          className="mt-2 w-full rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          Sulje
        </button>
      </div>
    </div>
  );
}
