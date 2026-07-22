import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/user/authService";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
const [passwordError, setPasswordError] = useState("");
const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();

  

  setErrorMessage("");
  setEmailError("");
setPasswordError("");

if (!email.trim()) {
  setEmailError("Email is required");
  return;
}

if (!email.includes("@")) {
  setEmailError("Enter a valid email address");
  return;
}

if (!password.trim()) {
  setPasswordError("Password is required");
  return;
}

  try {
    const response = await login({
  email,
  password,
});

localStorage.setItem("token", response.token);
localStorage.setItem("role", response.role);
localStorage.setItem("username", response.username);

    toast.success("Login Successful!");

    setTimeout(() => {
      navigate("/");
    }, 1000);

  } catch (error) {

    const message =
      error.response?.data?.message ||
      "Invalid email or password";

    setErrorMessage(message);
    toast.error(message);
  }
};

  return (
  <div className="min-h-screen bg-[#0f172a] px-8 py-8">

    {/* Home Button */}
    <Link
      to="/"
      className="text-gray-400 hover:text-violet-400 transition"
    >
      ← Home
    </Link>

    {/* Center Card */}
    <div className="flex items-center justify-center min-h-[85vh]">

      <div className="w-full max-w-md bg-slate-900 rounded-3xl p-10 shadow-2xl">

        <h1 className="text-4xl font-bold text-center mb-2">
          Anime<span className="text-violet-500">Hub</span>
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Welcome Back 👋
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

         <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onBlur={() => {
    if (!email.includes("@")) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
  }}
  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-violet-500"
/>

{emailError && (
  <p className="text-red-400 text-sm -mt-2">
    {emailError}
  </p>
)}
        <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    onBlur={() => {
      if (!password.trim()) {
        setPasswordError("Password is required");
      } else {
        setPasswordError("");
      }
    }}
    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 pr-14 outline-none focus:border-violet-500"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
</div>

{passwordError && (
  <p className="text-red-400 text-sm -mt-2">
    {passwordError}
  </p>
)}

{errorMessage && (
  <div className="bg-red-500/20 border border-red-500 text-red-300 rounded-2xl px-4 py-3">
    {errorMessage}
  </div>
)}
          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 rounded-2xl py-4 font-semibold transition"
          >
            Login
          </button>
<Link
  to="/forgot-password"
  className="block text-center mt-4 text-gray-400 hover:text-violet-400"
>
  Forgot Password?
</Link>
        </form>

        <p className="text-center text-gray-400 mt-8">
          Don't have an account?
        </p>

        <Link
          to="/register"
          className="block text-center text-violet-400 hover:text-violet-300 mt-2"
        >
          Create Account
        </Link>

      </div>

    </div>

  </div>
);
}

export default Login;