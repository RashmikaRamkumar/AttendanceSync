import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Lock, User, Shield } from "lucide-react";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const ChangePasswordForm = () => {
  const [formData, setFormData] = useState({
    role: "User",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword.length < 6) {
      setMessage({
        text: "New password must be at least 6 characters long",
        type: "error",
      });
      return;
    }
    if (formData.newPassword !== formData.confirmNewPassword) {
      setMessage({
        text: "New passwords do not match",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const endpoint = `${backendURL}/api/auth/user/change-password`;
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        setMessage({
          text: "You must be logged in to change your password",
          type: "error",
        });
        setLoading(false);
        return;
      }
      const response = await axios.put(
        endpoint,
        {
          role: formData.role,
          username: formData.username,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setMessage({
          text: "Password changed successfully!",
          type: "success",
        });
        setFormData({
          role: "User",
          username: "",
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      } else {
        setMessage({
          text: response.data.message || "Failed to change password",
          type: "error",
        });
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Error changing password. Please try again.";
      setMessage({ text: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center py-8 px-2">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="mb-2 text-2xl font-bold text-slate-900">
            Change Password
          </h1>
        </div>

        {/* Form Card */}
        <div className="p-8 bg-white rounded-xl border shadow-lg border-slate-200">
          {/* Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                message.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {message.type === "success" ? (
                    <div className="flex justify-center items-center w-5 h-5 bg-green-500 rounded-full">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center w-5 h-5 bg-red-500 rounded-full">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Account Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="px-4 py-3 w-full rounded-lg border transition-colors border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="User">User</option>
              </select>
            </div>

            {/* Username */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 w-5 h-5 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="py-3 pr-4 pl-10 w-full rounded-lg border transition-colors border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            {/* Current Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 w-5 h-5 transform -translate-y-1/2 text-slate-400" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  className="py-3 pr-12 pl-10 w-full rounded-lg border transition-colors border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transition-colors transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 w-5 h-5 transform -translate-y-1/2 text-slate-400" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  className="py-3 pr-12 pl-10 w-full rounded-lg border transition-colors border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transition-colors transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 w-5 h-5 transform -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmNewPassword"
                  value={formData.confirmNewPassword}
                  onChange={handleChange}
                  required
                  className="py-3 pr-12 pl-10 w-full rounded-lg border transition-colors border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transition-colors transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-3 w-full font-medium text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <svg
                    className="mr-3 -ml-1 w-5 h-5 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating Password...
                </div>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordForm;
