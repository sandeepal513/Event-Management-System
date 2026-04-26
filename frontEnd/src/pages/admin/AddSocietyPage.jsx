import { useState } from "react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function AddSocietyPage() {
  const { societyId } = useParams();
  const location = useLocation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(Boolean(societyId));
  const [adding, setAdding] = useState(false);
  const navigate = useNavigate();

  const isEditMode = Boolean(societyId);

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    const societyState = location.state?.society ?? location.state;
    if (societyState && Number(societyState.id) === Number(societyId)) {
      setName(societyState.name || "");
      setDescription(societyState.description || "");
      setLoading(false);
      return;
    }

    const fetchSociety = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/societies/${societyId}`);
        const society = response?.data?.data;
        setName(society.name);
        setDescription(society.description);
      } catch (error) {
        console.error("Failed to load society", error);
        toast.error("Unable to load society details.");
        navigate("/admin/societies");
      } finally {
        setLoading(false);
      }
    };

    fetchSociety();
  }, [isEditMode, location.state, navigate, societyId]);

  const handleAddSociety = async (event) => {
    event.preventDefault();

    if (!name.trim() || !description.trim()) {
      toast.error("Please provide society name and description.");
      return;
    }

    setAdding(true);
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:3000/api/v1/societies/${societyId}`, {
          name: name.trim(),
          description: description.trim(),
        });
        toast.success("Society updated successfully");
      } else {
        await axios.post("http://localhost:3000/api/v1/societies", {
          name: name.trim(),
          description: description.trim(),
        });
        toast.success("Society added successfully");
      }

      navigate("/admin/societies");
    } catch (error) {
      console.error("Failed to save society", error);
      const message =
        error?.response?.data?.message ||
        "Unable to save society. It may already exist.";
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-white">Loading society details...</div>;
  }

  return (
    <div className="min-h-full w-full bg-[#2e2e2c] p-4 text-white">
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#1e1e1c] px-4 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-white/50">Admin / Societies / {isEditMode ? "Update Society" : "Add Society"}</p>
          <h1 className="text-2xl font-semibold">{isEditMode ? "Update Society" : "Add New Society"}</h1>
        </div>
        <Link
          to="/admin/societies"
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80 hover:text-white"
        >
          Back to societies
        </Link>
      </div>

      <form onSubmit={handleAddSociety} className="grid gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Society Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-white/10 bg-[#2a2a27] px-3 py-2 text-white outline-none focus:border-sky-400"
            placeholder="Enter society name"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-white/70">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="6"
            className="rounded-xl border border-white/10 bg-[#2a2a27] px-3 py-3 text-white outline-none focus:border-sky-400"
            placeholder="Add a short description about this society"
          />
        </label>

        <div className="flex flex-col items-start gap-3 pt-2">
          <button
            type="submit"
            disabled={adding}
            className="inline-flex items-center justify-center rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-sky-700"
          >
            {adding ? (isEditMode ? "Saving society..." : "Adding society...") : (isEditMode ? "Update Society" : "Add Society")}
          </button>
          <p className="max-w-xl text-sm text-white/60">
            {isEditMode
              ? "Save changes to update this society for all event assignment forms."
              : "After adding a society, organizers can assign events to it during event creation."}
          </p>
        </div>
      </form>
    </div>
  );
}
