import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import QRCode from "qrcode";
import { FiArrowRight, FiCalendar, FiCheckCircle, FiMapPin, FiPlusCircle, FiSearch, FiUsers } from "react-icons/fi";

function RegistrationCard({ reg, ticketValue, qrPreview, isSaving, remainingTickets, onTicketChange, onGenerateQR, onSave }) {
	return (
		<div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b19] shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
			<div className="h-1 bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400" />
			<div className="p-4">
				<div className="flex items-center justify-between gap-3">
					<p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Registration #{reg.id}</p>
					<div className="flex items-center gap-2">
						<span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${remainingTickets > 0 ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border border-rose-400/20 bg-rose-400/10 text-rose-200"}`}>
							{remainingTickets > 0 ? `${remainingTickets} left` : "Sold out"}
						</span>
						<span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-200">
							<FiCheckCircle className="mr-1 inline-block" /> Confirmed
						</span>
					</div>
				</div>

				<h3 className="mt-2 text-lg font-semibold text-white">{reg.event?.title || "N/A"}</h3>

				<div className="mt-3 grid gap-2 text-xs text-white/75 sm:grid-cols-2">
					<div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
						<p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Student</p>
						<p className="mt-1 font-medium text-white">{reg.user?.name || "N/A"}</p>
						<p className="mt-1 text-white/55">{reg.user?.email || "N/A"}</p>
					</div>
					<div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
						<p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Event</p>
						<p className="mt-1 flex items-center gap-2 font-medium text-white"><FiCalendar className="text-sky-400" />{reg.event?.date || "N/A"}</p>
						<p className="mt-1 flex items-center gap-2 text-white/55"><FiMapPin className="text-pink-400" />{reg.event?.venue?.name || "N/A"}</p>
					</div>
				</div>

				<div className="mt-3 rounded-lg border border-white/10 bg-[#121211] p-3">
					<label className="text-xs text-white/60">Ticket Number</label>
					<input
						type="text"
						placeholder="e.g. CONF-001"
						value={ticketValue}
						onChange={(event) => onTicketChange(reg.id, event.target.value)}
						className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#0f0f0f] px-3 py-2 text-xs text-white outline-none placeholder:text-white/35 focus:border-sky-400/50"
					/>

					<div className="mt-2.5 flex flex-wrap gap-2">
						<button type="button" onClick={() => onGenerateQR(reg.id)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/10 hover:text-white">
							<FiPlusCircle /> Generate QR
						</button>
						<button
							type="button"
							onClick={() => onSave(reg.id)}
							disabled={isSaving || !qrPreview || remainingTickets <= 0}
							className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isSaving ? "Saving..." : remainingTickets <= 0 ? "Sold out" : "Save Ticket"}
						</button>
					</div>
				</div>

				{qrPreview && (
					<div className="mt-3 rounded-lg border border-white/10 bg-white/5 p-2.5">
						<p className="text-xs text-white/55">QR preview</p>
						<div className="mt-2 flex justify-center rounded-lg border border-white/10 bg-[#111110] p-2">
							<img src={qrPreview.dataUrl} alt="QR Code" className="h-20 w-20 rounded" />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function TicketCreate() {
	const navigate = useNavigate();
	const [registrations, setRegistrations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedEventId, setSelectedEventId] = useState("ALL");
	const [ticketInputs, setTicketInputs] = useState({});
	const [qrPreviews, setQrPreviews] = useState({});
	const [savingId, setSavingId] = useState(null);
	const [query, setQuery] = useState("");

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				const response = await axios.get("http://localhost:3000/api/registration");
				if (!mounted) return;

				const confirmed = response.data.filter((reg) => reg.status === "CONFIRMED" && reg.event?.ticketRequired);
				setRegistrations(confirmed);
			} catch (error) {
				console.error("Error loading registrations:", error);
				toast.error("Unable to load registrations");
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	const filteredRegistrations = useMemo(() => {
		const q = query.trim().toLowerCase();
		return registrations.filter((reg) => {
			const matchesEvent = selectedEventId === "ALL" || String(reg.event?.id) === selectedEventId;
			const student = reg.user?.name || reg.user?.email || "";
			const event = reg.event?.title || "";
			const venue = reg.event?.venue?.name || "";
			const matchesQuery = q.length === 0 || student.toLowerCase().includes(q) || event.toLowerCase().includes(q) || venue.toLowerCase().includes(q) || String(reg.id).includes(q);
			return matchesEvent && matchesQuery;
		});
	}, [query, registrations, selectedEventId]);

	const eventOptions = useMemo(() => {
		const uniqueEvents = new Map();
		registrations.forEach((reg) => {
			const event = reg.event;
			if (event?.id && !uniqueEvents.has(event.id)) {
				uniqueEvents.set(event.id, event);
			}
		});
		return Array.from(uniqueEvents.values()).sort((a, b) => (a.title || "").localeCompare(b.title || ""));
	}, [registrations]);

	const selectedEvent = useMemo(() => {
		if (selectedEventId === "ALL") return null;
		return eventOptions.find((event) => String(event.id) === selectedEventId) || null;
	}, [eventOptions, selectedEventId]);

	const handleTicketChange = (registrationId, value) => {
		setTicketInputs((prev) => ({ ...prev, [registrationId]: value }));
	};

	const handleGenerateQR = async (registrationId) => {
		const ticketNumber = ticketInputs[registrationId];
		if (!ticketNumber) {
			toast.error("Please enter a ticket number first");
			return;
		}

		try {
			const dataUrl = await QRCode.toDataURL(ticketNumber, { width: 180, margin: 1 });
			setQrPreviews((prev) => ({ ...prev, [registrationId]: { dataUrl, value: ticketNumber } }));
			toast.success("QR generated");
		} catch {
			toast.error("Failed to generate QR code");
		}
	};

	const handleSaveTicket = async (registrationId) => {
		const registration = registrations.find((reg) => reg.id === registrationId);
		const ticketNumber = ticketInputs[registrationId];
		const qrCode = qrPreviews[registrationId]?.value;
		const remainingTickets = registration?.event?.ticketsCount ?? 0;

		if (!ticketNumber) {
			toast.error("Please enter a ticket number");
			return;
		}
		if (remainingTickets <= 0) {
			toast.error("No tickets available for this event");
			return;
		}
		if (!qrCode) {
			toast.error("Please generate QR code first");
			return;
		}

		try {
			setSavingId(registrationId);
			await axios.post("http://localhost:3000/api/tickets", {
				registrationId: String(registrationId),
				ticketNumber,
				qrCode,
			});

			setRegistrations((prev) =>
				prev.map((reg) =>
					reg.event?.id === registration?.event?.id
						? {
							...reg,
							event: {
								...reg.event,
								ticketsCount: Math.max((reg.event?.ticketsCount ?? 0) - 1, 0),
							},
						}
						: reg
				)
			);
			setTicketInputs((prev) => {
				const next = { ...prev };
				delete next[registrationId];
				return next;
			});
			setQrPreviews((prev) => {
				const next = { ...prev };
				delete next[registrationId];
				return next;
			});

			toast.success("Ticket created successfully");
			navigate("/admin/tickets/manage");
		} catch (error) {
			toast.error(error.response?.data || "Failed to create ticket");
		} finally {
			setSavingId(null);
		}
	};

	if (loading) {
		return <div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">Loading tickets...</div>;
	}

	return (
		<div className="space-y-5">
			<div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.24)]">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Admin dashboard</p>
						<h2 className="mt-2 text-2xl font-semibold text-white">Create Tickets</h2>
						<p className="mt-2 text-sm text-white/60">Approve registration first, then create tickets here.</p>
					</div>
					<Link to="/admin/tickets/manage" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white">
						Ticket board <FiArrowRight />
					</Link>
				</div>

				<div className="mt-4">
					<div className="grid gap-3 md:grid-cols-2">
						<label className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#111110] px-4 py-3 text-white/70">
							<select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)} className="w-full bg-transparent text-sm text-white outline-none">
								<option value="ALL">All events</option>
								{eventOptions.map((event) => (
									<option key={event.id} value={event.id}>
										{event.title} {event.ticketsCount != null ? `(${event.ticketsCount} left)` : ""}
									</option>
								))}
							</select>
						</label>

						<label className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#111110] px-4 py-3 text-white/70">
							<FiSearch className="shrink-0" />
							<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search registrations" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35" />
						</label>
					</div>
					{selectedEvent && (
						<p className="mt-3 text-sm text-white/60">
							Selected event: <span className="font-medium text-white">{selectedEvent.title}</span> - {selectedEvent.ticketsCount ?? 0} tickets left
						</p>
					)}
				</div>
			</div>

			{filteredRegistrations.length === 0 ? (
				<div className="rounded-3xl border border-white/10 bg-[#1b1b19] p-8 text-center">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
						<FiUsers className="h-5 w-5" />
					</div>
					<h3 className="mt-3 text-lg font-semibold text-white">No confirmed registrations</h3>
					<p className="mt-2 text-sm text-white/60">Approved ticket-required registrations will appear here.</p>
				</div>
			) : (
				<div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
					{filteredRegistrations.map((reg) => (
						<RegistrationCard
							key={reg.id}
							reg={reg}
							ticketValue={ticketInputs[reg.id] || ""}
							qrPreview={qrPreviews[reg.id]}
							isSaving={savingId === reg.id}
							remainingTickets={reg.event?.ticketsCount ?? 0}
							onTicketChange={handleTicketChange}
							onGenerateQR={handleGenerateQR}
							onSave={handleSaveTicket}
						/>
					))}
				</div>
			)}
		</div>
	);
}
