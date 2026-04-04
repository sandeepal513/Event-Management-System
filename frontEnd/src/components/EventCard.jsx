import { Link } from "react-router-dom";
import { FiCalendar, FiEdit2, FiEye, FiMapPin, FiTrash2, FiUsers } from "react-icons/fi";

export default function EventCard({ event }) {
    return (
        <div className="w-full h-[250px] max-w-[280px] rounded-xl border border-white/10 bg-[#1f1f1d] px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.25)] relative">
            <div className="h-[3px] w-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />

            <h1 className="mt-3 text-xl font-semibold leading-tight text-white">{event.title}</h1>

            <div className="mt-3 space-y-1.5 text-sm text-white/75">
                <p className="flex items-center gap-2">
                    <FiCalendar className="text-sky-400" />
                    {event.date}
                </p>
                <p className="flex items-center gap-2">
                    <FiMapPin className="text-pink-400" />
                    {event.venue?.name}
                </p>
                <p className="flex items-center gap-2">
                    <FiUsers className="text-violet-400" />
                    {event.society?.name}
                </p>
            </div>

            <div className="mt-4 border-t border-white/10 pt-3 flex items-center gap-2 absolute bottom-3">
                <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-[#232320] px-3 py-1.5 text-sm text-white/85 hover:border-sky-400/50 hover:text-white"
                >
                    <FiEye className="text-xs" /> View
                </button>
                <Link
                    to={`/organizer/events/${event.id}/edit`}
                    state={{ event }}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-[#232320] px-3 py-1.5 text-sm text-white/85 hover:border-amber-400/50 hover:text-white"
                >
                    <FiEdit2 className="text-xs" /> Edit
                </Link>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-[#232320] px-3 py-1.5 text-sm text-white/85 hover:border-red-400/50 hover:text-white"
                >
                    <FiTrash2 className="text-xs" /> Delete
                </button>
            </div>
        </div>
    );
}