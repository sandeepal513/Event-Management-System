import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiClock } from "react-icons/fi";

function isUpcomingEvent(dateValue) {
	if (!dateValue) return false;
	const eventDate = new Date(`${dateValue}T00:00:00`);
	if (Number.isNaN(eventDate.getTime())) return false;

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	return eventDate >= today;
}

function EventSummaryCard({ event }) {
	return (
		<Link
			to={`/admin/tickets/summary/${event.id}`}
			className="block w-full rounded-2xl border border-white/10 bg-[#1b1b19] p-4 text-left shadow-[0_12px_30px_rgba(0,0,0,0.24)] transition hover:border-sky-400/40 hover:bg-sky-500/10"
		>
			<div className="flex items-start justify-between gap-3">
				<div>
					<p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Event</p>
					<h3 className="mt-1 text-lg font-semibold text-white">{event.title || "N/A"}</h3>
				</div>
				<div className="text-right">
					<span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-200">
						Available {event.ticketsCount ?? 0}
					</span>
					<p className="mt-2 inline-flex items-center gap-1 text-xs text-sky-300">View tickets <FiArrowRight /></p>
				</div>
			</div>

			<div className="mt-3 grid gap-2 sm:grid-cols-2">
				<p className="inline-flex items-center gap-2 text-xs text-white/70">
					<FiCalendar className="text-sky-400" /> {event.date || "N/A"}
				</p>
				<p className="inline-flex items-center gap-2 text-xs text-white/70">
					<FiClock className="text-amber-400" /> {event.time || "N/A"}
				</p>
			</div>

			<div className="mt-3 grid grid-cols-3 gap-2 text-xs">
				<div className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
					<p className="text-[10px] tracking-[0.2em] text-white/45">CREATED</p>
					<p className="mt-1 text-sm font-semibold text-white">{event.createdTickets}</p>
				</div>
				<div className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-2">
					<p className="text-[10px] tracking-[0.2em] text-emerald-200/75">ACTIVE</p>
					<p className="mt-1 text-sm font-semibold text-emerald-200">{event.activeTickets}</p>
				</div>
				<div className="rounded-lg border border-rose-400/20 bg-rose-400/10 px-2.5 py-2">
					<p className="text-[10px] tracking-[0.2em] text-rose-200/75">CANCELLED</p>
					<p className="mt-1 text-sm font-semibold text-rose-200">{event.cancelledTickets}</p>
				</div>
			</div>
		</Link>
	);
}

export default function TicketSummary() {
	const [events, setEvents] = useState([]);
	const [tickets, setTickets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				const [eventRes, ticketRes] = await Promise.all([
					axios.get("http://localhost:3000/api/events/all"),
					axios.get("http://localhost:3000/api/tickets"),
				]);

				if (!mounted) return;

				setEvents(Array.isArray(eventRes.data) ? eventRes.data : []);
				setTickets(Array.isArray(ticketRes.data) ? ticketRes.data : []);
			} catch (requestError) {
				console.error("Error loading ticket summary:", requestError);
				if (mounted) setError("Unable to load ticket summary right now.");
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, []);

	const eventStats = useMemo(() => {
		const ticketsByEventId = new Map();

		for (const ticket of tickets) {
			const eventId = ticket?.registration?.event?.id;
			if (!eventId) continue;

			if (!ticketsByEventId.has(eventId)) {
				ticketsByEventId.set(eventId, []);
			}
			ticketsByEventId.get(eventId).push(ticket);
		}

		return events.map((event) => {
			const eventTickets = ticketsByEventId.get(event.id) || [];
			const active = eventTickets.filter((ticket) => (ticket.status || "ACTIVE") !== "CANCELLED").length;
			const cancelled = eventTickets.filter((ticket) => ticket.status === "CANCELLED").length;

			return {
				...event,
				createdTickets: eventTickets.length,
				activeTickets: active,
				cancelledTickets: cancelled,
			};
		});
	}, [events, tickets]);

	const upcomingEvents = useMemo(
		() => eventStats.filter((event) => isUpcomingEvent(event.date)).sort((a, b) => String(a.date).localeCompare(String(b.date))),
		[eventStats]
	);

	const outdatedEvents = useMemo(
		() => eventStats.filter((event) => !isUpcomingEvent(event.date)).sort((a, b) => String(b.date).localeCompare(String(a.date))),
		[eventStats]
	);

	if (loading) {
		return <div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">Loading ticket summary...</div>;
	}

	return (
		<div className="space-y-5 text-white">
			<div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-5 shadow-[0_14px_36px_rgba(0,0,0,0.24)]">
				<p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Admin dashboard</p>
				<h2 className="mt-2 text-2xl font-semibold">Ticket Summary</h2>
				<p className="mt-2 text-sm text-white/60">Upcoming and outdated events are separated below with available tickets for each event.</p>
			</div>

			{error && <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

			<div className="grid gap-5 lg:grid-cols-2">
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<FiCalendar className="text-emerald-300" />
						<h3 className="text-lg font-semibold">Upcoming Events</h3>
					</div>
					{upcomingEvents.length === 0 ? (
						<div className="rounded-2xl border border-white/10 bg-[#1b1b19] p-5 text-sm text-white/60">No upcoming events found.</div>
					) : (
						<div className="space-y-3">
							{upcomingEvents.map((event) => (
								<EventSummaryCard key={event.id} event={event} />
							))}
						</div>
					)}
				</div>

				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<FiCalendar className="text-rose-300" />
						<h3 className="text-lg font-semibold">Outdated Events</h3>
					</div>
					{outdatedEvents.length === 0 ? (
						<div className="rounded-2xl border border-white/10 bg-[#1b1b19] p-5 text-sm text-white/60">No outdated events found.</div>
					) : (
						<div className="space-y-3">
							{outdatedEvents.map((event) => (
								<EventSummaryCard key={event.id} event={event} />
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
