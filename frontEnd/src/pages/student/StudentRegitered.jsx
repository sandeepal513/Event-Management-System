import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiCalendar, FiClock, FiMapPin, FiSearch, FiTag, FiUsers } from "react-icons/fi";

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

function getStatusMeta(status) {
	if (status === "CONFIRMED") {
		return {
			label: "Confirmed",
			badgeClass: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
		};
	}

	if (status === "REJECTED") {
		return {
			label: "Rejected",
			badgeClass: "border-rose-400/25 bg-rose-400/10 text-rose-200",
		};
	}

	return {
		label: "Pending",
		badgeClass: "border-amber-400/25 bg-amber-400/10 text-amber-200",
	};
}

export default function StudentRegitered() {
	const [registrations, setRegistrations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [keyword, setKeyword] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
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
		return registrations.filter((registration) => {
			const title = registration.event?.title?.toLowerCase() || "";
			const venue = registration.event?.venue?.name?.toLowerCase() || "";
			const society = registration.event?.society?.name?.toLowerCase() || "";
			const status = registration.status?.toLowerCase() || "";
			const matchesSearch =
				!normalized ||
				title.includes(normalized) ||
				venue.includes(normalized) ||
				society.includes(normalized) ||
				status.includes(normalized);
			const matchesStatus = statusFilter === "ALL" || registration.status === statusFilter;

			return matchesSearch && matchesStatus;
		});
	}, [registrations, keyword, statusFilter]);

	const summary = useMemo(() => {
		return registrations.reduce(
			(accumulator, registration) => {
				accumulator.total += 1;
				if (registration.status === "PENDING") accumulator.pending += 1;
				if (registration.status === "CONFIRMED") accumulator.confirmed += 1;
				if (registration.status === "REJECTED") accumulator.rejected += 1;
				return accumulator;
			},
			{ total: 0, pending: 0, confirmed: 0, rejected: 0 }
		);
	}, [registrations]);

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
		return (
			<div className="min-h-full bg-[#151514] p-4 text-white md:p-6">
				<div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-[#1a1a18] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
					<p className="text-sm text-white/60">Loading registered events...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,_#171716_0%,_#101010_100%)] p-4 text-white md:p-6">
			<div className="mx-auto max-w-5xl space-y-4">
				<div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1c1c1a] shadow-[0_18px_46px_rgba(0,0,0,0.34)]">
					<div className="relative border-b border-white/10 px-5 py-5 md:px-6">
						<div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_38%,rgba(16,185,129,0.07))]" />
						<div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
							<div className="max-w-2xl">
								<p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Student dashboard</p>
								<h2 className="mt-2 text-2xl font-semibold md:text-3xl">Registered Events</h2>
								<p className="mt-2 text-sm leading-6 text-white/60">Track your registrations, manage pending ones, and open tickets when confirmed.</p>
							</div>
							<div className="flex flex-wrap gap-2">
								<span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/75">Total {summary.total}</span>
								<span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-200">Pending {summary.pending}</span>
								<span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-200">Confirmed {summary.confirmed}</span>
								<span className="rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-200">Rejected {summary.rejected}</span>
							</div>
						</div>
					</div>

					<div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
						<div className="flex flex-wrap gap-2">
							{["ALL", "PENDING", "CONFIRMED", "REJECTED"].map((status) => {
								const active = statusFilter === status;
								return (
									<button
										key={status}
										type="button"
										onClick={() => setStatusFilter(status)}
										className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
											active
												? "border-sky-400/35 bg-sky-400/10 text-sky-200"
												: "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"
										}`}
									>
										{status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
									</button>
								);
							})}
						</div>

						<label className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-[#111110] px-4 py-2.5 text-white/70 shadow-[0_10px_20px_rgba(0,0,0,0.20)] md:max-w-md">
							<FiSearch className="shrink-0" />
							<input
								type="text"
								value={keyword}
								onChange={(event) => setKeyword(event.target.value)}
								placeholder="Search by title, venue, society, or status"
								className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
							/>
						</label>
					</div>
				</div>

				{filteredRegistrations.length === 0 ? (
					<div className="rounded-3xl border border-white/10 bg-[#1b1b19] p-8 text-center shadow-[0_14px_30px_rgba(0,0,0,0.30)]">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
							<FiClock className="h-5 w-5" />
						</div>
						<h3 className="mt-3 text-lg font-semibold">No registrations found</h3>
						<p className="mt-2 text-sm text-white/60">Try a different search term.</p>
					</div>
				) : (
					<div className="space-y-3">
						{filteredRegistrations.map((registration) => {
							const isPending = registration.status === "PENDING";
							const statusMeta = getStatusMeta(registration.status);

							return (
								<div
									key={registration.id}
									className="rounded-2xl border border-white/10 bg-[#1b1b19] p-4 shadow-[0_10px_22px_rgba(0,0,0,0.24)] transition hover:border-white/15"
								>
									<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2.5">
												<h3 className="truncate text-base font-semibold text-white">{registration.event?.title || "Untitled Event"}</h3>
												<span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusMeta.badgeClass}`}>{statusMeta.label}</span>
											</div>
											<div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/65">
												<p className="inline-flex items-center gap-1.5"><FiMapPin className="text-pink-400" />{registration.event?.venue?.name || "N/A"}</p>
												<p className="inline-flex items-center gap-1.5"><FiCalendar className="text-sky-400" />{registration.event?.date || "N/A"}</p>
												<p className="inline-flex items-center gap-1.5"><FiClock className="text-amber-400" />{registration.event?.time || "N/A"}</p>
												<p className="inline-flex items-center gap-1.5"><FiTag className="text-violet-400" />{registration.event?.society?.name || "N/A"}</p>
											</div>
											<p className="mt-2 text-xs text-white/50">Registration #{registration.id} • {formatDateTime(registration.register_at)}</p>
										</div>

										<div className="flex flex-wrap gap-2 md:justify-end">
											{isPending && (
												<button
													type="button"
													onClick={() => handleCancelRegistration(registration.id)}
													disabled={cancelingId === registration.id}
													className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
												>
													{cancelingId === registration.id ? "Canceling..." : "Cancel"}
												</button>
											)}

											{registration.status === "CONFIRMED" && (
												<Link
													to={`/student/tickets/${registration.id}`}
													className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-400"
												>
													View Ticket
												</Link>
											)}

											{registration.status === "REJECTED" && (
												<p className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 text-xs text-rose-200">Rejected</p>
											)}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
