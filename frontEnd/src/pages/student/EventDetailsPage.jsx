import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function EventDetailsPage() {
	const { eventId } = useParams();
	const { state } = useLocation();

	const [event, setEvent] = useState(state?.event || null);
	const [currentUserId, setCurrentUserId] = useState(null);
	const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
	const [loading, setLoading] = useState(true);
	const [registering, setRegistering] = useState(false);

	useEffect(() => {
		let mounted = true;

		const loadData = async () => {
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
					axios.get("http://localhost:3000/api/registration/all"),
					axios.get(`http://localhost:3000/api/registration/user/${userId}`),
				]);

				if (!mounted) return;

				const events = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];
				const matchedEvent = events.find((item) => String(item.id) === String(eventId)) || state?.event || null;
				const registrations = Array.isArray(registrationsResponse.data) ? registrationsResponse.data : [];

				setCurrentUserId(userId);
				setEvent(matchedEvent);
				setRegisteredEventIds(new Set(registrations.map((registration) => registration.event?.id).filter(Boolean)));
			} catch (error) {
				console.error("Error loading event details:", error);
				toast.error("Unable to load event details");
			} finally {
				if (mounted) setLoading(false);
			}
		};

		loadData();

		return () => {
			mounted = false;
		};
	}, [eventId, state]);

	const isRegistered = event ? registeredEventIds.has(event.id) : false;
	const canRegister = event ? (event.ticketRequired && Number(event.ticketsCount ?? 0) > 0) : false;

	async function handleRegister() {
		if (!event || !currentUserId) return;

		try {
			setRegistering(true);
			await axios.post("http://localhost:3000/api/registration", {
				userId: currentUserId,
				eventId: event.id,
			});

			setRegisteredEventIds((current) => new Set([...current, event.id]));
			toast.success("Registered successfully");
		} catch (error) {
			console.error("Error registering event:", error);
			toast.error("Registration failed");
		} finally {
			setRegistering(false);
		}
	}

	if (loading) {
		return <div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">Loading event details...</div>;
	}

	if (!event) {
		return (
			<div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">
				<p>Event not found.</p>
				<Link to="/student/events" className="mt-4 inline-block rounded-lg bg-sky-600 px-4 py-2 text-sm text-white hover:bg-sky-500">
					Back to Events
				</Link>
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 shadow-[0_12px_28px_rgba(0,0,0,0.25)]">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<h2 className="text-2xl font-semibold text-white">{event.title}</h2>
				{isRegistered && (
					<span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
						Registered
					</span>
				)}
			</div>

			<p className="mt-3 text-sm leading-6 text-white/70">{event.description || "No description available."}</p>

			<div className="mt-4 grid grid-cols-1 gap-2 text-sm text-white/75 sm:grid-cols-2">
				<p>Date: {event.date || "N/A"}</p>
				<p>Time: {event.time || "N/A"}</p>
				<p>Venue: {event.venue?.name || "N/A"}</p>
				<p>Society: {event.society?.name || "N/A"}</p>
				<p>Tickets: {event.ticketRequired ? event.ticketsCount ?? 0 : "No Tickets Required"}</p>
			</div>

			<div className="mt-6 flex flex-wrap gap-3">
				{canRegister && (
					<button
						type="button"
						onClick={handleRegister}
						disabled={isRegistered || registering}
						className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{registering ? "Registering..." : isRegistered ? "Registered" : "Register"}
					</button>
				)}

				{!canRegister && (
					<p className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm text-amber-200">
						Registration not available for this event
					</p>
				)}

				<Link to="/student/events" className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white">
					Back to Events
				</Link>
			</div>
		</div>
	);
}
