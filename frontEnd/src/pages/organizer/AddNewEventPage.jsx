import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function AddNewEventPage() {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [category, setCategory] = useState("");
    const [venue, setVenue] = useState("");
    const [society, setSociety] = useState("");
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [categories, setCategories] = useState([]);
    const [venues, setVenues] = useState([]);
    const [societies, setSocieties] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchOptions() {
            try {
                const categoriesRes = await axios.get("http://localhost:3000/api/categories/all");
                const venuesRes = await axios.get("http://localhost:3000/api/venues/all");
                const societiesRes = await axios.get("http://localhost:3000/api/v1/societies");
                setCategories(categoriesRes.data);
                console.log("Venues:", venuesRes.data);
                console.log("Societies:", societiesRes.data);
                setVenues(venuesRes.data);
                setSocieties(societiesRes.data.data);
            } catch (err) {
                console.error("Failed to fetch options", err);
            } finally {
                setLoading(false);
            }
        }
        fetchOptions();
    }, []);

    async function addEvent() {

        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "null");

        if (!loggedInUser?.id) {
            toast.error("Please login again");
            navigate("/auth/login");
            return;
        }

        if (!title || !description || !date || !time || !category || !venue || !society) {
            toast.error("Please fill in all fields");
            return;
        }
        try {
            setAdding(true);
            await axios.post("http://localhost:3000/api/events/add", {
                title: title,
                description: description,
                date: date,
                time: `${time}:00`,
                categoryId: category,
                organizerId: loggedInUser.id,
                venueId: venue,
                societyId: society,
            });
            toast.success("Event added successfully");
            navigate("/organizer/events");
        } catch (error) {
            console.error("Error adding event:", error);
            toast.error("Failed to add event");
            return;
        } finally {
            setAdding(false);
        }


    }

    if (loading) {
        return <p className="p-4 text-white">Loading event...</p>;
    }

    return (
        <div className="min-h-full w-full bg-[#2e2e2c] p-4 text-white">
            <div className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#1e1e1c] px-4 py-3">
                <div>
                    <p className="text-sm text-white/50">Organizer / Events / Add New</p>
                    <h1 className="text-2xl font-semibold">Add New Event</h1>
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

                <label className="flex flex-col gap-2">
                    <span className="text-sm text-white/70">Category</span>
                    <select
                        value={category}
                        onChange={(e) => setCategory(parseInt(e.target.value))}
                        className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
                    >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
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
                    onClick={addEvent}
                    disabled={adding}
                    className="rounded-lg bg-sky-500 px-5 py-2 font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {adding ? "Adding..." : "Add Event"}
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