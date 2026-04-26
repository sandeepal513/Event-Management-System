import { useEffect, useState } from "react";
import axios from "axios";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiRefreshCw, FiSearch } from "react-icons/fi";

export default function TicketEdit() {
	const { ticketId } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [ticket, setTicket] = useState(null);
	const [ticketNumber, setTicketNumber] = useState("");
	const [qrCode, setQrCode] = useState("");
	const [preview, setPreview] = useState("");
	const isCancelled = ticket?.status === "CANCELLED";

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				const response = await axios.get(`http://localhost:3000/api/tickets/${ticketId}`);
				if (!mounted) return;
				setTicket(response.data);
				setTicketNumber(response.data.ticketNumber || "");
				setQrCode(response.data.qrCode || response.data.ticketNumber || "");
			} catch (requestError) {
				console.error("Error loading ticket:", requestError);
				toast.error("Unable to load ticket");
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [ticketId]);

	const handlePreview = async () => {
		if (isCancelled) {
			toast.error("Cancelled tickets cannot be edited");
			return;
		}

		const value = qrCode.trim() || ticketNumber.trim();
		if (!value) {
			toast.error("Enter a ticket number first");
			return;
		}

		try {
			const dataUrl = await QRCode.toDataURL(value, { width: 180, margin: 1 });
			setPreview(dataUrl);
			toast.success("Preview updated");
		} catch (requestError) {
			toast.error("Unable to generate preview");
		}
	};

	const handleSave = async () => {
		if (isCancelled) {
			toast.error("Cancelled tickets cannot be edited");
			return;
		}

		if (!ticketNumber.trim()) {
			toast.error("Ticket number is required");
			return;
		}

		try {
			setSaving(true);
			await axios.put(`http://localhost:3000/api/tickets/${ticketId}`, {
				ticketNumber: ticketNumber.trim(),
				qrCode: qrCode.trim() || ticketNumber.trim(),
			});
			toast.success("Ticket updated successfully");
			navigate("/admin/tickets/manage");
		} catch (requestError) {
			toast.error(requestError.response?.data || "Unable to update ticket");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <div className="rounded-3xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">Loading ticket...</div>;
	}

	if (!ticket) {
		return <div className="rounded-3xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">Ticket not found.</div>;
	}

	if (isCancelled) {
		return (
			<div className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(244,63,94,0.12),transparent_40%),linear-gradient(180deg,#171716_0%,#0f0f0f_100%)] p-4 md:p-6">
				<div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-rose-400/20 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.36)]">
					<div className="border-b border-rose-400/10 bg-rose-400/5 px-6 py-6 md:px-8">
						<p className="text-[11px] uppercase tracking-[0.3em] text-rose-200/70">Ticket locked</p>
						<h1 className="mt-2 text-3xl font-bold text-white">Cancelled Ticket</h1>
						<p className="mt-3 text-sm leading-6 text-white/60">This ticket has been cancelled and can no longer be edited from the frontend or backend.</p>
					</div>
					<div className="space-y-4 px-6 py-6 md:px-8">
						<div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/75">
							<p>Ticket ID: <span className="font-semibold text-white">#{ticket.ticketId}</span></p>
							<p className="mt-2">Status: <span className="font-semibold text-rose-300">CANCELLED</span></p>
						</div>
						<div className="flex flex-wrap gap-3">
							<Link to="/admin/tickets/manage" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-white/90"><FiArrowLeft /> Back to ticket board</Link>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_35%),linear-gradient(180deg,#171716_0%,#0f0f0f_100%)] p-4 md:p-6">
			<div className="mx-auto max-w-5xl space-y-6">
				{/* Header */}
				<div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.36)]">
					<div className="relative border-b border-white/10 px-6 py-6 md:px-8">
						<div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),transparent_40%,rgba(56,189,248,0.05))]" />
						<div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
							<div>
								<p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Admin / Tickets / Edit</p>
								<h1 className="mt-2 text-3xl font-bold md:text-4xl text-white">Edit Ticket</h1>
								<p className="mt-3 text-sm leading-6 text-white/60">Modify ticket details and regenerate the QR code to ensure seamless event entry.</p>
							</div>
							<Link to="/admin/tickets/manage" className="inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm font-medium text-sky-200 transition hover:bg-sky-400/20 hover:text-sky-100"><FiArrowLeft /> Ticket Board</Link>
						</div>
					</div>

					{/* Status bar */}
					<div className="flex items-center gap-4 border-t border-white/5 bg-white/[0.02] px-6 py-4 md:px-8">
						<div className="space-y-1.5">
							<p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Ticket ID</p>
							<p className="font-semibold text-white">#{ticket.ticketId}</p>
						</div>
						<div className="h-8 w-px bg-white/10" />
						<div className="space-y-1.5">
							<p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Status</p>
							<p className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${ticket.status === "ACTIVE" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}>
								{ticket.status || "ACTIVE"}
							</p>
						</div>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
					{/* Left: Form */}
					<div className="space-y-5">
						{/* Ticket Info Card */}
						<div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b19] shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
							<div className="h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" />
							<div className="p-6">
								<div>
									<label className="text-xs uppercase tracking-[0.2em] text-white/45">Ticket Number</label>
									<input 
										value={ticketNumber} 
										onChange={(event) => setTicketNumber(event.target.value)} 
										disabled={isCancelled}
										className="mt-2.5 w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20" 
										placeholder="e.g. TICKET-001"
									/>
									<p className="mt-2 text-[11px] text-white/50">Unique identifier for this ticket</p>
								</div>

								<div className="mt-5">
									<label className="text-xs uppercase tracking-[0.2em] text-white/45">QR Code Payload</label>
									<input 
										value={qrCode} 
										onChange={(event) => setQrCode(event.target.value)} 
										disabled={isCancelled}
										placeholder={ticketNumber || "Ticket number will be used"} 
										className="mt-2.5 w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-4 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
									/>
									<p className="mt-2 text-[11px] text-white/50">Data encoded in the QR code (defaults to ticket number)</p>
								</div>

								<div className="mt-6 flex flex-wrap gap-3">
									<button 
										type="button" 
										onClick={handlePreview} 
										disabled={isCancelled}
										className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white hover:border-white/25"
									>
										<FiRefreshCw className="text-base" /> Refresh Preview
									</button>
									<button 
										type="button" 
										onClick={handleSave} 
										disabled={saving || isCancelled} 
										className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:from-emerald-500 hover:to-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:from-emerald-600 disabled:to-emerald-600"
									>
										<FiCheckCircle className="text-base" /> {saving ? "Saving..." : "Save Changes"}
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Right: Preview */}
					<div className="space-y-5">
						{/* Event Info */}
						<div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b19] shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
							<div className="h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400" />
							<div className="p-6 space-y-4">
								<div>
									<p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Event</p>
									<p className="mt-1.5 text-lg font-semibold text-white">{ticket.registration?.event?.title || "N/A"}</p>
								</div>
								<div className="h-px bg-white/10" />
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Student</p>
										<p className="mt-1.5 text-sm font-medium text-white">{ticket.registration?.user?.name || "N/A"}</p>
										<p className="mt-1 text-xs text-white/55">{ticket.registration?.user?.email || "N/A"}</p>
									</div>
									<div>
										<p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Venue</p>
										<p className="mt-1.5 text-sm font-medium text-white">{ticket.registration?.event?.venue?.name || "N/A"}</p>
										<p className="mt-1 text-xs text-white/55">{ticket.registration?.event?.date || "N/A"}</p>
									</div>
								</div>
							</div>
						</div>

						{/* QR Preview */}
						<div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b19] shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
							<div className="h-1 bg-gradient-to-r from-pink-400 via-rose-400 to-red-400" />
							<div className="p-6">
								<p className="text-[11px] uppercase tracking-[0.2em] text-white/45">QR Code Preview</p>
								<div className="mt-4 flex items-center justify-center rounded-xl border border-dashed border-white/15 bg-gradient-to-b from-white/5 to-transparent p-6 min-h-[240px]">
									{preview ? (
										<div className="flex flex-col items-center gap-3">
											<img src={preview} alt="QR preview" className="h-40 w-40 rounded-lg border border-white/10 bg-white p-1.5 shadow-lg" />
											<p className="text-xs text-white/50 text-center">QR code ready for scanning</p>
										</div>
									) : (
										<div className="text-center">
											<p className="text-sm text-white/45">Click "Refresh Preview" to generate QR code</p>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
