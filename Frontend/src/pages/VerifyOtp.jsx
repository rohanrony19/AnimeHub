import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verifyOtp, resendOtp } from "../services/user/authService";
import { toast } from "react-hot-toast";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otpValues];
    updatedOtp[index] = value;

    setOtpValues(updatedOtp);
    setOtp(updatedOtp.join(""));
    setOtpError("");

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleResendOtp = async () => {
    setResending(true);

    try {
      const response = await resendOtp(email);

      setOtpValues(["", "", "", "", "", ""]);
      setOtp("");
      setOtpError("");

      toast.success(response.message);

      setResendCooldown(30);

      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setOtpError("");

    if (!otp.trim()) {
      setOtpError("OTP is required");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setOtpError("Enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOtp({
        email,
        otp,
      });

      toast.success(response.message);

      navigate("/reset-password", {
        state: { email },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
      <Link
        to="/forgot-password"
        className="absolute top-8 left-8 text-gray-400 hover:text-violet-400 transition"
      >
        ← Back to Forgot Password
      </Link>
      <div className="bg-slate-900 p-10 rounded-3xl w-[450px]">
        <h1 className="text-4xl font-bold text-center mb-2">
          Anime<span className="text-violet-500">Hub</span>
        </h1>

        <p className="text-center text-gray-400 mb-2">
          Enter the OTP sent to your email
        </p>

        <p className="text-center text-gray-500 text-sm mb-8 break-all">
          {email}
        </p>
        <form onSubmit={handleVerifyOtp}>
          <div className="flex justify-center gap-3 mb-5">
            {otpValues.map((value, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={value}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                className="w-12 h-14 text-center text-xl font-semibold bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-violet-500"
              />
            ))}
          </div>

          {otpError && (
            <p className="text-red-400 text-sm -mt-2 mb-5">{otpError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-2xl py-4 font-semibold transition ${
              loading
                ? "bg-violet-400 cursor-not-allowed"
                : "bg-violet-600 hover:bg-violet-700"
            }`}
          >
            {loading ? "Verifying OTP..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resending || resendCooldown > 0}
            className="w-full mt-4 text-violet-400 hover:text-violet-300 transition disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {resending
              ? "Sending OTP..."
              : resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : "Resend OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default VerifyOtp;
