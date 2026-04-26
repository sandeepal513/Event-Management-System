import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiFileText } from "react-icons/fi";
import { MdConfirmationNumber } from "react-icons/md";

export default function EventDetailsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const event = location.state;

    useEffect(() => {
        if (!event) {
            navigate("/organizer/events");
        }
    }, [event, navigate]);

    if (!event) {
        return <p className="p-4 text-white">Loading event details...</p>;
    }

    return (
        <div className="min-h-full w-full bg-[#2e2e2c] p-4 text-white">
            <div className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#1e1e1c] px-4 py-3">
                <div>
                    <p className="text-sm text-white/50">Organizer / Events / View</p>
                    <h1 className="text-2xl font-semibold">{event.title}</h1>
                </div>
                <Link
                    to="/organizer/events"
                    className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white"
                >
                    Back
                </Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#1e1e1c] p-5">
                <div className="mb-5">
                    {event.imageUrl ? (
                        <img
                            src={event.imageUrl}
                            alt={event.title || "Event image"}
                            className="h-56 w-full rounded-xl border border-white/10 object-cover md:h-72"
                        />
                    ) : (
                        <div className="flex h-56 w-full items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#232320] text-white/55 md:h-72">
                            No event image available
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <p className="flex items-center gap-2 text-white/85">
                        <FiCalendar className="text-sky-400" />
                        <span className="text-white/65">Date:</span> {event.date || "N/A"}
                    </p>
                    <p className="flex items-center gap-2 text-white/85">
                        <FiClock className="text-amber-400" />
                        <span className="text-white/65">Time:</span> {event.time || "N/A"}
                    </p>
                    <p className="flex items-center gap-2 text-white/85">
                        <FiMapPin className="text-pink-400" />
                        <span className="text-white/65">Venue:</span> {event.venue?.name || "N/A"}
                    </p>
                    <p className="flex items-center gap-2 text-white/85">
                        <FiUsers className="text-violet-400" />
                        <span className="text-white/65">Society:</span> {event.society?.name || "N/A"}
                    </p>
                    <p className="flex items-center gap-2 text-white/85">
                        <MdConfirmationNumber className="text-emerald-400" />
                        <span className="text-white/65">Ticket Count:</span> {event.ticketRequired ? event.ticketsCount ?? 0 : "No Tickets Required"}
                    </p>
                </div>

                <div className="mt-5 rounded-lg border border-white/10 bg-[#232320] p-4">
                    <p className="mb-2 flex items-center gap-2 text-white/75">
                        <FiFileText className="text-cyan-400" /> Description
                    </p>
                    <p className="text-white/85">{event.description || "N/A"}</p>
                </div>
            </div>
        </div>
    );
}
