import { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiCamera, FiEdit3, FiSave } from "react-icons/fi";
import { uploadProfileImage } from "../utils/storageService";

const defaultAvatar = "/defaultAvatart.svg";

const ProfilePage = () => {

    const [isLoading, setLoading] = useState(false);
    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [profileImage, setProfileImage] = useState(defaultAvatar);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [profile, setProfile] = useState({
        id: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        create_at: "",
        image: defaultAvatar,
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const username = localStorage.getItem("username");
                const userRole = localStorage.getItem("userRole");
                if (!username) {
                    toast.error("user not found");
                    return;
                }

                const response = await axios.get(`http://localhost:3000/api/v1/users/username/${username}`);
                const user = response?.data?.data;

                if (!user) {
                    toast.error("user not found");
                    return;
                }

                const fullName = String(user.name).trim();
                const parts = fullName ? fullName.split(/\s+/) : [];
                const firstName = parts[0];
                const lastName = parts.slice(1).join(" ");

                setProfile({
                    id: user.id,
                    firstName,
                    lastName,
                    email: user.email,
                    phone: user.phoneNo,
                    role: userRole,
                    create_at:  user.createAt,
                    image: user.image || defaultAvatar,
                });

                if (user.image) {
                    setProfileImage(user.image);
                }
            } catch (error) {
                const message = error.response?.data?.message || "Server error. Please try again.";
                toast.error(message);
            }
        };

        loadProfile();
    }, []);


    const updateProfile = async () => {
        setLoading(true);
        try {
            if (!profile.id) {
                toast.error("User ID not found");
                return false;
            }

            let imageUrl = profile.image || defaultAvatar;

            if (selectedImageFile) {
                const uploadedUrl = await uploadProfileImage(selectedImageFile);
                if (!uploadedUrl) {
                    toast.error("Profile image upload failed");
                    return false;
                }
                imageUrl = uploadedUrl;
            }

            const payload = {
                name: `${profile.firstName} ${profile.lastName}`.trim(),
                email: profile.email,
                phoneNo: profile.phone,
                image: imageUrl,
            };

            await axios.put(`http://localhost:3000/api/v1/users/${profile.id}`, payload);
            setProfile((current) => ({ ...current, image: imageUrl }));
            setProfileImage(imageUrl);
            setSelectedImageFile(null);
            toast.success("Profile updated successfully");
            return true;
        } catch (error) {
            const message = error.response?.data?.message || "Failed to update profile";
            toast.error(message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    function handleImageClick() {
        if (!isEditing) return;
        fileInputRef.current?.click();
    }

    function handleImageChange(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);
        setSelectedImageFile(file);
        setProfileImage(imageUrl || defaultAvatar);
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setProfile((current) => ({ ...current, [name]: value }));
    }

    async function handleSave() {
        setIsSaving(true);
        const updated = await updateProfile();
        if (updated) {
            setIsEditing(false);
        }
        setIsSaving(false);
    }

    return (
        <div className="space-y-6 text-white">
            <div className="overflow-hidden rounded-4xl border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
                <div className="border-b border-white/10 px-6 py-6 md:px-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-[11px] uppercase tracking-[0.32em] text-white/45">{profile.role} account</p>
                            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Profile</h2>
                            <p className="mt-3 text-sm leading-6 text-white/60 md:text-base">
                                View your profile details and switch to edit mode when you want to update them.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 self-start md:self-auto">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10"
                                >
                                    <FiEdit3 />
                                    Edit
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <FiSave />
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 px-6 py-6 md:grid-cols-[260px_1fr] md:px-8">
                    <div className="flex flex-col items-center rounded-3xl border border-white/10 bg-[#111110] p-5 text-center">
                        <button
                            type="button"
                            onClick={handleImageClick}
                            className={`group relative h-40 w-40 overflow-hidden rounded-full border border-white/10 ${isEditing ? "cursor-pointer" : "cursor-default"}`}
                            aria-label="Change profile picture"
                        >
                            <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                            {isEditing && (
                                <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition group-hover:opacity-100">
                                    <span className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm">
                                        <FiCamera />
                                        Change Photo
                                    </span>
                                </span>
                            )}
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />

                        <h3 className="mt-4 text-xl font-semibold text-white">{profile.firstName} {profile.lastName}</h3>
                        <p className="mt-1 text-sm text-white/55">Student</p>
                        <p className="mt-3 text-xs text-white/45">Profile photo and personal details</p>
                    </div>

                    <form className="grid gap-4 sm:grid-cols-2">
                        <input name="userId" type="hidden" value={profile.id} />

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/75">First Name</label>
                            <input
                                name="firstName"
                                type="text"
                                value={profile.firstName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-xl border border-white/10 bg-[#111110] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-400/45 disabled:cursor-default disabled:opacity-80"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/75">Last Name</label>
                            <input
                                name="lastName"
                                type="text"
                                value={profile.lastName}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-xl border border-white/10 bg-[#111110] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-400/45 disabled:cursor-default disabled:opacity-80"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-white/75">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={profile.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-xl border border-white/10 bg-[#111110] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-400/45 disabled:cursor-default disabled:opacity-80"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/75">Phone</label>
                            <input
                                name="phone"
                                type="text"
                                value={profile.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-xl border border-white/10 bg-[#111110] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-400/45 disabled:cursor-default disabled:opacity-80"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-white/75">Joined at</label>
                            <input
                                name="create_at"
                                type="text"
                                value={profile.create_at ? String(profile.create_at).split("T")[0] : "N/A"}
                                disabled={true}
                                className="w-full rounded-xl border border-white/10 bg-[#111110] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-400/45 disabled:cursor-default disabled:opacity-80"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
