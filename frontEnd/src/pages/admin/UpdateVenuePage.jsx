import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function UpdateVenuePage() {
  const { venueId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const venueState = location.state?.venue ?? location.state;

    if (venueState && Number(venueId) === Number(venueState.id)) {
      setName(venueState.name || "");
      setCapacity(venueState.capacity ?? "");
      setDescription(venueState.description || "");
      setLoading(false);
      return;
    }

    const fetchVenue = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/venues/${venueId}`);
        const venue = response.data;
        setName(venue.name || "");
        setCapacity(venue.capacity ?? "");
        setDescription(venue.description || "");
      } catch (error) {
        console.error("Failed to load venue", error);
        toast.error("Unable to load venue details.");
        navigate("/admin/venues");
      } finally {
        setLoading(false);
      }
    };

    fetchVenue();
  }, [location.state, navigate, venueId]);

  const handleUpdateVenue = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Please provide venue name.");
      return;
    }

    setSaving(true);
    try {
      await axios.put(`http://localhost:3000/api/venues/update/${venueId}`, {
        name: name.trim(),
        capacity: Number(capacity) || 0,
        description: description.trim(),
      });
      toast.success("Venue updated successfully");
      navigate("/admin/venues");
    } catch (error) {
      console.error("Failed to update venue", error);
      toast.error("Unable to update venue");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-white">Loading venue details...</div>;
  }

  return (
    <div className="min-h-full w-full bg-[#2e2e2c] p-4 text-white">
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#1e1e1c] px-4 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-white/50">Admin / Venues / Update Venue</p>
          <h1 className="text-2xl font-semibold">Update Venue</h1>
        </div>
        <Link to="/admin/venues" className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white">
          Back to venue list
        </Link>
      </div>

      <form onSubmit={handleUpdateVenue} className="grid gap-5 md:grid-cols-2">
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
            disabled={saving}
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-700"
          >
            {saving ? "Saving venue..." : "Update Venue"}
          </button>
          <p className="max-w-xl text-sm text-white/60">
            Update the venue details and save to apply the changes.
          </p>
        </div>
      </form>
    </div>
  );
}
