import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/user/authService";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function Register() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [usernameError, setUsernameError] = useState("");
const [emailError, setEmailError] = useState("");
const [passwordError, setPasswordError] = useState("");
const [confirmPasswordError, setConfirmPasswordError] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {

    e.preventDefault();

    if (password !== confirmPassword) {

      setErrorMessage("Passwords do not match");
return;

    }

    try {

      // Backend API later

await register({
  username,
  email,
  password,
  role: "ROLE_USER",
});

toast.success("Account created successfully!");

setTimeout(() => {
  navigate("/login");
}, 1000);

    } catch (error) {

      setErrorMessage(
    error.response?.data?.message ||
    "Registration failed"
  );

    }

  };

  return (

    <div className="min-h-screen bg-[#0f172a] px-8 py-8">
<div className="mb-8">
  <Link
  to="/"
  className="text-gray-400 hover:text-violet-400 transition"
>
  ← Home
</Link>

<div className="flex items-center justify-center min-h-[85vh]">

  <div className="w-full max-w-md bg-slate-900 rounded-3xl p-10 shadow-2xl">


        <h1 className="text-4xl font-bold text-center mb-2">
          Anime<span className="text-violet-500">Hub</span>
        </h1>

        <p className="text-center text-gray-400 mb-8">
          Create Your Account ✨
        </p>

        <form onSubmit={handleRegister} className="space-y-5">

          <input
  type="text"
  placeholder="Username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  onBlur={() => {
    if (!username.trim()) {
      setUsernameError("Username is required");
    } else {
      setUsernameError("");
    }
  }}
  className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-violet-500"
/>

{usernameError && (
  <p className="text-red-400 text-sm -mt-2">
    {usernameError}
  </p>
)}
 
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
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

      if (!passwordRegex.test(password)) {
        setPasswordError(
          "Must contain 8+ characters, uppercase, lowercase, number & special character."
        );
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

          <div className="relative">
  <input
    type={showConfirmPassword ? "text" : "password"}
    placeholder="Confirm Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    onBlur={() => {
      if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
      } else {
        setConfirmPasswordError("");
      }
    }}
    className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 pr-14 outline-none focus:border-violet-500"
  />

  <button
    type="button"
    onClick={() =>
      setShowConfirmPassword(!showConfirmPassword)
    }
    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
  >
    {showConfirmPassword ? (
      <EyeOff size={20} />
    ) : (
      <Eye size={20} />
    )}
  </button>
</div>

{confirmPasswordError && (
  <p className="text-red-400 text-sm -mt-2">
    {confirmPasswordError}
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
            Create Account
          </button>

        </form>

        <p className="text-center text-gray-400 mt-8">
          Already have an account?
        </p>

        <Link
          to="/login"
          className="block text-center text-violet-400 hover:text-violet-300 mt-2"
        >
          Login
        </Link>

      </div>
    </div>
    </div>
</div>
  );
}

export default Register;