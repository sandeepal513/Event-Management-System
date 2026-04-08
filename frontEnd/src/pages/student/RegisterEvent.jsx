import { useState, useEffect } from "react";

const RegisterEvent = () => {

    const [userRole, setUserRole] = useState("student");

    useEffect(() => {
            const userRole = localStorage.getItem("userRole");
            setUserRole(userRole);
    }, []);
    const registeredEvents = [
        {
            id: "EVT-1001",
            title: "Tech Meetup 2026",
            date: "Apr 16, 2026",
            venue: "Innovation Hall",
            status: "Confirmed",
        },
        {
            id: "EVT-1007",
            title: "Startup Pitch Night",
            date: "Apr 24, 2026",
            venue: "Main Auditorium",
            status: "Pending",
        },
        {
            id: "EVT-1012",
            title: "Design Sprint Workshop",
            date: "May 02, 2026",
            venue: "Lab 03",
            status: "Confirmed",
        },
    ];

    return (
        <div className="space-y-6 text-white">
            <div className="overflow-hidden rounded-4xl border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
                <div className="border-b border-white/10 px-6 py-6 md:px-8">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">{userRole} events</p>
                    <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Registered Events</h2>
                    <p className="mt-3 text-sm leading-6 text-white/60 md:text-base">List of events you already registered for.</p>
                </div>

                <div className="space-y-4 px-6 py-6 md:px-8">
                    {registeredEvents.map((event) => (
                        <div key={event.id} className="rounded-2xl border border-white/10 bg-[#111110] p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{event.title}</h3>
                                    <p className="mt-1 text-xs text-white/55">Event ID: {event.id}</p>
                                </div>
                                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${event.status === "Confirmed" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}>
                                    {event.status}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-[11px] tracking-[0.2em] text-white/40">DATE</p>
                                    <p className="mt-1 text-sm text-white/80">{event.date}</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                                    <p className="text-[11px] tracking-[0.2em] text-white/40">VENUE</p>
                                    <p className="mt-1 text-sm text-white/80">{event.venue}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RegisterEvent;
