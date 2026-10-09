import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { resetPassword } from "../services/user/authService";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Lock } from "lucide-react";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <Link
        to="/login"
        className="absolute top-8 left-8 text-gray-400 hover:text-violet-400 transition"
      >
        ← Back to Login
      </Link>
      <div className="bg-slate-900 p-10 rounded-3xl w-[450px]">
        <h1 className="text-4xl font-bold text-center mb-2">
          Anime<span className="text-violet-500">Hub</span>
        </h1>

        <p className="text-center text-gray-400 mb-8">Create a New Password</p>
        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();

            setNewPasswordError("");
            setConfirmPasswordError("");

            const strongPassword =
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

            if (!newPassword.trim()) {
              setNewPasswordError("New password is required");
              return;
            }

            if (!strongPassword.test(newPassword)) {
              setNewPasswordError(
                "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
              );
              return;
            }

            if (!confirmPassword.trim()) {
              setConfirmPasswordError("Please enter your password again");
              return;
            }

            if (newPassword !== confirmPassword) {
              setConfirmPasswordError("Passwords do not match");
              return;
            }

            try {
              setLoading(true);

              await resetPassword({
                email,
                newPassword,
              });

              toast.success("Password reset successfully");

              navigate("/login");
            } catch (error) {
              toast.error(
                error.response?.data?.message || "Failed to reset password",
              );
            } finally {
              setLoading(false);
            }
          }}
        >
          {/* New Password */}
          <div>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                }}
                onBlur={() => {
                  const strongPassword =
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;

                  if (!newPassword.trim()) {
                    setNewPasswordError("New password is required");
                  } else if (!strongPassword.test(newPassword)) {
                    setNewPasswordError(
                      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
                    );
                  } else {
                    setNewPasswordError("");
                  }
                }}
                className={`w-full bg-slate-800 rounded-2xl px-5 py-4 pl-12 pr-14 border ${
                  newPasswordError ? "border-red-500" : "border-slate-700"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {newPasswordError && (
              <p className="text-red-400 text-sm mt-2">{newPasswordError}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
                onBlur={() => {
                  if (!confirmPassword.trim()) {
                    setConfirmPasswordError("Please enter your password again");
                  } else if (confirmPassword !== newPassword) {
                    setConfirmPasswordError("Passwords do not match");
                  } else {
                    setConfirmPasswordError("");
                  }
                }}
                className={`w-full bg-slate-800 rounded-2xl px-5 py-4 pl-12 pr-14 border ${
                  confirmPasswordError ? "border-red-500" : "border-slate-700"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {confirmPasswordError && (
              <p className="text-red-400 text-sm mt-2">
                {confirmPasswordError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-2xl py-4 font-semibold transition ${
              loading
                ? "bg-violet-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-8">
          Remember your password?
        </p>

        <Link
          to="/login"
          className="block text-center text-violet-400 hover:text-violet-300 mt-2"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

export default ResetPassword;
