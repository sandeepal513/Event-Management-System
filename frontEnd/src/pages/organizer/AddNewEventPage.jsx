import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { uploadImage } from "../../utils/storageService";

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
    const [ticketsRequired, setTicketsRequired] = useState(false);
    const [ticketsCount, setTicketsCount] = useState(0);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const navigate = useNavigate();

    function buildEventDateTime(selectedDate, selectedTime) {
        const [year, month, day] = selectedDate.split("-").map(Number);
        const [hours, minutes] = selectedTime.split(":").map(Number);
        return new Date(year, month - 1, day, hours, minutes, 0, 0);
    }

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
                toast.error("Failed to fetch options");
            } finally {
                setLoading(false);
            }
        }
        fetchOptions();
    }, []);

    useEffect(() => {
        if (!imageFile) {
            setImagePreview("");
            return;
        }

        const previewUrl = URL.createObjectURL(imageFile);
        setImagePreview(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [imageFile]);

    function handleImageChange(e) {
        const selectedImage = e.target.files?.[0] || null;

        if (!selectedImage) {
            setImageFile(null);
            return;
        }

        if (!selectedImage.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            e.target.value = "";
            setImageFile(null);
            return;
        }

        setImageFile(selectedImage);
    }

    async function addEvent() {

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

        

        if (!title || !description || !date || !time || !category || !venue || !society) {
            toast.error("Please fill in all fields");
            return;
        }

        const eventDateTime = buildEventDateTime(date, time);
        if (eventDateTime <= new Date()) {
            toast.error("Event date and time must be in the future");
            return;
        }

        try {
            setAdding(true);
            let imageUrl = null;

            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
                if (!imageUrl) {
                    toast.error("Image upload failed");
                    return;
                }
            }

            await axios.post("http://localhost:3000/api/events/add", {
                title: title,
                description: description,
                date: date,
                time: `${time}:00`,
                categoryId: category,
                organizerId: organizerId,
                venueId: venue,
                societyId: society,
                ticketRequired: ticketsRequired,
                ticketsCount: ticketsRequired ? Number(ticketsCount) : 0,
                imageUrl: imageUrl,
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

                <label className="flex flex-col gap-2 md:col-span-2">
                    <span className="text-sm text-white/70">Event Image (Optional)</span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white file:mr-4 file:rounded-md file:border-0 file:bg-sky-600 file:px-3 file:py-1 file:text-sm file:font-medium file:text-white hover:file:bg-sky-700"
                    />
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="Selected event"
                            className="mt-2 h-40 w-full max-w-md rounded-lg border border-white/10 object-cover"
                        />
                    )}
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

                <label className="flex flex-col gap-2">
                    <span className="text-sm text-white/70">Ticket Required</span>
                    <select
                        value={ticketsRequired ? "true" : "false"}
                        onChange={(e) => {
                            const requiresTickets = e.target.value === "true";
                            setTicketsRequired(requiresTickets);
                            if (!requiresTickets) {
                                setTicketsCount(0);
                            }
                        }}
                        className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
                    >
                        <option value="false">false</option>
                        <option value="true">true</option>
                    </select>
                </label>

                <label className="flex flex-col gap-2">
                    <span className="text-sm text-white/70">Tickets Count</span>
                    {ticketsRequired ? (
                        <input
                            type="number"
                            min="0"
                            value={ticketsCount}
                            onChange={(e) => setTicketsCount(e.target.value)}
                            className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
                            placeholder="Enter ticket count"
                        />
                    ) : (
                        <input
                            value="No Tickets Required"
                            disabled
                            className="rounded-lg border border-white/10 bg-[#232320] px-3 py-2 text-white/70 outline-none"
                        />
                    )}
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