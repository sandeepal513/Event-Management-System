import { useNavigate } from "react-router-dom";

const Logout = () => {
    const navigate = useNavigate();

    const handleConfirmLogout = () => {
        localStorage.clear();
        navigate("/auth/login", { replace: true });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-transparent px-4 py-10">
            <div
                className="absolute inset-0 bg-black/35 backdrop-blur-md"
                onClick={() => navigate(-1)}
                aria-hidden="true"
            />

            <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/15 bg-[#1c1c1a]/95 p-6 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">Logout confirmation</p>
                <h1 className="mt-3 text-3xl font-semibold">Are you sure?</h1>
                <p className="mt-3 text-sm leading-6 text-white/60">
                    You are about to sign out. This will clear all items from local storage on this browser.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirmLogout}
                        className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-rose-500"
                    >
                        Confirm Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Logout;