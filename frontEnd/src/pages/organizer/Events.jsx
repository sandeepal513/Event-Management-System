import axios from "axios";
import { use, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EventCard from "../../components/EventCard";
import toast from "react-hot-toast";

export default function Events() {

    const [events, setEvents] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [pendingDeleteEvent, setPendingDeleteEvent] = useState(null);
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        if(!loaded){
            axios.get("http://localhost:3000/api/events/all")
                .then((response) => {
                    console.log("Fetched events:", response.data);
                    setEvents(response.data);
                    setLoaded(true);
                })
                .catch((error) => {
                    console.error("Error fetching events:", error);
                });
        }
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
        try{

            if(keyword.trim() === ""){
                const res = await axios.get("http://localhost:3000/api/events/all");
                setEvents(res.data);
            }else{
                const res = await axios.get(`http://localhost:3000/api/events/search?keyword=${keyword}`);
                setEvents(res.data);
            }

        }catch(error){
            console.error("Error searching events:", error);
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchEvents();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);

    const stats = [
        {
            label: "TOTAL EVENTS",
            value: "24",
            trend: "↑ 4 this month",
            trendColor: "text-lime-400",
        },
        {
            label: "UPCOMING",
            value: "9",
            trend: "↑ 2 new",
            trendColor: "text-lime-400",
        },
        {
            label: "ONGOING",
            value: "3",
            trend: "Live now",
            trendColor: "text-slate-400",
        },
        {
            label: "TOTAL ATTENDEES",
            value: "1,482",
            trend: "↑ 12% vs last month",
            trendColor: "text-lime-400",
        },
    ];

    return (
        <div className="w-full p-4 bg-[#2e2e2c]">
            <div className="flex items-center h-[50px] border border-white/25 justify-between mb-4 bg-[#1e1e1c]">
                <h1 className="text-2xl ml-5 font-bold text-white/75">Events</h1>
                <div className="flex">
                    <input type="text" 
                    placeholder="Search events..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-[250px] h-[35px] mr-3 bg-[#272725] text-amber-50 p-2 border border-gray-700 rounded-lg" />
                    <Link to="/organizer/events/add" className="bg-blue-400 text-white text-sm mr-5 p-2 rounded-lg"> + Add Event</Link>
                </div>
            </div>
        
        
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="rounded-xl bg-[#232320] border border-white/5 px-5 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
                    >
                        <p className="text-[11px] tracking-[0.18em] text-white/55 mb-2">
                            {stat.label}
                        </p>
                        <p className="text-3xl font-semibold text-white leading-none">
                            {stat.value}
                        </p>
                        <p className={`mt-2 text-sm ${stat.trendColor}`}>
                            {stat.trend}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-10">
                <h1 className="text-white/80 font-semibold">All Events</h1>
            </div>
            <div>
                {loaded ? (
                    <div className="w-full flex flex-wrap gap-4 p-4">
                        {
                            events.map( (event) => {
                                return (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onDelete={handleDeleteEvent}
                                        isDeleting={deletingId === event.id}
                                    />
                                )
                            })
                        }
                    </div>
                ) : (
                    <p>Loading events...</p>
                    
                )}

                {events.length === 0 && loaded && (
                    <p className="text-white/60 mt-4">No events found</p>
                )}
            </div>

            {pendingDeleteEvent && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#1e1e1c] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
                        <h2 className="text-lg font-semibold text-white">Delete Event</h2>
                        <p className="mt-2 text-sm text-white/75">
                            Are you sure you want to delete "{pendingDeleteEvent.title}"?
                        </p>
                        <div className="mt-5 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setPendingDeleteEvent(null)}
                                disabled={deletingId === pendingDeleteEvent.id}
                                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmDeleteEvent}
                                disabled={deletingId === pendingDeleteEvent.id}
                                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
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