import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EventCard from "../../components/EventCard";
import toast from "react-hot-toast";

export default function Events() {

    const [events, setEvents] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);
    const [keyword, setKeyword] = useState("");

    async function fetchOrganizerEvents(searchKeyword = "") {
        const username = localStorage.getItem("username");

        if (!username) {
            console.error("User not logged in");
            setEvents([]);
            setLoaded(true);
            return;
        }

        const userResponse = await axios.get(`http://localhost:3000/api/v1/users/username/${encodeURIComponent(username)}`);
        const organizerId = userResponse?.data?.data?.id;

        if (!organizerId) {
            console.error("Unable to identify organizer account");
            setEvents([]);
            setLoaded(true);
            return;
        }

        const trimmedKeyword = searchKeyword.trim();
        const endpoint = trimmedKeyword
            ? `http://localhost:3000/api/events/organizer/${organizerId}/search?keyword=${encodeURIComponent(trimmedKeyword)}`
            : `http://localhost:3000/api/events/organizer/${organizerId}`;

        const response = await axios.get(endpoint);
        const responseData = Array.isArray(response.data) ? response.data : [];

        setEvents(responseData);
        setLoaded(true);
    }



    useEffect(() => {
        fetchOrganizerEvents().catch((error) => {
            console.error("Error fetching events:", error);
            setEvents([]);
            setLoaded(true);
        });
    }, []);

    function handleDeleteEvent(eventId, eventTitle) {
        setPendingDeleteEvent({ id: eventId, title: eventTitle });
    }

    async function confirmDeleteEvent() {
        if (!pendingDeleteEvent) {
            return;
        }

        try {
            setDeletingId(pendingDeleteEvent.id);
            await axios.delete(`http://localhost:3000/api/events/delete/${pendingDeleteEvent.id}`);
            setEvents((prevEvents) => prevEvents.filter((event) => event.id !== pendingDeleteEvent.id));
            setPendingDeleteEvent(null);
            toast.success("Event deleted successfully");
        } catch (error) {
            console.error("Error deleting event:", error);
            toast.error("Failed to delete event");
        } finally {
            setDeletingId(null);
        }
    }

    async function searchEvents() {
        try {
            await fetchOrganizerEvents(keyword);

        } catch (error) {
            console.error("Error searching events:", error);
            setEvents([]);
            toast.error("Failed to search events");
        }
    }

    useEffect(() => {
        if (!loaded) {
            return;
        }

        const delayDebounceFn = setTimeout(() => {
            searchEvents();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword, loaded]);

    const stats = useMemo(() => {
        const now = new Date();

        const upcomingCount = events.filter((event) => {
            if (!event?.date) return false;
            const eventDate = new Date(event.date);
            return !Number.isNaN(eventDate.getTime()) && eventDate >= now;
        }).length;

        const ongoingCount = events.filter((event) => {
            if (!event?.date) return false;
            const eventDate = new Date(event.date);
            return !Number.isNaN(eventDate.getTime()) && eventDate.toDateString() === now.toDateString();
        }).length;

        return [
            {
                label: "TOTAL EVENTS",
                value: String(events.length),
                trend: loaded ? "Across all statuses" : "Loading...",
                trendColor: "text-white/55",
            },
            {
                label: "UPCOMING",
                value: String(upcomingCount),
                trend: "Scheduled ahead",
                trendColor: "text-emerald-300",
            },
            {
                label: "TODAY",
                value: String(ongoingCount),
                trend: "Happening now",
                trendColor: "text-sky-300",
            },
            {
                label: "SEARCH RESULTS",
                value: String(events.length),
                trend: keyword.trim() ? `Filtered by \"${keyword.trim()}\"` : "Showing full list",
                trendColor: "text-white/55",
            },
        ];
    }, [events, keyword, loaded]);

    return (
        <div className="space-y-6 text-white">
            <div className="overflow-hidden rounded-4xl border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
                <div className="border-b border-white/10 px-6 py-6 md:px-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Organizer workspace</p>
                            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Events</h2>
                            <p className="mt-3 text-sm leading-6 text-white/60 md:text-base">
                                Manage your event catalog, search by keyword, and quickly update or remove event records.
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[350px]">
                            <input
                                type="text"
                                placeholder="Search by title, venue, or society"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-[#111110] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-400/45"
                            />
                            <Link
                                to="/organizer/events/add"
                                className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-400"
                            >
                                + Add Event
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-6 md:px-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl border border-white/10 bg-[#111110] px-5 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                            >
                                <p className="text-[11px] tracking-[0.22em] text-white/45">{stat.label}</p>
                                <p className="mt-2 text-3xl font-semibold leading-none text-white">{stat.value}</p>
                                <p className={`mt-2 text-sm ${stat.trendColor}`}>{stat.trend}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 rounded-3xl border border-white/10 bg-[#111110] p-4 md:p-5">
                        <h3 className="text-lg font-semibold text-white/90">All Events</h3>

                        {!loaded ? (
                            <p className="mt-4 text-white/60">Loading events...</p>
                        ) : events.length === 0 ? (
                            <p className="mt-4 text-white/60">No events found.</p>
                        ) : (
                            <div className="mt-4 flex w-full flex-wrap gap-4">
                                {events.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onDelete={handleDeleteEvent}
                                        isDeleting={deletingId === event.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {pendingDeleteEvent && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1c1c1a] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
                        <h2 className="text-lg font-semibold text-white">Delete Event</h2>
                        <p className="mt-2 text-sm leading-6 text-white/70">
                            Are you sure you want to delete "{pendingDeleteEvent.title}"?
                        </p>
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setPendingDeleteEvent(null)}
                                disabled={deletingId === pendingDeleteEvent.id}
                                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteEvent}
                                disabled={deletingId === pendingDeleteEvent.id}
                                className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deletingId === pendingDeleteEvent.id ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}