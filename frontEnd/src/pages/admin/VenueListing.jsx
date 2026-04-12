import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function VenueListing() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchVenues = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/venues/all");
        if (mounted) {
          setVenues(Array.isArray(response.data) ? response.data : []);
        }
      } catch (fetchError) {
        console.error("Failed to load venues", fetchError);
        if (mounted) setError("Unable to load venues right now.");
        toast.error("Failed to load venues");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchVenues();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredVenues = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return venues.filter((venue) => {
      const name = venue.name || "";
      const location = venue.location || "";
      const description = venue.description || "";
      return [name, location, description]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [query, venues]);

  const handleDeleteVenue = (venueId, venueName) => {
    setConfirmDeleteId(venueId);
    setConfirmDeleteName(venueName || "this venue");
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
    setConfirmDeleteName("");
  };

  const confirmDeleteVenue = async () => {
    if (!confirmDeleteId) return;

    setDeletingId(confirmDeleteId);
    try {
      await axios.delete(`http://localhost:3000/api/venues/delete/${confirmDeleteId}`);
      setVenues((prev) => prev.filter((venue) => venue.id !== confirmDeleteId));
      toast.success("Venue deleted successfully");
      cancelDelete();
    } catch (deleteError) {
      console.error("Failed to delete venue", deleteError);
      toast.error("Unable to delete venue");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-3xl border border-white/10 bg-[#1c1c1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Admin / Venues</p>
            <h1 className="mt-2 text-3xl font-semibold">Venue Listing</h1>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Review all venues, search by name or location, and add new venue records for future events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="add"
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-400"
            >
              + Add Venue
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111110] p-5">
            <p className="text-[11px] tracking-[0.22em] text-white/45">TOTAL VENUES</p>
            <p className="mt-3 text-3xl font-semibold text-white">{venues.length}</p>
            <p className="mt-2 text-sm text-white/55">All venues available for events</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111110] p-5">
            <p className="text-[11px] tracking-[0.22em] text-white/45">SEARCH RESULTS</p>
            <p className="mt-3 text-3xl font-semibold text-white">{filteredVenues.length}</p>
            <p className="mt-2 text-sm text-white/55">Venues matching your search</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-[#111110] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white/90">Venue Directory</h2>
              <p className="text-sm text-white/60">Search venue name, location, or description.</p>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search venues"
              className="w-full rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-sky-400 sm:w-[320px]"
            />
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="text-white/70">Loading venues...</p>
            ) : error ? (
              <p className="text-rose-300">{error}</p>
            ) : filteredVenues.length === 0 ? (
              <p className="text-white/60">No venues found.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredVenues.map((venue) => (
                  <div key={venue.id} className="rounded-3xl border border-white/10 bg-[#161616] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{venue.name || "Untitled Venue"}</h3>
                        <p className="mt-1 text-sm text-white/60">{venue.location || "Location not specified"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`edit/${venue.id}`}
                          state={venue}
                          className="rounded-full border border-sky-500 px-3 py-1 text-sm font-medium text-sky-200 transition hover:border-sky-400 hover:text-white"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteVenue(venue.id, venue.name)}
                          disabled={deletingId === venue.id}
                          className="rounded-full border border-rose-500 bg-rose-600/10 px-3 py-1 text-sm font-medium text-rose-200 transition hover:border-rose-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === venue.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-white/60 space-y-3">
                      <p>{venue.description || "No description available."}</p>
                      <p>
                        <span className="font-semibold text-white">Capacity:</span> {venue.capacity ?? "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#121212]/95 p-6 text-white shadow-2xl">
            <h2 className="text-xl font-semibold">Confirm delete</h2>
            <p className="mt-3 text-sm text-white/70">
              Are you sure you want to delete <span className="font-semibold text-white">{confirmDeleteName}</span>?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelDelete}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteVenue}
                disabled={deletingId === confirmDeleteId}
                className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === confirmDeleteId ? "Deleting..." : "Delete venue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
