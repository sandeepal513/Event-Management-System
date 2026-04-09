import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiAlertTriangle, FiArrowLeft, FiSlash } from "react-icons/fi";

export default function TicketCancel() {
	const { ticketId } = useParams();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [ticket, setTicket] = useState(null);
	const [cancelling, setCancelling] = useState(false);

	useEffect(() => {
		let mounted = true;
		(async () => {
			try {
				const response = await axios.get(`http://localhost:3000/api/tickets/${ticketId}`);
				if (mounted) setTicket(response.data);
			} catch (requestError) {
				toast.error("Unable to load ticket");
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => { mounted = false; };
	}, [ticketId]);

	const handleCancel = async () => {
		try {
			setCancelling(true);
			await axios.post(`http://localhost:3000/api/tickets/${ticketId}/cancel`);
			toast.success("Ticket cancelled successfully");
			navigate("/admin/tickets/manage");
		} catch (requestError) {
			toast.error(requestError.response?.data || "Unable to cancel ticket");
		} finally {
			setCancelling(false);
		}
	};

	if (loading) {
		return <div className="rounded-3xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">Loading cancellation screen...</div>;
	}

	if (!ticket) {
		return <div className="rounded-3xl border border-white/10 bg-[#1c1c1a] p-6 text-white/70">Ticket not found.</div>;
	}

	return (
		<div className="overflow-hidden rounded-3xl border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.36)]">
			<div className="border-b border-white/10 px-6 py-6 md:px-8">
				<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Admin dashboard</p>
						<h2 className="mt-2 text-3xl font-semibold md:text-4xl">Cancel Ticket</h2>
						<p className="mt-3 text-sm text-white/60">This will mark the ticket as cancelled and remove it from active use.</p>
					</div>
					<Link to="/admin/tickets/manage" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"><FiArrowLeft /> Back to board</Link>
				</div>
			</div>

			<div className="grid gap-6 p-6 md:grid-cols-[1fr_0.7fr] md:p-8">
				<div className="rounded-3xl border border-white/10 bg-[#111110] p-5">
					<div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-rose-200">
						<FiAlertTriangle className="mt-1 shrink-0" />
						<div>
							<p className="font-semibold">Are you sure you want to cancel this ticket?</p>
							<p className="mt-1 text-sm text-rose-100/80">{ticket.ticketNumber} for {ticket.registration?.event?.title || "N/A"}</p>
						</div>
					</div>
					<div className="mt-4 grid gap-3 text-sm text-white/75 sm:grid-cols-2">
						<p>Student: {ticket.registration?.user?.name || "N/A"}</p>
						<p>Email: {ticket.registration?.user?.email || "N/A"}</p>
						<p>Date: {ticket.registration?.event?.date || "N/A"}</p>
						<p>Venue: {ticket.registration?.event?.venue?.name || "N/A"}</p>
					</div>
				</div>

				<div className="rounded-3xl border border-white/10 bg-[#111110] p-5">
					<p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Action</p>
					<h3 className="mt-2 text-lg font-semibold text-white">Cancel confirmation</h3>
					<p className="mt-2 text-sm text-white/60">Canceling will keep the record for audit purposes, but the ticket status will change to cancelled.</p>
					<div className="mt-5 flex flex-wrap gap-3">
						<button type="button" onClick={handleCancel} disabled={cancelling} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"><FiSlash /> {cancelling ? "Cancelling..." : "Cancel ticket"}</button>
						<Link to="/admin/tickets/manage" className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm text-white/80 transition hover:bg-white/5 hover:text-white">Keep ticket</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
