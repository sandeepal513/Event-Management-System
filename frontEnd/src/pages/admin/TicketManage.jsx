import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiClock, FiEdit3, FiMapPin, FiSearch, FiSlash, FiUsers } from "react-icons/fi";

function isUpcomingEvent(dateValue) {
	if (!dateValue) return false;
	const eventDate = new Date(`${dateValue}T00:00:00`);
	if (Number.isNaN(eventDate.getTime())) return false;

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return eventDate >= today;
}

function formatDateTime(value) {
	if (!value) return "N/A";
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;
	return parsed.toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

function getTicketStatusMeta(status) {
	if (status === "CANCELLED") {
		return { label: "Cancelled", className: "border-rose-400/20 bg-rose-400/10 text-rose-300" };
	}
	return { label: "Active", className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" };
}

export default function TicketManage() {
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");
	const [filter, setFilter] = useState("ALL");

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				const response = await axios.get("http://localhost:3000/api/tickets");
				if (mounted) setTickets(Array.isArray(response.data) ? response.data : []);
			} catch (requestError) {
				console.error("Error loading tickets:", requestError);
				if (mounted) setError("Unable to load tickets right now.");
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	const upcomingTickets = useMemo(() => {
		return tickets.filter((ticket) => isUpcomingEvent(ticket.registration?.event?.date));
	}, [tickets]);

	const filteredTickets = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();
		return upcomingTickets.filter((ticket) => {
			const status = ticket.status || "ACTIVE";
			const matchesFilter = filter === "ALL" || status === filter;
			const matchesQuery =
				normalizedQuery.length === 0 ||
				(ticket.ticketNumber || "").toLowerCase().includes(normalizedQuery) ||
				(ticket.registration?.user?.name || "").toLowerCase().includes(normalizedQuery) ||
				(ticket.registration?.event?.title || "").toLowerCase().includes(normalizedQuery) ||
				String(ticket.ticketId).includes(normalizedQuery);

			return matchesFilter && matchesQuery;
		});
	}, [filter, query, upcomingTickets]);

	const summary = useMemo(() => {
		return upcomingTickets.reduce((counts, ticket) => {
			counts.total += 1;
			if ((ticket.status || "ACTIVE") === "ACTIVE") counts.active += 1;
			if (ticket.status === "CANCELLED") counts.cancelled += 1;
			return counts;
		}, { total: 0, active: 0, cancelled: 0 });
	}, [upcomingTickets]);

	if (loading) {
		return <div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-5 text-white/70">Loading tickets...</div>;
	}

	return (
		<div className="space-y-4">
			<div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1a] shadow-[0_14px_42px_rgba(0,0,0,0.28)]">
				<div className="border-b border-white/10 px-5 py-5 md:px-6">
					<div className="mb-4">
						<Link to="/admin/tickets/create" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white">
							<FiArrowLeft /> Back to Ticket Create
						</Link>
					</div>
					<div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
						<div className="max-w-2xl">
							<p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Admin dashboard</p>
							<h2 className="mt-2 text-2xl font-semibold md:text-3xl">Ticket Board</h2>
							<p className="mt-3 text-sm leading-6 text-white/60 md:text-base">Review created tickets, edit details, or move to the cancel confirmation flow.</p>
						</div>
						<div className="grid grid-cols-3 gap-2 sm:min-w-[380px]">
							<div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"><p className="text-[11px] tracking-[0.2em] text-white/45">TOTAL</p><p className="mt-1 text-xl font-semibold">{summary.total}</p></div>
							<div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5"><p className="text-[11px] tracking-[0.2em] text-emerald-200/70">ACTIVE</p><p className="mt-1 text-xl font-semibold text-emerald-200">{summary.active}</p></div>
							<div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2.5"><p className="text-[11px] tracking-[0.2em] text-rose-200/70">CANCELLED</p><p className="mt-1 text-xl font-semibold text-rose-200">{summary.cancelled}</p></div>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-3 px-5 py-4 md:px-6 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex flex-wrap gap-2">
						{["ALL", "ACTIVE", "CANCELLED"].map((status) => (
							<button key={status} type="button" onClick={() => setFilter(status)} className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${filter === status ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10"}`}>
								{status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
							</button>
						))}
					</div>

					<label className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#111110] px-4 py-2.5 text-white/70 lg:max-w-md">
						<FiSearch className="shrink-0" />
						<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by ticket, student, event, or ID" className="w-full bg-transparent text-xs text-white outline-none placeholder:text-white/35" />
					</label>
				</div>
			</div>

			{error && <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

			{filteredTickets.length === 0 ? (
				<div className="rounded-2xl border border-white/10 bg-[#1b1b19] p-7 text-center text-white/70 shadow-[0_14px_36px_rgba(0,0,0,0.26)]">
					<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5"><FiClock /></div>
					<p className="mt-3 text-lg font-semibold text-white">No tickets found</p>
					<p className="mt-2 text-sm text-white/60">Create a ticket to see it here.</p>
				</div>
			) : (
				<div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
					{filteredTickets.map((ticket) => {
						const statusMeta = getTicketStatusMeta(ticket.status);
						return (
							<div key={ticket.ticketId} className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b19] shadow-[0_12px_30px_rgba(0,0,0,0.24)]">
								<div className="h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400" />
								<div className="p-4 md:p-4.5">
									<div className="flex items-start justify-between gap-4">
										<div>
											<p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Ticket #{ticket.ticketId}</p>
											<h3 className="mt-1.5 text-lg font-semibold text-white">{ticket.ticketNumber}</h3>
											<p className="mt-1.5 text-xs text-white/60">{ticket.registration?.event?.title || "N/A"}</p>
										</div>
										<span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusMeta.className}`}>{statusMeta.label}</span>
									</div>

									<div className="mt-3 grid gap-2 sm:grid-cols-2">
										<div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white/75"><p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Student</p><p className="mt-1 font-medium text-white">{ticket.registration?.user?.name || "N/A"}</p><p className="mt-1 text-white/55">{ticket.registration?.user?.email || "N/A"}</p></div>
										<div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white/75"><p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Event details</p><p className="mt-1 flex items-center gap-2 font-medium text-white"><FiCalendar className="text-sky-400" />{ticket.registration?.event?.date || "N/A"}</p><p className="mt-1 flex items-center gap-2 text-white/55"><FiMapPin className="text-pink-400" />{ticket.registration?.event?.venue?.name || "N/A"}</p></div>
								</div>

								<div className="mt-3 flex flex-wrap gap-2">
									<Link to={`/admin/tickets/edit/${ticket.ticketId}`} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-500"><FiEdit3 /> Edit</Link>
									<Link to={`/admin/tickets/cancel/${ticket.ticketId}`} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${ticket.status === "CANCELLED" ? "pointer-events-none border-white/10 bg-white/5 text-white/35" : "border-white/15 text-white/80 hover:bg-white/5 hover:text-white"}`}><FiSlash /> {ticket.status === "CANCELLED" ? "Cancelled" : "Cancel"}</Link>
								</div>
								<p className="mt-3 text-[11px] text-white/45">Created {formatDateTime(ticket.createdAt)}</p>
							</div>
						</div>
					);
					})}
				</div>
			)}
		</div>
	);
}
