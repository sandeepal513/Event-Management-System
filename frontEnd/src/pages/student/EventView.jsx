import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiClock, FiMapPin, FiUsers } from "react-icons/fi";

export default function EventView() {
	const [events, setEvents] = useState([]);
	const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
	const [keyword, setKeyword] = useState("");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		const loadEventData = async () => {
			try {
				const username = localStorage.getItem("username");
				if (!username) {
					toast.error("Please login again");
					return;
				}

				const userResponse = await axios.get(`http://localhost:3000/api/v1/users/username/${username}`);
				const userId = userResponse?.data?.data?.id;

				if (!userId) {
					toast.error("Unable to find current user");
					return;
				}

				const [eventsResponse, registrationsResponse] = await Promise.all([
					axios.get("http://localhost:3000/api/event-approvals/approve"),
					axios.get(`http://localhost:3000/api/registration/user/${userId}`),
				]);

				if (!mounted) return;

				const approvals = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
				const fetchedEvents = approvals
					.map((approval) => approval?.event)
					.filter((event, index, allEvents) => event?.id && allEvents.findIndex((item) => item?.id === event.id) === index);
				const registrations = Array.isArray(registrationsResponse.data) ? registrationsResponse.data : [];
				setEvents(fetchedEvents);
				setRegisteredEventIds(new Set(registrations.map((registration) => registration.event?.id).filter(Boolean)));
			} catch (error) {
				console.error("Error loading event view:", error);
				toast.error("Unable to load events");
			} finally {
				if (mounted) {
					setLoading(false);
				}
			}
		};

		loadEventData();

		return () => {
			mounted = false;
		};
	}, []);

	const filteredEvents = useMemo(() => {
		const normalizedKeyword = keyword.trim().toLowerCase();
		if (!normalizedKeyword) return events;

		return events.filter((event) => {
			const title = event.title?.toLowerCase() || "";
			const venue = event.venue?.name?.toLowerCase() || "";
			const society = event.society?.name?.toLowerCase() || "";
			return title.includes(normalizedKeyword) || venue.includes(normalizedKeyword) || society.includes(normalizedKeyword);
		});
	}, [events, keyword]);

	if (loading) {
		return <div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">Loading events...</div>;
	}

	return (
		<div className="space-y-5">
			<div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-5">
				<h2 className="mt-2 text-3xl font-semibold md:text-4xl text-white">Events</h2>
				<p className="mt-3 text-sm leading-6 text-white/60 md:text-base">
                    Click an event card to open the details page.
                </p>
				<input
					type="text"
					value={keyword}
					onChange={(event) => setKeyword(event.target.value)}
					placeholder="Search by title, venue, or society"
					className="mt-4 w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-400/50"
				/>
			</div>

			{filteredEvents.length === 0 ? (
				<div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">No events found.</div>
			) : (
				<div className="flex flex-wrap gap-4">
					{filteredEvents.map((event) => {
						const isRegistered = registeredEventIds.has(event.id);

						return (
							<Link
								key={event.id}
								to={`/student/events/${event.id}`}
								state={{ event, isRegistered }}
								className="group relative w-full max-w-[280px] overflow-hidden rounded-xl border border-white/10 bg-[#1f1f1d] px-4 py-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-sky-400/50"
							>
								<div className="h-[3px] w-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />

								<div className="mt-3 flex items-start justify-between gap-3">
									<div>
										<h3 className="text-xl font-semibold leading-tight text-white">{event.title}</h3>
										<p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/45">Student view</p>
										<p className="mt-2 inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70">
											{event.ticketRequired ? `${event.ticketsCount ?? 0} tickets left` : "No ticket needed"}
										</p>
									</div>
									{isRegistered && (
										<span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
											Registered
										</span>
									)}
								</div>

								<div className="mt-3 space-y-1.5 text-sm text-white/75">
									<p className="flex items-center gap-2">
										<FiCalendar className="text-sky-400" />
										{event.date || "N/A"}
									</p>
									<p className="flex items-center gap-2">
										<FiClock className="text-amber-400" />
										{event.time || "N/A"}
									</p>
									<p className="flex items-center gap-2">
										<FiMapPin className="text-pink-400" />
										{event.venue?.name || "N/A"}
									</p>
									<p className="flex items-center gap-2">
										<FiUsers className="text-violet-400" />
										{event.society?.name || "N/A"}
									</p>
								</div>

								<div className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between text-xs text-white/45">
									<span>Open details</span>
									<FiArrowRight className="text-base text-sky-300 transition group-hover:translate-x-0.5" />
								</div>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
