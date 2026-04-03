import axios from "axios";
import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Events() {

    const [events, setEvents] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if(!loaded){
            axios.get()
        }
    }, []);

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
                    <input type="text" placeholder="Search events..." className="w-[250px] h-[35px] mr-3 bg-[#272725] text-amber-50 p-2 border border-gray-700 rounded-lg" />
                    <Link to="/organizer/events/new" className="bg-blue-400 text-white text-sm mr-5 p-2 rounded-lg"> + Add Event</Link>
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
        </div>
    );
}