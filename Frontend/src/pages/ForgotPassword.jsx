import { useState } from "react";
import { forgotPassword } from "../services/user/authService";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await forgotPassword(email);

      toast.success("OTP sent successfully");

      navigate("/verify-otp", {
        state: { email },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="bg-slate-900 p-10 rounded-3xl w-[450px]">
        <h1 className="text-3xl font-bold mb-6">Forgot Password</h1>

        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-800 rounded-2xl px-5 py-4 mb-5"
          />

          <button
            disabled={loading}
            className={`w-full rounded-2xl py-4 ${
              loading
                ? "bg-violet-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
