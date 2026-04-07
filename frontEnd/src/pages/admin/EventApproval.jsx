import { useState, useEffect } from "react";

function EventApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState({});

  // Load all pending approvals
  useEffect(() => {
    fetch("http://localhost:3000/api/event-approvals/pending")
      .then(res => res.json())
      .then(data => {
        setApprovals(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading approvals:", err);
        setLoading(false);
      });
  }, []);

  // Admin approves event
  const handleApprove = async (id) => {
    try {
      await fetch(`http://localhost:3000/api/event-approvals/${id}/approve`, {
        method: "POST",
      });
      // Remove from list after approve
      setApprovals(prev => prev.filter(a => a.id !== id));
      alert("✅ Event Approved!");
    } catch (err) {
      alert("❌ Something went wrong!");
    }
  };

  // Admin rejects event
  const handleReject = async (id) => {
    const reason = rejectReason[id] || "";
    if (!reason) {
      alert("Please enter a reason for rejection!");
      return;
    }
    try {
      await fetch(`http://localhost:3000/api/event-approvals/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      // Remove from list after reject
      setApprovals(prev => prev.filter(a => a.id !== id));
      alert("❌ Event Rejected!");
    } catch (err) {
      alert("❌ Something went wrong!");
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-full bg-[#2e2e2c] p-4 md:p-6 text-white">
        <div className="rounded-xl border border-white/10 bg-[#1e1e1c] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
          <p className="text-sm text-white/60">Loading approvals...</p>
        </div>
      </div>
    );
  }

  if (approvals.length === 0) return (
    <div className="w-full min-h-full bg-[#2e2e2c] p-4 md:p-6 text-white">
      <div className="rounded-xl border border-white/10 bg-[#1e1e1c] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
        <h2 className="text-2xl font-semibold">Pending Event Approvals</h2>
        <p className="mt-2 text-sm text-white/60">No pending approvals right now.</p>
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-full bg-[#2e2e2c] p-4 md:p-6 text-white">
      <div className="mb-6 rounded-xl border border-white/10 bg-[#1e1e1c] px-5 py-4 shadow-[0_12px_28px_rgba(0,0,0,0.35)]">
        <h2 className="text-2xl font-semibold">Pending Event Approvals</h2>
        <p className="mt-1 text-sm text-white/60">{approvals.length} pending approval(s)</p>
      </div>

      <div className="space-y-4">
        {approvals.map((approval) => (
          <div
            key={approval.id}
            className="rounded-xl border border-white/10 bg-[#232320] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-semibold text-white">{approval.event.title}</h3>
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
                    ⏳ {approval.status}
                  </span>
                </div>

                <p className="text-sm text-white/70">{approval.event.description}</p>

                <div className="grid gap-2 text-sm text-white/80 sm:grid-cols-2 xl:grid-cols-3">
                  <p><span className="text-white/45">Date:</span> {approval.event.date}</p>
                  <p><span className="text-white/45">Venue:</span> {approval.event.venue.name}</p>
                  <p><span className="text-white/45">Organizer:</span> {approval.event.organizer.name}</p>
                  <p><span className="text-white/45">Category:</span> {approval.event.category.name}</p>
                  <p><span className="text-white/45">Society:</span> {approval.event.society.name}</p>
                </div>
              </div>

              <div className="w-full lg:max-w-sm">
                <label className="mb-2 block text-sm font-medium text-white/70">
                  Reason for rejection
                </label>
                <input
                  type="text"
                  placeholder="Required if rejecting"
                  value={rejectReason[approval.id] || ""}
                  onChange={(e) => setRejectReason((prev) => ({
                    ...prev,
                    [approval.id]: e.target.value,
                  }))}
                  className="w-full rounded-lg border border-white/10 bg-[#1b1b19] px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-sky-400/60"
                />

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(approval.id)}
                    className="rounded-lg bg-rose-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-500"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventApprovals;