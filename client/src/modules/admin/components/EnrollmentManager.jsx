import React, { useState, useEffect } from "react";
import { X, Trash2, Search, User, UserX, Loader2 } from "lucide-react";
import { getCourseUsers, kickUser } from "../../../services/enrollment.service";
import { useAuth } from "../../../context/AuthContext";

const EnrollmentManager = ({ course, isOpen, onClose }) => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (isOpen && course) {
      loadUsers();
    }
  }, [isOpen, course]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getCourseUsers(course._id, token);
      setUsers(data);
    } catch (err) {
      setError("Failed to load enrolled users");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (
      !window.confirm(
        "Are you sure you want to unenroll this user? They will lose all progress.",
      )
    ) {
      return;
    }

    setRemovingId(userId);
    try {
      await kickUser(course._id, userId, token);
      setUsers(users.filter((u) => u.user._id !== userId));
    } catch (err) {
      alert("Failed to remove user");
    } finally {
      setRemovingId(null);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter(
    (enrollment) =>
      enrollment.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user?.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* ===== HEADER ===== */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Manage Enrollments
            </h2>
            <p className="text-sm text-gray-500">{course?.title}</p>
          </div>

          {/* ✅ DARKER & CLEAR CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="p-2 rounded-full transition
                       text-gray-700 hover:text-black
                       hover:bg-gray-200"
            title="Close"
          >
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* ===== CONTENT ===== */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {/* Search */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <Search
              className="absolute left-3 top-3.5 text-gray-400"
              size={18}
            />
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <UserX size={48} className="mx-auto mb-3 opacity-20" />
                <p>No enrolled users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers.map((enrollment) => (
                  <div
                    key={enrollment._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl
                               hover:bg-white border border-transparent hover:border-gray-200
                               hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {enrollment.user?.name?.charAt(0) || <User size={18} />}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {enrollment.user?.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {enrollment.user?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs font-medium text-gray-700">
                          Progress
                        </p>
                        <p className="text-xs text-gray-500">
                          {enrollment.progress}%
                        </p>
                      </div>

                      <button
                        onClick={() => handleRemoveUser(enrollment.user._id)}
                        disabled={removingId === enrollment.user._id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                        title="Unenroll User"
                      >
                        {removingId === enrollment.user._id ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="p-4 border-t bg-gray-50 rounded-b-2xl text-xs text-gray-500 flex justify-between">
          <span>Total Enrolled: {users.length}</span>
          <span>{filteredUsers.length} shown</span>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentManager;
