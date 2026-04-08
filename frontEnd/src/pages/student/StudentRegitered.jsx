import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function formatDateTime(value) {
	if (!value) return "N/A";

	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return value;

	return parsed.toLocaleString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

export default function StudentRegitered() {
	const [registrations, setRegistrations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [keyword, setKeyword] = useState("");
	const [cancelingId, setCancelingId] = useState(null);

	useEffect(() => {
		let mounted = true;

		const loadRegistrations = async () => {
			try {
				const username = localStorage.getItem("username");
				if (!username) {
					toast.error("Please login again");
					return;
				}

				const userResponse = await axios.get(`http://localhost:3000/api/v1/users/username/${username}`);
				const userId = userResponse?.data?.data?.id;
				if (!userId) {
					toast.error("Unable to identify student account");
					return;
				}

				const response = await axios.get(`http://localhost:3000/api/registration/user/${userId}`);
				if (!mounted) return;

				setRegistrations(Array.isArray(response.data) ? response.data : []);
			} catch (error) {
				console.error("Error loading registered events:", error);
				toast.error("Unable to load registered events");
			} finally {
				if (mounted) setLoading(false);
			}
		};

		loadRegistrations();

		return () => {
			mounted = false;
		};
	}, []);

	const filteredRegistrations = useMemo(() => {
		const normalized = keyword.trim().toLowerCase();
		if (!normalized) return registrations;

		return registrations.filter((registration) => {
			const title = registration.event?.title?.toLowerCase() || "";
			const venue = registration.event?.venue?.name?.toLowerCase() || "";
			const society = registration.event?.society?.name?.toLowerCase() || "";
			const status = registration.status?.toLowerCase() || "";

			return (
				title.includes(normalized) ||
				venue.includes(normalized) ||
				society.includes(normalized) ||
				status.includes(normalized)
			);
		});
	}, [registrations, keyword]);

	async function handleCancelRegistration(registrationId) {
		try {
			setCancelingId(registrationId);
			await axios.delete(`http://localhost:3000/api/registration/${registrationId}`);
			setRegistrations((current) => current.filter((registration) => registration.id !== registrationId));
			toast.success("Registration canceled");
		} catch (error) {
			console.error("Error canceling registration:", error);
			toast.error("Unable to cancel registration");
		} finally {
			setCancelingId(null);
		}
	}

	if (loading) {
		return <div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">Loading registered events...</div>;
	}

	return (
		<div className="space-y-5">
			<div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-5">
				<h2 className="text-2xl font-semibold text-white">Registered Events</h2>
				<p className="mt-1 text-sm text-white/60">All events you have registered for.</p>
				<input
					type="text"
					value={keyword}
					onChange={(event) => setKeyword(event.target.value)}
					placeholder="Search by title, venue, society, or status"
					className="mt-4 w-full rounded-xl border border-white/10 bg-[#111110] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-400/50"
				/>
			</div>

			{filteredRegistrations.length === 0 ? (
				<div className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">No registered events found.</div>
			) : (
				<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
					{filteredRegistrations.map((registration) => {
						const isPending = registration.status === "PENDING";

						return (
							<div
								key={registration.id}
								className="rounded-2xl border border-white/10 bg-[#1c1c1a] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.25)]"
							>
								<div className="flex items-start justify-between gap-3">
									<h3 className="text-lg font-semibold text-white">{registration.event?.title || "Untitled Event"}</h3>
									<span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-200">
										{registration.status || "REGISTERED"}
									</span>
								</div>

								<p className="mt-2 text-sm text-white/65">{registration.event?.description || "No description available."}</p>

								<div className="mt-4 grid grid-cols-1 gap-2 text-sm text-white/70 sm:grid-cols-2">
									<p>Date: {registration.event?.date || "N/A"}</p>
									<p>Time: {registration.event?.time || "N/A"}</p>
									<p>Venue: {registration.event?.venue?.name || "N/A"}</p>
									<p>Society: {registration.event?.society?.name || "N/A"}</p>
									<p className="sm:col-span-2">Registered At: {formatDateTime(registration.register_at)}</p>
								</div>

								{isPending && (
									<button
										type="button"
										onClick={() => handleCancelRegistration(registration.id)}
										disabled={cancelingId === registration.id}
										className="mt-5 rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
									>
										{cancelingId === registration.id ? "Canceling..." : "Cancel Registration"}
									</button>
								)}

                                {registration.status === "CONFIRMED" && (
    <Link
        to={`/student/tickets/${registration.id}`}
        className="mt-5 inline-block rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
    >
        🎟️ View Ticket
    </Link>
)}

{registration.status === "REJECTED" && (
    <p className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-sm text-red-300">
        ❌ Registration was rejected
    </p>
)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
