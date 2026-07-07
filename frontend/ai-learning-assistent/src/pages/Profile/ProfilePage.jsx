import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import authService from "../../services/authService";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState({
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authService.getProfile();
      const profileData = response?.data || response;
      setProfile({
        username: profileData?.username || "",
        email: profileData?.email || "",
      });
    } catch (fetchError) {
      toast.error(fetchError.message || "Failed to load profile");
      console.error("Profile fetch error:", fetchError);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await authService.updateProfile({
        username: profile.username,
        email: profile.email,
      });
      const updatedData = response?.data || response;
      updateUser({
        username: updatedData?.username || profile.username,
        email: updatedData?.email || profile.email,
      });
      toast.success("Profile updated successfully");
      setProfile({
        username: updatedData?.username || profile.username,
        email: updatedData?.email || profile.email,
      });
    } catch (saveError) {
      const message = saveError.message || "Failed to update profile";
      setError(message);
      toast.error(message);
      console.error("Profile save error:", saveError);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password must match.");
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (pwdError) {
      const message = pwdError.message || "Failed to change password";
      setError(message);
      toast.error(message);
      console.error("Change password error:", pwdError);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-center text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Profile Settings"
        subtitle="Update your account details and password."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          onSubmit={handleSaveProfile}
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              User Information
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Update your username and email address.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Username
              <input
                type="text"
                value={profile.username}
                onChange={(e) =>
                  handleProfileChange("username", e.target.value)
                }
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Email Address
              <input
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange("email", e.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-xs text-slate-500">
                Signed in as {user?.email || profile.email}
              </p>
            </div>
            <Button type="submit" disabled={saving} className="px-6 py-3">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        <form
          onSubmit={handlePasswordChange}
          className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Change Password
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Update your account password regularly to keep your account
              secure.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Current Password
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              New Password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Confirm New Password
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition"
              />
            </label>
          </div>

          <Button
            type="submit"
            disabled={passwordLoading}
            className="w-full px-6 py-3"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
