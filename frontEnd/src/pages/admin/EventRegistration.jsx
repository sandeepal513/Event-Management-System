import { useEffect, useState } from "react";
import { FiCalendar, FiCheckCircle, FiClock, FiMapPin, FiSearch, FiSlash, FiUsers } from "react-icons/fi";
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
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [processingId, setProcessingId] = useState(null);
	const [summary, setSummary] = useState({ total: 0, pending: 0, confirmed: 0, rejected: 0 });

	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query.trim());
		}, 300);

		return () => clearTimeout(timer);
	}, [query]);

	useEffect(() => {
		let isMounted = true;

		const loadRegistrations = async () => {
			try {
				const params = new URLSearchParams();
				if (filter !== "ALL") params.set("status", filter);
				if (debouncedQuery) params.set("q", debouncedQuery);

				const url = params.toString()
					? `http://localhost:3000/api/registration?${params.toString()}`
					: "http://localhost:3000/api/registration";

				const response = await fetch(url);
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

		const loadSummary = async () => {
			try {
				const response = await fetch("http://localhost:3000/api/registration");
				if (!response.ok) return;

				const data = await response.json();
				if (!isMounted || !Array.isArray(data)) return;

				const nextSummary = data.reduce(
					(accumulator, registration) => {
						accumulator.total += 1;
						if (registration.status === "PENDING") accumulator.pending += 1;
						if (registration.status === "CONFIRMED") accumulator.confirmed += 1;
						if (registration.status === "REJECTED") accumulator.rejected += 1;
						return accumulator;
					},
					{ total: 0, pending: 0, confirmed: 0, rejected: 0 }
				);

				setSummary(nextSummary);
			} catch (summaryError) {
				console.error("Error loading registration summary:", summaryError);
			}
		};

		loadRegistrations();
		loadSummary();

		return () => {
			isMounted = false;
		};
	}, [filter, debouncedQuery]);

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
				current.map((registration) =>
					registration.id === id
						? {
							...registration,
							status: nextStatus === "approve" ? "CONFIRMED" : "REJECTED",
						}
						: registration
				)
			);

			setSummary((current) => {
				const next = { ...current };
				next.pending = Math.max(0, next.pending - 1);
				if (nextStatus === "approve") {
					next.confirmed += 1;
				} else {
					next.rejected += 1;
				}
				return next;
			});

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
			<div className="min-h-full bg-[#151514] p-4 text-white md:p-6">
				<div className="mx-auto max-w-7xl rounded-3xl border border-white/10 bg-[#1a1a18] p-8 shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
					<p className="text-sm text-white/60">Loading registrations...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,_#171716_0%,_#101010_100%)] p-4 text-white md:p-6">
			<div className="mx-auto max-w-7xl space-y-5">
				<div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
					<div className="relative border-b border-white/10 px-6 py-6 md:px-8">
						<div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),transparent_35%,rgba(59,130,246,0.06))]" />
						<div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
							<div className="max-w-2xl">
								<p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Admin dashboard</p>
								<h2 className="mt-2 text-3xl font-semibold md:text-4xl">Student Registrations</h2>
								<p className="mt-3 text-sm leading-6 text-white/60 md:text-base">
									Review student registrations, approve eligible submissions, or reject entries that need attention.
								</p>
							</div>

							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[500px]">
								<div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
									<p className="text-[11px] tracking-[0.2em] text-white/45">TOTAL</p>
									<p className="mt-1 text-2xl font-semibold">{summary.total}</p>
								</div>
								<div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
									<p className="text-[11px] tracking-[0.2em] text-amber-200/70">PENDING</p>
									<p className="mt-1 text-2xl font-semibold text-amber-200">{summary.pending}</p>
								</div>
								<div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
									<p className="text-[11px] tracking-[0.2em] text-emerald-200/70">APPROVED</p>
									<p className="mt-1 text-2xl font-semibold text-emerald-200">{summary.confirmed}</p>
								</div>
								<div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3">
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
											{status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
										</button>
									);
								})}
							</div>

							<label className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-[#111110] px-4 py-3 text-white/70 shadow-[0_12px_28px_rgba(0,0,0,0.18)] lg:max-w-md">
								<FiSearch className="shrink-0" />
								<input
									type="text"
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder="Search by student, event, venue, or ID"
									className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
								/>
							</label>
						</div>
					</div>
				</div>

				{error && <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

				{registrations.length === 0 ? (
					<div className="rounded-3xl border border-white/10 bg-[#1b1b19] p-8 text-center shadow-[0_18px_48px_rgba(0,0,0,0.32)]">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
							<FiUsers className="h-5 w-5" />
						</div>
						<h3 className="mt-3 text-lg font-semibold">No registrations found</h3>
						<p className="mt-2 text-sm text-white/60">Try a different filter or search term.</p>
					</div>
				) : (
					<div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1b1b19] shadow-[0_18px_48px_rgba(0,0,0,0.30)]">
						<div className="overflow-x-auto">
							<table className="min-w-full text-left text-sm">
								<thead className="border-b border-white/10 bg-white/5 text-white/60">
									<tr>
										<th className="px-5 py-4 font-medium">Student</th>
										<th className="px-5 py-4 font-medium">Event</th>
										<th className="px-5 py-4 font-medium">Details</th>
										<th className="px-5 py-4 font-medium">Status</th>
										{filter === "PENDING" && <th className="px-5 py-4 font-medium">Actions</th>}
									</tr>
								</thead>
								<tbody>
									{registrations.map((registration) => {
										const statusMeta = getStatusMeta(registration.status);
										const isPending = registration.status === "PENDING";

										return (
											<tr key={registration.id} className="border-b border-white/5 align-top transition hover:bg-white/5 last:border-b-0">
												<td className="px-5 py-4">
													<div className="font-medium text-white">{registration.user?.name || registration.user?.email || "Unknown student"}</div>
													<div className="mt-1 text-xs text-white/55">#{registration.id}</div>
												</td>
												<td className="px-5 py-4 text-white/85">
													<div className="font-medium text-white">{registration.event?.title || "Untitled Event"}</div>
													<div className="mt-1 text-xs text-white/55">{registration.event?.category?.name || "General"}</div>
												</td>
												<td className="px-5 py-4 text-white/75">
													<div className="space-y-1.5">
														<p className="flex items-center gap-2"><FiMapPin className="text-pink-400" />{registration.event?.venue?.name || "N/A"}</p>
														<p className="flex items-center gap-2"><FiCalendar className="text-sky-400" />{registration.event?.date || "N/A"}</p>
														<p className="flex items-center gap-2"><FiClock className="text-amber-400" />{formatDateTime(registration.register_at)}</p>
													</div>
												</td>
												<td className="px-5 py-4">
													<span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusMeta.className}`}>
														{statusMeta.label}
													</span>
												</td>
												{isPending && (
													<td className="px-5 py-4">
														<div className="flex flex-wrap gap-2">
															<button
																	type="button"
																	onClick={() => updateRegistrationStatus(registration.id, "approve")}
																	disabled={processingId === registration.id}
																	className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
																>
																	<FiCheckCircle />
																	{processingId === registration.id ? "Updating..." : "Approve"}
																</button>
																<button
																	type="button"
																	onClick={() => updateRegistrationStatus(registration.id, "reject")}
																	disabled={processingId === registration.id}
																	className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
																>
																	<FiSlash />
																	{processingId === registration.id ? "Updating..." : "Reject"}
																</button>
															</div>
													</td>
												)}
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
