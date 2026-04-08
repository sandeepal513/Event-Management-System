import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

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
					axios.get("http://localhost:3000/api/events/all"),
					axios.get(`http://localhost:3000/api/registration/user/${userId}`),
				]);

				if (!mounted) return;

				const fetchedEvents = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
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
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
					{filteredEvents.map((event) => {
						const isRegistered = registeredEventIds.has(event.id);

						return (
							<Link
								key={event.id}
								to={`/student/events/${event.id}`}
								state={{ event, isRegistered }}
								className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-5 text-left shadow-[0_12px_28px_rgba(0,0,0,0.25)] transition hover:border-white/20"
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<h3 className="text-lg font-semibold text-white">{event.title}</h3>
										<p className="mt-1 text-sm text-white/65">{event.date || "N/A"} {event.time ? `at ${event.time}` : ""}</p>
									</div>
									{isRegistered && (
										<span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
											Registered
										</span>
									)}
								</div>
								<p className="mt-2 text-sm text-white/70">Venue: {event.venue?.name || "N/A"}</p>
								<p className="text-sm text-white/70">Society: {event.society?.name || "N/A"}</p>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}
