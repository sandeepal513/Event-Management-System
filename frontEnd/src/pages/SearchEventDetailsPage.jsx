import axios from "axios";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiCalendar, FiClock, FiFileText, FiMapPin, FiTag, FiUsers } from "react-icons/fi";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

export default function SearchEventDetailsPage() {
    const { eventId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();

    const [event, setEvent] = useState(state?.event || null);
    const [loading, setLoading] = useState(!state?.event);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let mounted = true;

        async function loadEvent() {
            if (state?.event && String(state.event.id) === String(eventId)) {
                return;
            }

            try {
                setLoading(true);
                setErrorMessage("");

                const response = await axios.get(`http://localhost:3000/api/events/${eventId}`);

                if (mounted) {
                    setEvent(response?.data || null);
                }
            } catch (error) {
                console.error("Error loading event details:", error);
                if (mounted) {
                    setErrorMessage("Unable to load event details right now.");
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadEvent();

        return () => {
            mounted = false;
        };
    }, [eventId, state]);

    const backLink = state?.fromUrl || state?.fromSearchUrl || "/";
    const backLabel = state?.fromLabel || "Back to Results";
    const hasToken = Boolean(localStorage.getItem("token"));
    const isStudentLoggedIn = localStorage.getItem("userRole") === "student" && hasToken;

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0f0f0e] to-[#1a1a18] px-4 py-10 md:px-8">
            <div className="mx-auto max-w-5xl">
                <button
                    type="button"
                    onClick={() => navigate(backLink)}
                    className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                >
                    <FiArrowLeft /> {backLabel}
                </button>

                {loading && (
                    <div className="rounded-2xl border border-white/10 bg-[#1f1f1d] p-6 text-white/70">
                        Loading event details...
                    </div>
                )}

                {!loading && errorMessage && (
                    <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
                        {errorMessage}
                    </div>
                )}

                {!loading && !errorMessage && !event && (
                    <div className="rounded-2xl border border-white/10 bg-[#1f1f1d] p-6 text-white/70">
                        Event not found.
                    </div>
                )}

                {!loading && !errorMessage && event && (
                    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#1f1f1d] shadow-xl shadow-black/30">
                        <img
                            src={event.imageUrl}
                            alt={event.title || "Event"}
                            className="h-72 w-full object-cover"
                        />

                        <div className="space-y-6 p-6 md:p-8">
                            <div>
                                <h1 className="text-3xl font-bold text-white md:text-4xl">{event.title || "Untitled Event"}</h1>
                                <p className="mt-3 text-white/70">{event.description || "No description available."}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/85">
                                    <p className="flex items-center gap-2"><FiCalendar className="text-sky-400" /> {event.date || "N/A"}</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/85">
                                    <p className="flex items-center gap-2"><FiClock className="text-amber-400" /> {event.time || "N/A"}</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/85">
                                    <p className="flex items-center gap-2"><FiMapPin className="text-pink-400" /> {event.venue?.name || "Venue not set"}</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/85">
                                    <p className="flex items-center gap-2"><FiUsers className="text-emerald-400" /> {event.society?.name || "Society not set"}</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/85 md:col-span-2">
                                    <p className="flex items-center gap-2"><FiTag className="text-cyan-400" /> {event.category?.name || "Uncategorized"}</p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-[#232320] p-4">
                                <p className="mb-2 flex items-center gap-2 text-white/70"><FiFileText className="text-cyan-400" /> Event Description</p>
                                <p className="text-sm leading-6 text-white/85">{event.description || "No description available."}</p>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to={backLink}
                                    className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/85 hover:bg-white/5 hover:text-white"
                                >
                                    {backLabel}
                                </Link>
                                {isStudentLoggedIn && (
                                    <Link
                                        to={`/student/events/${event.id}`}
                                        state={{ event, fromUrl: backLink, fromLabel: backLabel }}
                                        className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
                                    >
                                        Open Registration Page
                                    </Link>
                                )}
                                {!hasToken && (
                                    <Link
                                        to="/auth/login"
                                        className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500"
                                    >
                                        Sign In to Register
                                    </Link>
                                )}
                            </div>
                        </div>
                    </article>
                )}
            </div>
        </div>
    );
}