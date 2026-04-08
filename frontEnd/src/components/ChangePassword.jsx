import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const ChangePassword = () => {

    const [userRole, setUserRole] = useState("student");
    const [isLoading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    
    useEffect(() => {
        const userRole = localStorage.getItem("userRole");
        setUserRole(userRole);
    }, []);

    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const handlePasswordValidation = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        return passwordRegex.test(password);
    };

    const handlePasswordVerification = () => {
        return formData.newPassword === formData.confirmPassword;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const clearFields = () => {
        setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    const changePassword = async (e) => {
        e.preventDefault();

        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        if (!handlePasswordValidation(formData.newPassword)) {
            toast.error("Password must be at least 8 characters and include uppercase, lowercase, symbol and a number");
            return;
        }

        if (!handlePasswordVerification()) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const username = localStorage.getItem("username");
            if (!username) {
                toast.error("User not found");
                return;
            }

            const email = username.trim();
            const response = await axios.post(
                "http://localhost:3000/api/v1/auth/change-password",
                {
                    email,
                    currentPassword: formData.currentPassword,
                    password: formData.newPassword,
                }
            );

            if (!response?.data?.success) {
                toast.error(response?.data?.message || "Password update failed");
                return;
            }

            setTimeout(() => {
                toast.success("Password updated successfully");
                
            }, 1500);
            clearFields();
        } catch (error) {
            const message = error?.response?.data?.message || "Server error. Try again.";
            toast.error(message);
        } finally {
            setTimeout(() => {
                setLoading(false);
                
            }, 1500)
        }
    };

    return (
        <div className="space-y-6 text-white">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
                <div className="border-b border-white/10 px-6 py-6 md:px-8">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">{userRole} security</p>
                    <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Change Password</h2>
                    <p className="mt-3 text-sm leading-6 text-white/60 md:text-base">Update your password to keep your account secure.</p>
                </div>

                <form className="w-full space-y-4 px-6 py-6 md:px-8" onSubmit={changePassword}>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-white/75">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.currentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-white/10 bg-[#111110] px-3 py-2.5 pr-20 text-sm text-white outline-none focus:border-sky-400/45"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("currentPassword")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-sky-300 hover:bg-white/10"
                            >
                                {showPassword.currentPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-white/75">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.newPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-white/10 bg-[#111110] px-3 py-2.5 pr-20 text-sm text-white outline-none focus:border-sky-400/45"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("newPassword")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-sky-300 hover:bg-white/10"
                            >
                                {showPassword.newPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-white/75">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showPassword.confirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full rounded-xl border border-white/10 bg-[#111110] px-3 py-2.5 pr-20 text-sm text-white outline-none focus:border-sky-400/45"
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility("confirmPassword")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-sky-300 hover:bg-white/10"
                            >
                                {showPassword.confirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isLoading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
