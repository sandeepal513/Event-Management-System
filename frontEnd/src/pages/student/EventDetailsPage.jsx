import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiCalendar, FiClock, FiFileText, FiMapPin, FiUsers } from "react-icons/fi";
import { MdConfirmationNumber } from "react-icons/md";

export default function EventDetailsPage() {
	const { eventId } = useParams();
	const { state } = useLocation();
	const navigate = useNavigate();
	const backLink = state?.fromUrl || "/search";
	const backLabel = state?.fromLabel || "Back";

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
					axios.get("http://localhost:3000/api/events/all"),
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
	const ticketsLabel = event?.ticketRequired ? `${event.ticketsCount ?? 0} available` : "No ticket needed";

	useEffect(() => {
		if (!event && !loading) {
			navigate(backLink, { replace: true });
		}
	}, [event, loading, navigate, backLink]);

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
		return (
			<div className="min-h-full bg-[#151514] p-4 text-white md:p-6">
				<div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#1c1c1a] p-6">
					<p className="text-white/70">Loading event details...</p>
				</div>
			</div>
		);
	}

	if (!event) {
		return (
			<div className="min-h-full bg-[#151514] p-4 text-white md:p-6">
				<div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#1c1c1a] p-6">
					<p className="text-white/70">Event not found.</p>
					<Link to={backLink} className="mt-4 inline-block rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white">
						{backLabel}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_38%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_36%),linear-gradient(180deg,#171716_0%,#101010_100%)] p-4 text-white md:p-6">
			<div className="mx-auto max-w-5xl space-y-5">
				<div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
					<div className="relative border-b border-white/10 px-5 py-5 md:px-7">
						<div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.05),transparent_35%,rgba(56,189,248,0.08))]" />
						<div className="relative flex flex-wrap items-start justify-between gap-4">
							<div>
								<p className="text-[11px] uppercase tracking-[0.3em] text-white/45">Student / Events / Details</p>
								<h1 className="mt-2 text-2xl font-semibold md:text-3xl">{event.title}</h1>
								<p className="mt-2 text-sm text-white/60">Review event info and register if tickets are available.</p>
							</div>

							<div className="flex items-center gap-2">
								<span className={`rounded-full border px-3 py-1 text-xs font-medium ${
									isRegistered
										? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
										: "border-white/20 bg-white/5 text-white/75"
								}`}>
									{isRegistered ? "Registered" : "Not Registered"}
								</span>
								<Link
									to={backLink}
									className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
								>
									{backLabel}
								</Link>
							</div>
						</div>
					</div>

					<div className="px-5 py-5 md:px-7 md:py-6">
						<div className="mb-5">
					{event.imageUrl ? (
						<img
							src={event.imageUrl}
							alt={event.title || "Event image"}
							className="h-44 w-full rounded-2xl border border-white/10 object-cover md:h-56"
						/>
					) : (
						<div className="flex h-44 w-full items-center justify-center rounded-2xl border border-dashed border-white/15 bg-[#232320] text-white/55 md:h-56">
							No event image available
						</div>
					)}
						</div>

						<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
							<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
								<p className="text-[11px] tracking-[0.22em] text-white/45">DATE</p>
								<p className="mt-2 flex items-center gap-2 text-sm text-white/85"><FiCalendar className="text-sky-400" />{event.date || "N/A"}</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
								<p className="text-[11px] tracking-[0.22em] text-white/45">TIME</p>
								<p className="mt-2 flex items-center gap-2 text-sm text-white/85"><FiClock className="text-amber-400" />{event.time || "N/A"}</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
								<p className="text-[11px] tracking-[0.22em] text-white/45">VENUE</p>
								<p className="mt-2 flex items-center gap-2 text-sm text-white/85"><FiMapPin className="text-pink-400" />{event.venue?.name || "N/A"}</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
								<p className="text-[11px] tracking-[0.22em] text-white/45">SOCIETY</p>
								<p className="mt-2 flex items-center gap-2 text-sm text-white/85"><FiUsers className="text-violet-400" />{event.society?.name || "N/A"}</p>
							</div>
							<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
								<p className="text-[11px] tracking-[0.22em] text-white/45">TICKETS</p>
								<p className="mt-2 flex items-center gap-2 text-sm text-white/85"><MdConfirmationNumber className="text-emerald-400" />{ticketsLabel}</p>
							</div>
						</div>

						<div className="mt-5 rounded-2xl border border-white/10 bg-[#232320] p-4 md:p-5">
							<p className="mb-2 flex items-center gap-2 text-white/75">
								<FiFileText className="text-cyan-400" /> Description
							</p>
							<p className="text-sm leading-6 text-white/85">{event.description || "No description available."}</p>
						</div>

						<div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<p className="text-sm text-white/65">Ready to join this event?</p>
								<div className="flex flex-wrap gap-3">
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

									<Link to={backLink} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white">
										{backLabel}
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
