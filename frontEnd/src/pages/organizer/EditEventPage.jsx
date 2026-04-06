import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function EditEventPage() {

    const location = useLocation();
    console.log("Location state:", location.state);

    const [id, setId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [venue, setVenue] = useState("");
    const [society, setSociety] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [venues, setVenues] = useState([]);
    const [societies, setSocieties] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchOptions() {
            try {
                const venuesRes = await axios.get("http://localhost:3000/api/venues/all");
                const societiesRes = await axios.get("http://localhost:3000/api/v1/societies");
                setVenues(venuesRes.data);
                setSocieties(societiesRes.data.data);
            } catch (err) {
                toast.error("Failed to fetch venues or societies");
                console.error("Failed to fetch venues or societies", err);
            }
        }
        fetchOptions();
    }, []);

    useEffect(() => {
        if (!location.state) {
            navigate("/organizer/events");
        } else {
            setId(location.state.id || "");
            setTitle(location.state.title || "");
            setDescription(location.state.description || "");
            setDate(location.state.date || "");
            setTime((location.state.time || "").toString().slice(0, 5));
            setVenue(location.state.venue?.id || "");
            setSociety(location.state.society?.id || "");
            setLoading(false);
        }
    }, [location.state, navigate]);

    async function updateEvent() {

        if (!title || !description || !date || !time || !venue || !society) {
            toast.error("Please fill in all fields");
            return;
        }
        try {
            setSaving(true);
            await axios.put("http://localhost:3000/api/events/update/" + id, {
                title: title,
                description: description,
                date: date,
                time: `${time}:00`,
                venueId: venue,
                societyId: society,
            });
            toast.success("Event updated successfully");
            navigate("/organizer/events");
        } catch (error) {
            console.error("Error updating event:", error);
            toast.error("Failed to update event");
            return;
        } finally {
            setSaving(false);
        }


    }

    if (loading) {
        return <p className="p-4 text-white">Loading event...</p>;
    }

    return (
        <div className="min-h-full w-full bg-[#2e2e2c] p-4 text-white">
            <div className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#1e1e1c] px-4 py-3">
                <div>
                    <p className="text-sm text-white/50">Organizer / Events / Edit</p>
                    <h1 className="text-2xl font-semibold">Edit Event</h1>
                </div>
                <Link to="/organizer/events" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white">
                    Back
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                    <span className="text-sm text-white/70">Title</span>
                    <input
                        name="title"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value)
                        }}
                        className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
                        placeholder="Event title"
                    />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm text-white/70">Date</span>
                    <input
                        type="date"
                        name="date"
                        value={date}
                        onChange={(e) => {
                            setDate(e.target.value)
                        }}
                        className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
                    />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm text-white/70">Time</span>
                    <input
                        type="time"
                        name="time"
                        value={time}
                        onChange={(e) => {
                            setTime(e.target.value)
                        }}
                        className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
                    />
                </label>

                <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-sm text-white/70">Description</span>
                    <textarea
                        name="description"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value)
                        }}
                        rows="5"
                        className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
                        placeholder="Event description"
                    />
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm text-white/70">Venue</span>
                    <select
                        value={venue}
                        onChange={(e) => setVenue(parseInt(e.target.value))}
                        className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
                    >
                        <option value="">Select Venue</option>
                        {venues.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm text-white/70">Society</span>
                    <select
                        value={society}
                        onChange={(e) => setSociety(parseInt(e.target.value))}
                        className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
                    >
                        <option value="">Select Society</option>
                        {societies.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="mt-6 flex gap-3">
                <button
                    onClick={updateEvent}
                    disabled={saving}
                    className="rounded-lg bg-sky-500 px-5 py-2 font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
                <Link
                    to="/organizer/events"
                    className="rounded-lg border border-white/15 px-5 py-2 font-medium text-white/80 hover:text-white"
                >
                    Cancel
                </Link>
            </div>
        </div>
    );
}