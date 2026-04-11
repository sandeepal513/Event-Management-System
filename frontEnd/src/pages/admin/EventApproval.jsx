import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClock, FiSearch, FiSlash } from "react-icons/fi";
import toast from "react-hot-toast";

const FILTERS = ["ALL", "PENDING", "APPROVED", "REJECTED"];

function normalizeStatus(status) {
	if (status === "CONFIRMED") return "APPROVED";
	return status || "PENDING";
}

function getStatusMeta(status) {
	if (status === "APPROVED") {
		return { label: "Approved", className: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" };
	}

	if (status === "REJECTED") {
		return { label: "Rejected", className: "border-rose-400/20 bg-rose-400/10 text-rose-300" };
	}

	return { label: "Pending", className: "border-amber-400/20 bg-amber-400/10 text-amber-300" };
}

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

function isUpcomingByDateOnly(event) {
	if (!event?.date) return true;

	const eventDate = new Date(event.date);
	if (Number.isNaN(eventDate.getTime())) return true;

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

	return eventDay >= today;
}

export default function EventApprovals() {
	const [approvals, setApprovals] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState("PENDING");
	const [query, setQuery] = useState("");
	const [rejectReason, setRejectReason] = useState({});
	const [processingId, setProcessingId] = useState(null);

	useEffect(() => {
		let mounted = true;

		(async () => {
			try {
				let endpoint = "http://localhost:3000/api/event-approvals";
				if (filter === "PENDING") endpoint = "http://localhost:3000/api/event-approvals/pending";
				else if (filter === "APPROVED") endpoint = "http://localhost:3000/api/event-approvals/approve";
				else if (filter === "REJECTED") endpoint = "http://localhost:3000/api/event-approvals/reject";

				const response = await fetch(endpoint);
				if (!response.ok) throw new Error(`Request failed with ${response.status}`);
				const data = await response.json();
				if (mounted) setApprovals(Array.isArray(data) ? data : []);
			} catch (loadError) {
				console.error("Error loading approvals:", loadError);
				if (mounted) setError("Unable to load event approvals right now.");
			} finally {
				if (mounted) setLoading(false);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [filter]);

	const summary = useMemo(() => {
		const upcomingApprovals = approvals.filter((approval) => isUpcomingByDateOnly(approval.event));
		const counts = { total: 0, pending: 0, approved: 0, rejected: 0 };
		counts.total = upcomingApprovals.length;

		if (filter === "PENDING") counts.pending = upcomingApprovals.length;
		else if (filter === "APPROVED") counts.approved = upcomingApprovals.length;
		else if (filter === "REJECTED") counts.rejected = upcomingApprovals.length;
		else {
			upcomingApprovals.forEach((approval) => {
				const status = normalizeStatus(approval.status);
				if (status === "PENDING") counts.pending += 1;
				if (status === "APPROVED") counts.approved += 1;
				if (status === "REJECTED") counts.rejected += 1;
			});
		}

		return counts;
	}, [approvals, filter]);

	const visibleApprovals = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return approvals.filter((approval) => {
			if (!isUpcomingByDateOnly(approval.event)) {
				return false;
			}

			const eventTitle = approval.event?.title || "";
			const organizerName = approval.event?.organizer?.name || "";
			const venueName = approval.event?.venue?.name || "";
			const categoryName = approval.event?.category?.name || "";
			const matchesQuery =
				normalizedQuery.length === 0 ||
				eventTitle.toLowerCase().includes(normalizedQuery) ||
				organizerName.toLowerCase().includes(normalizedQuery) ||
				venueName.toLowerCase().includes(normalizedQuery) ||
				categoryName.toLowerCase().includes(normalizedQuery) ||
				String(approval.id).includes(normalizedQuery);

			return matchesQuery;
		});
	}, [approvals, query]);

	const showActionsColumn = visibleApprovals.some((approval) => normalizeStatus(approval.status) === "PENDING");

	async function handleApprove(id) {
		try {
			setProcessingId(id);
			const response = await fetch(`http://localhost:3000/api/event-approvals/${id}/approve`, {
				method: "POST",
			});

			if (!response.ok) throw new Error(`Request failed with ${response.status}`);

			setApprovals((current) => current.filter((approval) => approval.id !== id));
			toast.success("Event approved");
		} catch (approveError) {
			console.error("Error approving event:", approveError);
			toast.error("Unable to approve event");
		} finally {
			setProcessingId(null);
		}
	}

	async function handleReject(id) {
		const reason = rejectReason[id] || "";
		if (!reason.trim()) {
			toast.error("Please enter a rejection reason");
			return;
		}

		try {
			setProcessingId(id);
			const response = await fetch(`http://localhost:3000/api/event-approvals/${id}/reject`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reason }),
			});

			if (!response.ok) throw new Error(`Request failed with ${response.status}`);

			setApprovals((current) => current.filter((approval) => approval.id !== id));
			setRejectReason((current) => {
				const next = { ...current };
				delete next[id];
				return next;
			});
			toast.success("Event rejected");
		} catch (rejectError) {
			console.error("Error rejecting event:", rejectError);
			toast.error("Unable to reject event");
		} finally {
			setProcessingId(null);
		}
	}

	if (loading) {
		return (
			<div className="min-h-full bg-[#151514] p-4 text-white md:p-5">
				<div className="rounded-2xl border border-white/10 bg-[#1b1b19] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
					<p className="text-sm text-white/60">Loading event approvals...</p>
				</div>
			</div>
		);
	}

	return (
			<div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.14),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.08),_transparent_28%),linear-gradient(180deg,_#171716_0%,_#101010_100%)] p-4 text-white md:p-5">
			<div className="mx-auto max-w-7xl space-y-4">
				<div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1a] shadow-[0_16px_40px_rgba(0,0,0,0.32)]">
					<div className="border-b border-white/10 px-5 py-5 md:px-6">
						<div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
							<div className="max-w-2xl">
								<h2 className="text-2xl font-semibold md:text-3xl">Event Approval Queue</h2>
								<p className="mt-2 text-sm leading-6 text-white/60">
									Review submitted events, confirm the ones that are ready, and reject those that need revision.
								</p>
							</div>

							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:min-w-[460px]">
								<div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
									<p className="text-[11px] tracking-[0.2em] text-white/45">TOTAL</p>
									<p className="mt-1 text-xl font-semibold">{summary.total}</p>
								</div>
								<div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-3">
									<p className="text-[11px] tracking-[0.2em] text-amber-200/70">PENDING</p>
									<p className="mt-1 text-xl font-semibold text-amber-200">{summary.pending}</p>
								</div>
								<div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-3">
									<p className="text-[11px] tracking-[0.2em] text-emerald-200/70">APPROVED</p>
									<p className="mt-1 text-xl font-semibold text-emerald-200">{summary.approved}</p>
								</div>
								<div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-3">
									<p className="text-[11px] tracking-[0.2em] text-rose-200/70">REJECTED</p>
									<p className="mt-1 text-xl font-semibold text-rose-200">{summary.rejected}</p>
								</div>
							</div>
						</div>
					</div>

					<div className="px-5 py-4 md:px-6">
						<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex flex-wrap gap-2">
								{FILTERS.map((status) => {
									const active = filter === status;
									return (
										<button
											key={status}
											type="button"
											onClick={() => setFilter(status)}
											className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${active ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10"}`}
										>
											{status}
										</button>
									);
								})}
							</div>

							<label className="flex w-full max-w-md items-center gap-3 rounded-xl border border-white/10 bg-[#111110] px-4 py-2.5 text-white/70 shadow-[0_12px_28px_rgba(0,0,0,0.18)]">
								<FiSearch className="shrink-0" />
								<input
									type="text"
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder="Search by event, organizer, venue, category, or ID"
									className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
								/>
							</label>
						</div>
					</div>
				</div>

				{error && <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

				{visibleApprovals.length === 0 ? (
					<div className="rounded-2xl border border-white/10 bg-[#1b1b19] p-7 text-center shadow-[0_18px_48px_rgba(0,0,0,0.32)]">
						<div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
							<FiClock className="h-5 w-5" />
						</div>
						<h3 className="mt-4 text-lg font-semibold">No approvals found</h3>
						<p className="mt-2 text-sm text-white/60">Try a different filter or search term to find the event you want to review.</p>
					</div>
				) : (
					<div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1b1b19] shadow-[0_18px_48px_rgba(0,0,0,0.30)]">
						<div className="overflow-x-auto">
							<table className="min-w-full text-left text-sm">
								<thead className="border-b border-white/10 bg-white/5 text-white/60">
									<tr>
										<th className="px-4 py-3.5 font-medium">Event</th>
										<th className="px-4 py-3.5 font-medium">Organizer</th>
										<th className="px-4 py-3.5 font-medium">Venue</th>
										<th className="px-4 py-3.5 font-medium">Status</th>
										<th className="px-4 py-3.5 font-medium">Created</th>
										{showActionsColumn ? <th className="px-4 py-3.5 font-medium">Actions</th> : null}
									</tr>
								</thead>
								<tbody>
									{visibleApprovals.map((approval) => {
										const status = normalizeStatus(approval.status);
										const statusMeta = getStatusMeta(status);
										const canAct = status === "PENDING";

										return (
											<tr key={approval.id} className="border-b border-white/5 last:border-b-0 align-top">
												<td className="px-4 py-4">
													<div className="space-y-1">
														<p className="font-semibold text-white">{approval.event?.title || "Untitled Event"}</p>
														<p className="max-w-xl text-xs leading-5 text-white/55">{approval.event?.description || "No description provided."}</p>
													</div>
												</td>
												<td className="px-4 py-4 text-white/80">{approval.event?.organizer?.name || "N/A"}</td>
												<td className="px-4 py-4 text-white/80">{approval.event?.venue?.name || "N/A"}</td>
												<td className="px-4 py-4">
													<span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusMeta.className}`}>{statusMeta.label}</span>
												</td>
												<td className="px-4 py-4 text-white/70">{formatDateTime(approval.createdAt)}</td>
												{showActionsColumn ? (
													<td className="px-4 py-4">
													{canAct ? (
														<div className="space-y-2.5">
															<input
																type="text"
																placeholder="Reason if rejecting"
																value={rejectReason[approval.id] || ""}
																onChange={(event) =>
																	setRejectReason((current) => ({
																		...current,
																		[approval.id]: event.target.value,
																	}))
																}
																className="w-full rounded-xl border border-white/10 bg-[#111110] px-3 py-2 text-xs text-white outline-none placeholder:text-white/35 focus:border-sky-400/50"
															/>

															<div className="flex flex-wrap gap-2">
																<button
																	type="button"
																	onClick={() => handleApprove(approval.id)}
																	disabled={processingId === approval.id}
																	className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
																>
																	<FiCheckCircle />
																	{processingId === approval.id ? "Updating..." : "Approve"}
																</button>
																<button
																	type="button"
																	onClick={() => handleReject(approval.id)}
																	disabled={processingId === approval.id}
																	className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
																>
																	<FiSlash />
																	{processingId === approval.id ? "Updating..." : "Reject"}
																</button>
															</div>
														</div>
													) : null}
													</td>
												) : null}
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
