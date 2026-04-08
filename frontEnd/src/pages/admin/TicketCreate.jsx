import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import QRCode from "qrcode";
import {QRCodeCanvas} from "qrcode.react";

export default function TicketCreate() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketInputs, setTicketInputs] = useState({});
  const [qrPreviews, setQrPreviews] = useState({});
  const [saving, setSaving] = useState(null);

  // Load all CONFIRMED registrations without tickets
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/registration"
        );
        if (!mounted) return;

        // Only show CONFIRMED registrations
        const confirmed = response.data.filter(
    (reg) => reg.status === "CONFIRMED" 
    && reg.event?.ticketRequired === true
);
        setRegistrations(confirmed);
      } catch (error) {
        console.error("Error loading registrations:", error);
        toast.error("Unable to load registrations");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => { mounted = false; };
  }, []);

  // Generate QR code preview
  const handleGenerateQR = async (registrationId) => {
    const ticketNumber = ticketInputs[registrationId];
    if (!ticketNumber) {
      toast.error("Please enter a ticket number first!");
      return;
    }

    try {
      const qrDataUrl = await QRCode.toDataURL(ticketNumber, { width: 150 });
      setQrPreviews((prev) => ({
        ...prev,
        [registrationId]: { dataUrl: qrDataUrl, value: ticketNumber }
      }));
      toast.success("QR Code generated!");
    } catch (error) {
      toast.error("Failed to generate QR code!");
    }
  };

  // Save ticket
  const handleSaveTicket = async (registrationId) => {
    const ticketNumber = ticketInputs[registrationId];
    const qrCode = qrPreviews[registrationId]?.value;

    if (!ticketNumber) {
      toast.error("Please enter a ticket number!");
      return;
    }
    if (!qrCode) {
      toast.error("Please generate QR code first!");
      return;
    }

    try {
      setSaving(registrationId);
      await axios.post("http://localhost:3000/api/tickets", {
        registrationId: String(registrationId),
        ticketNumber,
        qrCode
      });

      // Remove from list after ticket created
      setRegistrations((prev) =>
        prev.filter((reg) => reg.id !== registrationId)
      );
      toast.success("Ticket created successfully!");
    } catch (error) {
      toast.error(error.response?.data || "Failed to create ticket!");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-5">
        <h2 className="text-2xl font-semibold text-white">🎟️ Create Tickets</h2>
        <p className="mt-1 text-sm text-white/60">
          Create tickets for confirmed registrations.
        </p>
      </div>

      {/* No confirmed registrations */}
      {registrations.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">
          No confirmed registrations waiting for tickets!
        </div>
      )}

      {/* Confirmed registrations list */}
      {registrations.map((reg) => (
        <div
          key={reg.id}
          className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.25)]"
        >
          {/* Registration Info */}
          <h3 className="text-lg font-semibold text-white">
            {reg.event?.title || "N/A"}
          </h3>
          <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-white/70 sm:grid-cols-2">
            <p>Student  : {reg.user?.name || "N/A"}</p>
            <p>Email    : {reg.user?.email || "N/A"}</p>
            <p>Date     : {reg.event?.date || "N/A"}</p>
            <p>Venue    : {reg.event?.venue?.name || "N/A"}</p>
          </div>

          {/* Ticket Number Input */}
          <div className="mt-4">
            <label className="text-sm text-white/60">Ticket Number</label>
            <input
              type="text"
              placeholder="e.g. CONF-001"
              value={ticketInputs[reg.id] || ""}
              onChange={(e) =>
                setTicketInputs((prev) => ({
                  ...prev,
                  [reg.id]: e.target.value
                }))
              }
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-400/50"
            />
          </div>

          {/* Generate QR Button */}
          <button
            onClick={() => handleGenerateQR(reg.id)}
            className="mt-3 rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:text-white"
          >
            🔲 Generate QR Code
          </button>

          {/* QR Preview */}
          {qrPreviews[reg.id] && (
            <div className="mt-4">
              <p className="text-sm text-white/60 mb-2">QR Code Preview:</p>
              <img
                src={qrPreviews[reg.id].dataUrl}
                alt="QR Code"
                className="rounded-xl"
              />
            </div>
          )}

          {/* Save Ticket Button */}
          {qrPreviews[reg.id] && (
            <button
              onClick={() => handleSaveTicket(reg.id)}
              disabled={saving === reg.id}
              className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
            >
              {saving === reg.id ? "Saving..." : "💾 Save Ticket"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}