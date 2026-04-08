import { useState, useEffect } from "react";

const Tickets = () => {

    const [userRole, setUserRole] = useState("student");

    useEffect(() => {
            const userRole = localStorage.getItem("userRole");
            setUserRole(userRole);
    }, []);

    return (
        <div className="space-y-6 text-white">
            <div className="overflow-hidden rounded-4xl border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
                <div className="border-b border-white/10 px-6 py-6 md:px-8">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">{userRole} tickets</p>
                    <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Tickets</h2>
                    <p className="mt-3 text-sm leading-6 text-white/60 md:text-base">View your registered event tickets and identifiers.</p>
                </div>

                <div className="space-y-3 px-6 py-6 md:px-8">
                    <div className="rounded-2xl border border-white/10 bg-[#111110] p-4">
                        <p className="text-sm font-semibold text-white">Tech Meetup 2026</p>
                        <p className="text-xs text-white/55">Ticket ID: TCK-001245</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#111110] p-4">
                        <p className="text-sm font-semibold text-white">Startup Pitch Night</p>
                        <p className="text-xs text-white/55">Ticket ID: TCK-001300</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tickets;
