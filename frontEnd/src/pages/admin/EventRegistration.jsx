import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiSearch, FiSlash, FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "REJECTED"];

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

function getStatusMeta(status) {
	if (status === "CONFIRMED") {
		return {
			label: "Approved",
			className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
		};
	}

	if (status === "REJECTED") {
		return {
			label: "Rejected",
			className: "border-rose-400/20 bg-rose-400/10 text-rose-300",
		};
	}

	return {
		label: "Pending",
		className: "border-amber-400/20 bg-amber-400/10 text-amber-300",
	};
}

export default function EventRegistration() {
	const [registrations, setRegistrations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState("PENDING");
	const [query, setQuery] = useState("");
	const [processingId, setProcessingId] = useState(null);

	useEffect(() => {
		let isMounted = true;

		const loadRegistrations = async () => {
			try {
				const response = await fetch("http://localhost:3000/api/registration");
				if (!response.ok) {
					throw new Error(`Request failed with ${response.status}`);
				}

				const data = await response.json();
				if (!isMounted) return;

				setRegistrations(Array.isArray(data) ? data : []);
				setError("");
			} catch (requestError) {
				if (!isMounted) return;
				console.error("Error loading registrations:", requestError);
				setError("Unable to load registrations right now.");
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		loadRegistrations();

		return () => {
			isMounted = false;
		};
	}, []);

	const filteredRegistrations = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return registrations.filter((registration) => {
			const matchesFilter = filter === "ALL" || registration.status === filter;
			const studentName = registration.user?.name || registration.user?.email || "";
			const eventTitle = registration.event?.title || "";
			const matchesQuery =
				normalizedQuery.length === 0 ||
				studentName.toLowerCase().includes(normalizedQuery) ||
				eventTitle.toLowerCase().includes(normalizedQuery) ||
				String(registration.id).includes(normalizedQuery);

			return matchesFilter && matchesQuery;
		});
	}, [filter, query, registrations]);

	const summary = useMemo(() => {
		return registrations.reduce(
			(accumulator, registration) => {
				accumulator.total += 1;
				if (registration.status === "PENDING") accumulator.pending += 1;
				if (registration.status === "CONFIRMED") accumulator.approved += 1;
				if (registration.status === "REJECTED") accumulator.rejected += 1;
				return accumulator;
			},
			{ total: 0, pending: 0, approved: 0, rejected: 0 }
		);
	}, [registrations]);

	async function updateRegistrationStatus(id, nextStatus) {
		try {
			setProcessingId(id);

			const response = await fetch(`http://localhost:3000/api/registration/${id}/${nextStatus}`, {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error(`Request failed with ${response.status}`);
			}

			setRegistrations((current) =>
				current.map((registration) => {
					if (registration.id !== id) return registration;

					return {
						...registration,
						status: nextStatus === "approve" ? "CONFIRMED" : "REJECTED",
					};
				})
			);

			toast.success(nextStatus === "approve" ? "Registration approved" : "Registration rejected");
		} catch (requestError) {
			console.error("Error updating registration:", requestError);
			toast.error("Unable to update registration status");
		} finally {
			setProcessingId(null);
		}
	}

	if (loading) {
		return (
			<div className="min-h-full bg-[#151514] p-4 md:p-6 text-white">
				<div className="rounded-3xl border border-white/10 bg-[#1a1a18] p-8 shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
					<p className="text-sm text-white/60">Loading registrations...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,_#171716_0%,_#101010_100%)] p-4 text-white md:p-6">
			<div className="mx-auto max-w-7xl space-y-6">
				<div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
					<div className="relative border-b border-white/10 px-6 py-6 md:px-8">
						<div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_35%,rgba(59,130,246,0.06))]" />
						<div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
							<div className="max-w-2xl">
								<p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Admin dashboard</p>
								<h2 className="mt-2 text-3xl font-semibold md:text-4xl">Student Registrations</h2>
								<p className="mt-3 text-sm leading-6 text-white/60 md:text-base">
									Review every registration in one place, confirm eligible students, and reject submissions that do not meet the criteria.
								</p>
							</div>

							<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
								<div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
									<p className="text-[11px] tracking-[0.2em] text-white/45">TOTAL</p>
									<p className="mt-1 text-2xl font-semibold">{summary.total}</p>
								</div>
								<div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 backdrop-blur-sm">
									<p className="text-[11px] tracking-[0.2em] text-amber-200/70">PENDING</p>
									<p className="mt-1 text-2xl font-semibold text-amber-200">{summary.pending}</p>
								</div>
								<div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 backdrop-blur-sm">
									<p className="text-[11px] tracking-[0.2em] text-emerald-200/70">APPROVED</p>
									<p className="mt-1 text-2xl font-semibold text-emerald-200">{summary.approved}</p>
								</div>
								<div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 backdrop-blur-sm">
									<p className="text-[11px] tracking-[0.2em] text-rose-200/70">REJECTED</p>
									<p className="mt-1 text-2xl font-semibold text-rose-200">{summary.rejected}</p>
								</div>
							</div>
						</div>
					</div>

					<div className="px-6 py-5 md:px-8">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex flex-wrap gap-2">
								{FILTERS.map((status) => {
									const active = filter === status;
									return (
										<button
											key={status}
											type="button"
											onClick={() => setFilter(status)}
											className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
												active
													? "border-sky-400/40 bg-sky-400/10 text-sky-200"
													: "border-white/10 bg-white/5 text-white/65 hover:bg-white/10"
											}`}
										>
											{status}
										</button>
									);
								})}
							</div>

							<label className="flex w-full max-w-md items-center gap-3 rounded-2xl border border-white/10 bg-[#111110] px-4 py-3 text-white/70 shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
								<FiSearch className="shrink-0" />
								<input
									type="text"
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder="Search by student, event, or ID"
									className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
								/>
							</label>
						</div>
					</div>
				</div>

				{error && (
					<div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
						{error}
					</div>
				)}

				{filteredRegistrations.length === 0 ? (
					<div className="rounded-[1.75rem] border border-white/10 bg-[#1b1b19] p-8 text-center shadow-[0_18px_48px_rgba(0,0,0,0.32)]">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
							<FiClock className="h-6 w-6" />
						</div>
						<h3 className="mt-4 text-xl font-semibold">No registrations found</h3>
						<p className="mt-2 text-sm text-white/60">
							Try a different filter or search term to find the registration you want to review.
						</p>
					</div>
				) : (
					<div className="grid gap-4">
						{filteredRegistrations.map((registration) => {
							const statusMeta = getStatusMeta(registration.status);

							return (
								<div
									key={registration.id}
									className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#1b1b19] shadow-[0_18px_48px_rgba(0,0,0,0.30)] transition duration-300 hover:-translate-y-0.5 hover:border-white/15"
								>
									<div className="flex flex-col lg:flex-row">
										<div className="flex-1 p-5 md:p-6">
											<div className="flex flex-wrap items-start justify-between gap-4">
												<div>
													<div className="flex flex-wrap items-center gap-3">
														<h3 className="text-xl font-semibold text-white">
															{registration.event?.title || "Untitled Event"}
														</h3>
														<span className={`rounded-full border px-3 py-1 text-xs font-medium ${statusMeta.className}`}>
															{statusMeta.label}
														</span>
													</div>

													<p className="mt-2 text-sm text-white/65">
														Student <span className="font-medium text-white">{registration.user?.name || "Unknown student"}</span>
														{registration.user?.email ? ` · ${registration.user.email}` : ""}
													</p>
												</div>

												<div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">
													<FiUsers className="h-4 w-4" />
													Registration #{registration.id}
												</div>
											</div>

											<div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
												<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
													<p className="text-[11px] tracking-[0.2em] text-white/40">EVENT DATE</p>
													<p className="mt-2 text-sm text-white/80">{registration.event?.date || "N/A"}</p>
												</div>
												<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
													<p className="text-[11px] tracking-[0.2em] text-white/40">VENUE</p>
													<p className="mt-2 text-sm text-white/80">{registration.event?.venue?.name || "N/A"}</p>
												</div>
												<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
													<p className="text-[11px] tracking-[0.2em] text-white/40">REGISTERED</p>
													<p className="mt-2 text-sm text-white/80">{formatDateTime(registration.register_at)}</p>
												</div>
												<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
													<p className="text-[11px] tracking-[0.2em] text-white/40">SOCIETY</p>
													<p className="mt-2 text-sm text-white/80">{registration.event?.society?.name || "N/A"}</p>
												</div>
												<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
													<p className="text-[11px] tracking-[0.2em] text-white/40">STATUS</p>
													<p className="mt-2 text-sm text-white/80">{statusMeta.label}</p>
												</div>
												<div className="rounded-2xl border border-white/10 bg-white/5 p-4">
													<p className="text-[11px] tracking-[0.2em] text-white/40">EVENT ID</p>
													<p className="mt-2 text-sm text-white/80">{registration.event?.id || "N/A"}</p>
												</div>
											</div>
										</div>

										<div className="border-t border-white/10 bg-black/15 p-5 md:p-6 lg:w-[320px] lg:border-t-0 lg:border-l">
											<p className="text-sm font-medium text-white/80">Actions</p>
											<p className="mt-2 text-sm leading-6 text-white/55">
												Approve when the registration is valid, or reject it to keep the attendee list clean.
											</p>

											<div className="mt-5 flex flex-col gap-3">
												<button
													type="button"
													onClick={() => updateRegistrationStatus(registration.id, "approve")}
													disabled={registration.status !== "PENDING" || processingId === registration.id}
													className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
												>
													<FiCheckCircle />
													{processingId === registration.id && registration.status === "PENDING" ? "Updating..." : "Approve"}
												</button>

												<button
													type="button"
													onClick={() => updateRegistrationStatus(registration.id, "reject")}
													disabled={registration.status !== "PENDING" || processingId === registration.id}
													className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
												>
													<FiSlash />
													{processingId === registration.id && registration.status === "PENDING" ? "Updating..." : "Reject"}
												</button>
											</div>
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