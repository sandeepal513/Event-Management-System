import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function SocietyListing() {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchSocieties = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/v1/societies");
        const societyData = Array.isArray(response?.data?.data) ? response.data.data : [];
        if (mounted) {
          setSocieties(societyData);
        }
      } catch (fetchError) {
        console.error("Failed to load societies", fetchError);
        if (mounted) setError("Unable to load societies right now.");
        toast.error("Failed to load societies");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSocieties();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredSocieties = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return societies;

    return societies.filter((society) => {
      const name = String(society.name || "").toLowerCase();
      const description = String(society.description || "").toLowerCase();
      return name.includes(normalizedQuery) || description.includes(normalizedQuery);
    });
  }, [query, societies]);

  const handleDeleteSociety = (societyId) => {
    setConfirmDeleteId(societyId);
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const confirmDeleteSociety = async () => {
    if (!confirmDeleteId) return;

    setDeletingId(confirmDeleteId);
    try {
      await axios.delete(`http://localhost:3000/api/v1/societies/${confirmDeleteId}`);
      setSocieties((prev) => prev.filter((society) => society.id !== confirmDeleteId));
      toast.success("Society deleted successfully");
      cancelDelete();
    } catch (deleteError) {
      console.error("Failed to delete society", deleteError);
      const message =
        deleteError?.response?.data?.message || "Unable to delete society";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-3xl border border-white/10 bg-[#1c1c1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Admin / Societies</p>
            <h1 className="mt-2 text-3xl font-semibold">Society Management</h1>
            <p className="mt-3 text-sm leading-6 text-white/60">
              View, search, edit, and delete societies used in event creation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="add"
              className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-400"
            >
              + Add Society
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#111110] p-5">
            <p className="text-[11px] tracking-[0.22em] text-white/45">TOTAL SOCIETIES</p>
            <p className="mt-3 text-3xl font-semibold text-white">{societies.length}</p>
            <p className="mt-2 text-sm text-white/55">All societies configured in the system</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#111110] p-5">
            <p className="text-[11px] tracking-[0.22em] text-white/45">SEARCH RESULTS</p>
            <p className="mt-3 text-3xl font-semibold text-white">{filteredSocieties.length}</p>
            <p className="mt-2 text-sm text-white/55">Societies matching your search</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-[#111110] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white/90">Society Directory</h2>
              <p className="text-sm text-white/60">Search by society name or description.</p>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search societies"
              className="w-full rounded-2xl border border-white/10 bg-[#121212] px-4 py-3 text-white outline-none placeholder:text-white/40 focus:border-sky-400 sm:w-[320px]"
            />
          </div>

          <div className="mt-6">
            {loading ? (
              <p className="text-white/70">Loading societies...</p>
            ) : error ? (
              <p className="text-rose-300">{error}</p>
            ) : filteredSocieties.length === 0 ? (
              <p className="text-white/60">No societies found.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredSocieties.map((society) => (
                  <div key={society.id} className="rounded-3xl border border-white/10 bg-[#161616] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white">{society.name || "Untitled Society"}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`edit/${society.id}`}
                          state={society}
                          className="rounded-full border border-sky-500 px-3 py-1 text-sm font-medium text-sky-200 transition hover:border-sky-400 hover:text-white"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteSociety(society.id)}
                          disabled={deletingId === society.id}
                          className="rounded-full border border-rose-500 bg-rose-600/10 px-3 py-1 text-sm font-medium text-rose-200 transition hover:border-rose-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {deletingId === society.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 text-sm text-white/60 space-y-3">
                      <p>{society.description || "No description available."}</p>
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
                onClick={confirmDeleteSociety}
                disabled={deletingId === confirmDeleteId}
                className="rounded-xl bg-rose-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId === confirmDeleteId ? "Deleting..." : "Delete society"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
