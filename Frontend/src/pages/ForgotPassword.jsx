import { useState } from "react";
import { forgotPassword } from "../services/user/authService";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { Mail } from "lucide-react";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
  e.preventDefault();

  setEmailError("");

  if (!email.trim()) {
    setEmailError("Email is required");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setEmailError("Enter a valid email address");
    return;
  }

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

<p className="text-center text-gray-400 mb-8">
  Forgot your password?
</p>

        <form onSubmit={handleSendOtp}>
          <div className="relative mb-5">
  <Mail
    size={20}
    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
  />

  <input
    type="email"
    placeholder="Email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
onBlur={() => {
  if (!email.trim()) {
    setEmailError("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setEmailError("Enter a valid email address");
  } else {
    setEmailError("");
  }
}}
    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 pl-12 outline-none focus:border-violet-500"
  />
</div>

{emailError && (
  <p className="text-red-400 text-sm -mt-2 mb-5">
    {emailError}
  </p>
)}

          <button
  disabled={loading}
  className={`w-full rounded-2xl py-4 font-semibold transition ${
    loading
      ? "bg-violet-400 cursor-not-allowed"
      : "bg-violet-600 hover:bg-violet-700"
  }`}
>
  {loading ? "Sending OTP..." : "Send OTP"}
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

export default ForgotPassword;
