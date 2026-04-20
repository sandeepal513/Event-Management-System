import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function AddVenuePage() {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const handleAddVenue = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Please provide venue name.");
      return;
    }

    setAdding(true);
    try {
      await axios.post("http://localhost:3000/api/venues/add", {
        name: name.trim(),
        capacity: Number(capacity) || 0,
        description: description.trim(),
      });

      toast.success("Venue added successfully");
      navigate("/admin/venues");
    } catch (error) {
      console.error("Failed to add venue", error);
      toast.error("Unable to add venue");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-full w-full bg-[#2e2e2c] p-4 text-white">
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#1e1e1c] px-4 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-white/50">Admin / Venues / Add Venue</p>
          <h1 className="text-2xl font-semibold">Add New Venue</h1>
        </div>
        <Link to="/admin/venues" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white">
          Back to venue list
        </Link>
      </div>

      <form onSubmit={handleAddVenue} className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Venue Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
            placeholder="Enter venue name"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Capacity</span>
          <input
            type="number"
            min="0"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
            placeholder="Maximum attendees"
          />
        </label>

        <label className="flex flex-col gap-2 md:col-span-2">
          <span className="text-sm text-white/70">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="5"
            className="rounded-xl border border-white/10 bg-[#2a2a27] px-3 py-3 text-white outline-none focus:border-sky-400"
            placeholder="Optional venue notes, features, or special instructions"
          />
        </label>

        <div className="md:col-span-2 flex flex-col items-start gap-3 pt-2">
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-700"
          >
            {adding ? "Adding venue..." : "Add Venue"}
          </button>
          <p className="max-w-xl text-sm text-white/60">
            Once added, the new venue will become available for event creation and venue management.
          </p>
        </div>
      </form>
    </div>
  );
}
