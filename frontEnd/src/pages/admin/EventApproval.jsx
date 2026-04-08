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
				const response = await fetch("http://localhost:3000/api/event-approvals");
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
	}, []);

	const summary = useMemo(() => {
		return approvals.reduce(
			(counts, approval) => {
				const status = normalizeStatus(approval.status);
				counts.total += 1;
				if (status === "PENDING") counts.pending += 1;
				if (status === "APPROVED") counts.approved += 1;
				if (status === "REJECTED") counts.rejected += 1;
				return counts;
			},
			{ total: 0, pending: 0, approved: 0, rejected: 0 }
		);
	}, [approvals]);

	const visibleApprovals = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase();

		return approvals.filter((approval) => {
			const status = normalizeStatus(approval.status);
			const matchesFilter = filter === "ALL" || status === filter;
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

			return matchesFilter && matchesQuery;
		});
	}, [approvals, filter, query]);

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
			<div className="min-h-full bg-[#151514] p-4 text-white md:p-6">
				<div className="rounded-3xl border border-white/10 bg-[#1b1b19] p-8 shadow-[0_18px_48px_rgba(0,0,0,0.35)]">
					<p className="text-sm text-white/60">Loading event approvals...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(244,114,182,0.12),_transparent_30%),linear-gradient(180deg,_#171716_0%,_#101010_100%)] p-4 text-white md:p-6">
			<div className="mx-auto max-w-7xl space-y-6">
				<div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
					<div className="border-b border-white/10 px-6 py-6 md:px-8">
						<div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
							<div className="max-w-2xl">
								<h2 className="mt-2 text-3xl font-semibold md:text-4xl">Event Approval Queue</h2>
								<p className="mt-3 text-sm leading-6 text-white/60 md:text-base">
									Review submitted events, confirm the ones that are ready, and reject those that need revision.
								</p>
							</div>

							<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[520px]">
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
									<p className="mt-1 text-2xl font-semibold text-emerald-200">{summary.approved}</p>
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
											className={`rounded-full border px-4 py-2 text-sm font-medium transition ${active ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10"}`}
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
									placeholder="Search by event, organizer, venue, category, or ID"
									className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
								/>
							</label>
						</div>
					</div>
				</div>

				{error && <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>}

				{visibleApprovals.length === 0 ? (
					<div className="rounded-[1.75rem] border border-white/10 bg-[#1b1b19] p-8 text-center shadow-[0_18px_48px_rgba(0,0,0,0.32)]">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70">
							<FiClock className="h-6 w-6" />
						</div>
						<h3 className="mt-4 text-xl font-semibold">No approvals found</h3>
						<p className="mt-2 text-sm text-white/60">Try a different filter or search term to find the event you want to review.</p>
					</div>
				) : (
					<div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#1b1b19] shadow-[0_18px_48px_rgba(0,0,0,0.30)]">
						<div className="overflow-x-auto">
							<table className="min-w-full text-left text-sm">
								<thead className="border-b border-white/10 bg-white/5 text-white/60">
									<tr>
										<th className="px-5 py-4 font-medium">Event</th>
										<th className="px-5 py-4 font-medium">Organizer</th>
										<th className="px-5 py-4 font-medium">Venue</th>
										<th className="px-5 py-4 font-medium">Status</th>
										<th className="px-5 py-4 font-medium">Created</th>
										<th className="px-5 py-4 font-medium">Actions</th>
									</tr>
								</thead>
								<tbody>
									{visibleApprovals.map((approval) => {
										const status = normalizeStatus(approval.status);
										const statusMeta = getStatusMeta(status);
										const canAct = status === "PENDING";

										return (
											<tr key={approval.id} className="border-b border-white/5 last:border-b-0 align-top">
												<td className="px-5 py-5">
													<div className="space-y-1">
														<p className="font-semibold text-white">{approval.event?.title || "Untitled Event"}</p>
														<p className="max-w-xl text-xs leading-5 text-white/55">{approval.event?.description || "No description provided."}</p>
													</div>
												</td>
												<td className="px-5 py-5 text-white/80">{approval.event?.organizer?.name || "N/A"}</td>
												<td className="px-5 py-5 text-white/80">{approval.event?.venue?.name || "N/A"}</td>
												<td className="px-5 py-5">
													<span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusMeta.className}`}>{statusMeta.label}</span>
												</td>
												<td className="px-5 py-5 text-white/70">{formatDateTime(approval.createdAt)}</td>
												<td className="px-5 py-5">
													<div className="space-y-3">
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
																disabled={!canAct || processingId === approval.id}
																className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
															>
																<FiCheckCircle />
																{processingId === approval.id ? "Updating..." : "Approve"}
															</button>
															<button
																type="button"
																onClick={() => handleReject(approval.id)}
																disabled={!canAct || processingId === approval.id}
																className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
															>
																<FiSlash />
																{processingId === approval.id ? "Updating..." : "Reject"}
															</button>
														</div>
													</div>
												</td>
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
