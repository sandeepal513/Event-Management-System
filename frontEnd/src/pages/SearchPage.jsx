import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiClock, FiMapPin, FiTag, FiUsers } from "react-icons/fi";
import { useLocation } from "react-router-dom";

export default function SearchPage() {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const location = useLocation();

    const params = new URLSearchParams(location.search);
    const category = params.get("category");

    useEffect(() => {
        let isMounted = true;

        async function fetchEvents() {
            try {
                setLoading(true);
                setErrorMessage("");

                const res = await axios.get("http://localhost:3000/api/events/category", {
                    params: { categoryName: category },
                });

                const responseData = Array.isArray(res.data) ? res.data : [];

                if (isMounted) {
                    setEvents(responseData);
                }
            } catch (error) {
                console.error("Error fetching events:", error);
                if (isMounted) {
                    setEvents([]);
                    setErrorMessage("Unable to load events for this category right now.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        if (category) {
            fetchEvents();
        } else {
            setEvents([]);
        }

        return () => {
            isMounted = false;
        };
    }, [category]);

    return (
        <div className="min-h-screen bg-linear-to-b from-[#0f0f0e] to-[#1a1a18] px-4 py-10 md:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-5">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
                    >
                        Back to Home
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-white md:text-4xl">
                    Events in <span className="text-cyan-400">{category || "Selected Category"}</span>
                </h1>
                <p className="mt-2 text-white/60">Showing related event details for the selected category.</p>

                {loading && (
                    <div className="mt-8 rounded-xl border border-white/10 bg-[#1f1f1d] p-6 text-white/70">
                        Loading events...
                    </div>
                )}

                {!loading && errorMessage && (
                    <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
                        {errorMessage}
                    </div>
                )}

                {!loading && !errorMessage && events.length === 0 && (
                    <div className="mt-8 rounded-xl border border-white/10 bg-[#1f1f1d] p-6 text-white/70">
                        No events found for this category.
                    </div>
                )}

                {!loading && !errorMessage && events.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => (
                            <Link
                                key={event.id}
                                to={`/search/events/${event.id}`}
                                state={{ event, fromUrl: location.pathname + location.search, fromLabel: "Back to Search Results" }}
                                className="overflow-hidden rounded-xl border border-white/10 bg-[#1f1f1d] transition-all duration-300 hover:border-cyan-400/50 hover:shadow-xl hover:shadow-cyan-500/10"
                            >
                                <img
                                    src={event.imageUrl}
                                    alt={event.title || "Event"}
                                    className="h-48 w-full object-cover"
                                />

                                <div className="space-y-3 p-5">
                                    <h2 className="line-clamp-2 text-2xl font-semibold text-white">{event.title || "Untitled Event"}</h2>
                                    <p className="line-clamp-2 text-sm text-white/65">{event.description || "No description available."}</p>

                                    <div className="space-y-2 text-sm text-white/80">
                                        <p className="flex items-center gap-2">
                                            <FiCalendar className="text-sky-400" />
                                            {event.date || "N/A"}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <FiClock className="text-amber-400" />
                                            {event.time || "N/A"}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <FiMapPin className="text-pink-400" />
                                            {event.venue?.name || "Venue not set"}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <FiUsers className="text-emerald-400" />
                                            {event.society?.name || "Society not set"}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <FiTag className="text-cyan-400" />
                                            {event.category?.name || category || "Uncategorized"}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}