import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { MdSearch, MdDelete } from "react-icons/md";

const defaultAvatar = "/defaultAvatart.svg";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModalData, setDeleteModalData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const roleColors = {
    admin: "bg-red-500/20 text-red-300 border-red-500/30",
    organizer: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    student: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get("http://localhost:3000/api/v1/users");
        const usersData = response?.data?.data || [];
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        const message = error.response?.data?.message || "Failed to fetch users";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = users.filter((user) => {
      const name = String(user.name || "").toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const phone = String(user.phoneNo || "").toLowerCase();
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((user) => user.id)));
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    setDeleteModalData({ userId, userName, isBulk: false });
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) return;
    setDeleteModalData({ userIds: Array.from(selectedUsers), isBulk: true });
  };

  const confirmDelete = async () => {
    if (!deleteModalData) return;
    setIsDeleting(true);
    try {
      if (deleteModalData.isBulk) {
        // Bulk delete
        await Promise.all(
          deleteModalData.userIds.map((userId) =>
            axios.delete(`http://localhost:3000/api/v1/users/${userId}`)
          )
        );
        setUsers((prevUsers) =>
          prevUsers.filter((user) => !deleteModalData.userIds.includes(user.id))
        );
        toast.success(`${deleteModalData.userIds.length} user(s) deleted successfully`);
        setSelectedUsers(new Set());
      } else {
        // Single delete
        await axios.delete(`http://localhost:3000/api/v1/users/${deleteModalData.userId}`);
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== deleteModalData.userId));
        toast.success("User deleted successfully");
      }
      setDeleteModalData(null);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete user";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalData(null);
  };

  return (
    <div className="space-y-6 text-white">
      <div className="overflow-hidden rounded-4xl border border-white/10 bg-[#1c1c1a] shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
        {/* Header */}
        <div className="border-b border-white/10 px-6 py-6 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Users</h2>
              <p className="mt-3 text-sm leading-6 text-white/60 md:text-base">
                Manage and view all system users
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar and Actions */}
        <div className="border-b border-white/10 px-6 py-4 md:px-8 space-y-3">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-white/40" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#111110] pl-10 pr-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-sky-400/45"
            />
          </div>

          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-white/10 bg-[#111110] cursor-pointer"
                />
                <span className="text-sm text-white/70">
                  {selectedUsers.size > 0
                    ? `${selectedUsers.size} selected`
                    : "Select all"}
                </span>
              </label>

              {selectedUsers.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition text-sm font-medium"
                >
                  Delete {selectedUsers.size} user{selectedUsers.size > 1 ? "s" : ""}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="px-6 py-6 md:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/60">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-white/60">No users found</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between gap-4 rounded-2xl border p-4 transition ${
                    selectedUsers.has(user.id)
                      ? "border-sky-400/50 bg-sky-400/10"
                      : "border-white/10 bg-[#111110] hover:bg-white/5"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="w-4 h-4 rounded shrink-0 border-white/10 bg-[#111110] cursor-pointer"
                  />
                  <img
                    src={user.image || defaultAvatar}
                    alt={user.name}
                    className="h-12 w-12 shrink-0 rounded-full object-cover border border-white/10"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </h3>
                    <p className="truncate text-xs text-white/50 mt-1">
                      {user.email}
                    </p>
                    <p className="truncate text-xs text-white/50">
                      {user.phoneNo}
                    </p>
                  </div>

                  <div className="ml-4 shrink-0 flex items-center gap-3">
                    <span
                      className={`inline-block px-3 py-1.5 text-xs font-medium rounded-full border ${
                        roleColors[user.role?.toLowerCase()] ||
                        "bg-gray-500/20 text-gray-300 border-gray-500/30"
                      }`}
                    >
                      {user.role}
                    </span>
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition"
                      title="Delete user"
                    >
                      <MdDelete className="text-lg" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredUsers.length > 0 && (
            <p className="mt-4 text-xs text-white/40 text-center">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-md">
          <div className="w-96 rounded-2xl border border-white/10 bg-[#1c1c1a] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.38)]">
            <h3 className="text-xl font-semibold text-white">
              {deleteModalData.isBulk ? "Delete Multiple Users" : "Delete User"}
            </h3>
            <p className="mt-2 text-sm text-white/60">
              {deleteModalData.isBulk ? (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-white">{deleteModalData.userIds.length} user(s)</span>? This
                  action cannot be undone.
                </>
              ) : (
                <>
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-white">{deleteModalData.userName}</span>? This action cannot be
                  undone.
                </>
              )}
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersList;
