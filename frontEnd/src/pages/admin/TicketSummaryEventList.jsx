import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { FiArrowLeft, FiCalendar, FiClock, FiMapPin } from "react-icons/fi";

export default function TicketSummaryEventList() {
	const { eventId } = useParams();
	const [events, setEvents] = useState([]);
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				const [eventsRes, ticketsRes] = await Promise.all([
					axios.get("http://localhost:3000/api/events/all"),
					axios.get("http://localhost:3000/api/tickets"),
				]);

				if (!mounted) return;
				setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
				setTickets(Array.isArray(ticketsRes.data) ? ticketsRes.data : []);
			} catch (requestError) {
				console.error("Error loading event ticket list:", requestError);
				if (mounted) setError("Unable to load ticket list right now.");
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	const selectedEvent = useMemo(
		() => events.find((event) => String(event.id) === String(eventId)) || null,
		[events, eventId]
	);

	const eventTickets = useMemo(() => {
		return tickets.filter((ticket) => String(ticket?.registration?.event?.id) === String(eventId));
	}, [tickets, eventId]);

	if (loading) {
		return <div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">Loading event tickets...</div>;
	}

	return (
		<div className="space-y-5 text-white">
			<div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.24)]">
				<Link to="/admin/tickets/summary" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white">
					<FiArrowLeft /> Back to Summary
				</Link>

				<h2 className="mt-4 text-2xl font-semibold text-white">{selectedEvent?.title || "Event"} Ticket List</h2>
				<p className="mt-2 text-sm text-white/60">Showing all tickets for this event.</p>

				<div className="mt-4 grid gap-2 md:grid-cols-3">
					<div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2.5">
						<p className="text-[11px] tracking-[0.2em] text-emerald-200/70">AVAILABLE</p>
						<p className="mt-1 text-xl font-semibold text-emerald-200">{selectedEvent?.ticketsCount ?? 0}</p>
					</div>
					<div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
						<p className="text-[11px] tracking-[0.2em] text-white/45">DATE</p>
						<p className="mt-1 inline-flex items-center gap-1 text-sm text-white"><FiCalendar /> {selectedEvent?.date || "N/A"}</p>
					</div>
					<div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
						<p className="text-[11px] tracking-[0.2em] text-white/45">TIME</p>
						<p className="mt-1 inline-flex items-center gap-1 text-sm text-white"><FiClock /> {selectedEvent?.time || "N/A"}</p>
					</div>
				</div>
			</div>

			{error && <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

			{selectedEvent?.venue?.name && (
				<p className="inline-flex items-center gap-2 text-sm text-white/70"><FiMapPin className="text-pink-300" /> {selectedEvent.venue.name}</p>
			)}

			<div className="overflow-x-auto rounded-xl border border-white/10 bg-[#1b1b19]">
				<table className="min-w-full text-left text-sm text-white/80">
					<thead className="bg-white/5 text-xs uppercase tracking-[0.12em] text-white/50">
						<tr>
							<th className="px-4 py-3">Ticket ID</th>
							<th className="px-4 py-3">Ticket Number</th>
							<th className="px-4 py-3">Student</th>
							<th className="px-4 py-3">Email</th>
							<th className="px-4 py-3">Status</th>
						</tr>
					</thead>
					<tbody>
						{eventTickets.length === 0 ? (
							<tr>
								<td className="px-4 py-4 text-white/60" colSpan={5}>No tickets found for this event.</td>
							</tr>
						) : (
							eventTickets.map((ticket) => (
								<tr key={ticket.ticketId} className="border-t border-white/10">
									<td className="px-4 py-3">{ticket.ticketId}</td>
									<td className="px-4 py-3">{ticket.ticketNumber || "N/A"}</td>
									<td className="px-4 py-3">{ticket.registration?.user?.name || "N/A"}</td>
									<td className="px-4 py-3">{ticket.registration?.user?.email || "N/A"}</td>
									<td className="px-4 py-3">{ticket.status || "ACTIVE"}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
