import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DeleteAccount = () => {

    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [userRole, setUserRole] = useState("student");
    const [enterUsername, setEnterUsername] = useState('');
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        const username = localStorage.getItem("username");
        username != null ? setUsername(username) : setUsername('');
        
        const userRole = localStorage.getItem("userRole");
        setUserRole(userRole || "student");
    }, []);


    const deleteAccount = async (e) => {
        e.preventDefault();

        if (!enterUsername) {
            toast.error("Field is required");
            return;
        }

        if (!username) {
            toast.error("User not found");
            return;
        }

        setLoading(true);
        try {
            if (username !== enterUsername.trim()) {
                toast.error("Username does not match");
                return;   
            }

            const userResponse = await axios.get(
                `http://localhost:3000/api/v1/users/username/${encodeURIComponent(username)}`
            );

            if (!userResponse?.data?.success || !userResponse?.data?.data?.id) {
                toast.error("User not found");
                return;
            }

            const userId = userResponse.data.data.id;

            const response = await axios.delete(`http://localhost:3000/api/v1/users/${userId}`);

            if (!response?.data?.success) {
                toast.error("Account delete failed");
                return;
            }

            localStorage.removeItem("token");
            localStorage.removeItem("username");
            localStorage.removeItem("userRole");
            toast.success("Account deleted successfully");
            navigate('/auth/login');
            
        } catch (error) {
            const message = error?.response?.data?.message || "Server error. Try again.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 text-white">
            <div className="overflow-hidden rounded-4xl border border-rose-400/30 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
                <div className="border-b border-rose-400/25 px-6 py-6 md:px-8">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-rose-200/65">{userRole} danger zone</p>
                    <h2 className="mt-2 text-3xl font-semibold text-rose-300 md:text-4xl">Delete Account</h2>
                    <p className="mt-3 text-sm leading-6 text-white/60 md:text-base">
                        This action is permanent. Type a confirmation phrase before deleting your account.
                    </p>
                </div>

                <form className="space-y-4 px-6 py-6 md:px-8 w-full" onSubmit={deleteAccount}>
                <div>
                    <label className="mb-2 block text-sm font-medium text-white/75">
                        Type {username ? "'" + username + "'" : 'Delete'} to confirm
                    </label>
                    <input 
                        type="text"
                        name="username"
                        value={enterUsername}
                        onChange={(e) => {setEnterUsername(e.target.value)}}
                        placeholder={username ? username : 'Delete'} 
                        className="w-full rounded-xl border border-white/10 bg-[#111110] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-rose-400/45" 
                    />
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="rounded-xl bg-rose-600 px-4 py-2.5 
                    text-sm font-medium text-white transition
                    hover:bg-rose-500"
                >
                    {isLoading ? "Deleting..." : "Delete My Account"}
                </button>
            </form>
        </div>
        </div>
    );
};

export default DeleteAccount;
