import Navbar from "../components/Navbar";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  getMyNotifications,
  markAsRead,
  deleteNotification,
} from "../services/admin/notificationService";
import { getFavorites, removeFavorite } from "../services/user/favoriteService";
import { getWatchlist, removeWatchlist } from "../services/user/watchlistService";
import {
  getContinueWatching,
  removeContinueWatching,
} from "../services/user/continueWatchingService";
import AnimeCard from "../components/JikanAnimeCard";
import ProfileAnimeCard from "../components/ProfileAnimeCard";
import {
  uploadProfileImage,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "../services/user/userService";
import toast from "react-hot-toast";
import { Crown } from "lucide-react";
import { getDatabaseAnimeByMalId } from "../services/anime/databaseAnimeService";
import { getEpisodesByAnime } from "../services/anime/databaseEpisodeService";
import {
  Camera,
  Pencil,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Venus,
  Heart,
  Eye,
  EyeOff,
  Tv,
  PlayCircle,
  Download,
  Settings,
  Lock,
  Bell,
  Moon,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function Profile() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const activeTab = searchParams.get("tab") || "overview";

  const token = localStorage.getItem("token");
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [selectedSection, setSelectedSection] = useState("favorites");
  const [showLists, setShowLists] = useState(true);
  const [isPurpleTheme, setIsPurpleTheme] = useState(
    localStorage.getItem("theme") === "purple",
  );
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [editData, setEditData] = useState({
    username: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
  });

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  useEffect(() => {
    document.documentElement.className = theme;

    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (activeTab === "overview") {
      setSelectedSection("favorites");
    }

    if (activeTab === "lists") {
      setSelectedSection("favorites");
      setShowLists(true);
    }

    if (activeTab === "settings") {
      setSelectedSection("password");
      setShowSettings(true);
    }
  }, [activeTab]);

  const handleWatch = async (anime) => {
  try {
    // Try using MAL ID first
    if (anime.malId) {
      const dbAnime = await getDatabaseAnimeByMalId(anime.malId);
      const dbEpisodes = await getEpisodesByAnime(dbAnime.id);

      if (dbEpisodes.length > 0) {
        navigate(`/db/watch/${dbAnime.id}/${dbEpisodes[0].id}`);
      } else {
        navigate(`/watch/${anime.malId}/1`);
      }

      return;
    }

    // Fallback for DB-only anime
    if (anime.id || anime.animeId) {
      const dbId = anime.id || anime.animeId;
      const dbEpisodes = await getEpisodesByAnime(dbId);

      if (dbEpisodes.length > 0) {
        navigate(`/db/watch/${dbId}/${dbEpisodes[0].id}`);
      } else {
        navigate(`/anime/${dbId}`);
      }

      return;
    }
  } catch (error) {
    if (anime.malId) {
      navigate(`/watch/${anime.malId}/1`);
    } else {
      navigate(`/anime/${anime.id || anime.animeId}`);
    }
  }
};

  const handleLogout = () => {
  setShowLogoutModal(false);

  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("theme");

  navigate("/login");
};

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userData = await getCurrentUser();

        setUser(userData);
        setEditData({
          username: userData.username || "",
          phone: userData.phone || "",
          dob: userData.dob || "",
          gender: userData.gender || "",
          address: userData.address || "",
        });
        setProfileImage(userData.profileImage);

        const favoriteData = await getFavorites();
        console.log("Favorites API:", favoriteData);

        setFavorites(favoriteData);

        const watchlistData = await getWatchlist();
        console.log("Watchlist API:", watchlistData);
        setWatchlist(watchlistData);
        const continueData = await getContinueWatching();
        console.log("Continue API:", continueData);
        setContinueWatching(continueData);
      } catch (error) {
        console.log(error);
      }
    };

    if (token) {
      fetchProfileData();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();

      console.log("Notifications:", data); // <-- ADD THIS
      console.log("Notifications:", JSON.stringify(data));
      console.log("Length:", data?.length);

      setNotifications(
        [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      );
    } catch (error) {
      console.log("Notification Error:", error); // <-- REPLACE THIS
    }
  };

  useEffect(() => {
    console.log("Fetching notifications...");
    fetchNotifications();
  }, []);

  if (!token) {
    return (
      <>
        {/* <Navbar /> */}

        <div className="pt-8 px-8">
          <div className="bg-slate-900 rounded-3xl p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-5">Profile</h1>

            <p className="text-gray-400">
              Please login to access your AnimeHub profile.
            </p>

            <button
              className="bg-blue-500 px-4 py-2 mt-5 rounded"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="pt-8 px-8">
        <button
          onClick={() => navigate(-1)}
          className="text-violet-400 hover:text-violet-300 mb-6"
        >
          ← Back
        </button>
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-[380px_360px_minmax(0,1fr)] gap-10 px-4 lg:px-0">
          {/* Profile Header */}
          <>
            <div
              className={`rounded-3xl shadow-2xl p-6 h-fit mb-7.5 border ${
                isPurpleTheme
                  ? "bg-[#24163A] border-violet-700"
                  : "bg-[#151C2F] border-slate-800"
              }`}
            >
              <div className="flex flex-col items-center">
                <label className="cursor-pointer">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-[5px] border-violet-500 shadow-[0_0_35px_rgba(139,92,246,0.45)] flex items-center justify-center bg-slate-700">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={60} className="text-gray-300" />
                      )}
                    </div>

                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center text-3xl">
                      <Camera size={28} />
                    </div>
                    <div className="absolute bottom-3 right-2 w-7 h-7 bg-green-500 rounded-full border-4 border-slate-900"></div>
                  </div>

                  <input
                    type="file"
                    hidden
                    onChange={async (e) => {
                      try {
                        const file = e.target.files[0];

                        if (!file) return;

                        const imageUrl = await uploadProfileImage(file);

                        setProfileImage(imageUrl);

                        toast.success("Profile updated successfully!");
                      } catch (error) {
                        console.log(error);
                        toast.error("Upload failed");
                      }
                    }}
                  />
                </label>

                <h1 className="text-3xl font-bold mt-5">{user?.username}</h1>

                <div className="w-full mt-5 bg-[#161C2D] rounded-2xl border border-slate-800 px-4 py-3">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-2xl font-bold text-violet-400">
                      Personal Details
                    </h3>

                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-violet-400 hover:text-white transition"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2.5 border-b border-slate-700">
                    <div className="flex items-center gap-3 text-gray-300">
                      <User size={18} className="text-violet-400" />
                      <span>Username</span>
                    </div>

                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.username}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            username: e.target.value,
                          })
                        }
                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white w-52 text-right"
                      />
                    ) : (
                      <span className="text-gray-200 font-medium text-right break-all">
                        {user?.username}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Mail size={18} className="text-violet-400" />

                      <span>Email</span>
                    </div>

                    <span className="text-gray-200 font-medium text-right break-all">
                      {user?.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Phone size={18} className="text-violet-400" />

                      <span>Phone</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            phone: e.target.value,
                          })
                        }
                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white w-52 text-right"
                      />
                    ) : (
                      <span className="text-gray-200 font-medium text-right break-all">
                        {user?.phone || "Not Added"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Calendar size={18} className="text-violet-400" />

                      <span>Date of Birth</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.dob}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            dob: e.target.value,
                          })
                        }
                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      />
                    ) : (
                      <span className="text-gray-200 font-medium text-right break-all">
                        {user?.dob || "Not Added"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Venus size={18} className="text-violet-400" />

                      <span>Gender</span>
                    </div>
                    {isEditing ? (
                      <select
                        value={editData.gender}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            gender: e.target.value,
                          })
                        }
                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <span className="text-gray-200 font-medium text-right break-all">
                        {user?.gender || "Not Added"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-slate-700">
                    <div className="flex items-center gap-3 text-gray-300">
                      <MapPin size={18} className="text-violet-400" />

                      <span>Address</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.address}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            address: e.target.value,
                          })
                        }
                        className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white w-52 text-right"
                      />
                    ) : (
                      <span className="text-gray-200 font-medium text-right break-all">
                        {user?.address || "Not Added"}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between mt-4">
                    <div className="flex items-center gap-3 text-gray-300">
                      <Shield size={18} className="text-violet-400" />

                      <span>Role</span>
                    </div>

                    <span className="text-gray-200 font-medium text-right break-all">
                      {user?.role === "ROLE_ADMIN" ? "Administrator" : "Member"}
                    </span>
                  </div>
                </div>

                {isEditing && (
                  <div className="w-full mt-6 flex gap-3">
                    <button
                      disabled={saving}
                      onClick={() => {
                        setEditData({
                          username: user?.username || "",
                          phone: user?.phone || "",
                          dob: user?.dob || "",
                          gender: user?.gender || "",
                          address: user?.address || "",
                        });
                        setIsEditing(false);
                      }}
                      className={`flex-1 h-12 rounded-xl border border-slate-600 transition ${
                        saving
                          ? "cursor-not-allowed opacity-60"
                          : "hover:bg-slate-700"
                      }`}
                    >
                      Cancel
                    </button>

                    <button
                      disabled={saving}
                      onClick={async () => {
                        if (!editData.username.trim()) {
                          toast.error("Username is required");
                          return;
                        }

                        if (
                          editData.phone &&
                          !/^\d{10}$/.test(editData.phone)
                        ) {
                          toast.error("Phone number must be 10 digits");
                          return;
                        }

                        try {
                          setSaving(true);

                          const updatedUser = await updateProfile(editData);

                          setUser(updatedUser);

                          setEditData({
                            username: updatedUser.username || "",
                            phone: updatedUser.phone || "",
                            gender: updatedUser.gender || "",
                            address: updatedUser.address || "",
                            dob: updatedUser.dob || "",
                          });

                          setIsEditing(false);

                          toast.success("Profile updated successfully!");
                        } catch (error) {
                          console.error(error);
                          toast.error("Failed to update profile");
                        } finally {
                          setSaving(false);
                        }
                      }}
                      className={`flex-1 h-12 rounded-xl font-semibold transition ${
                        saving
                          ? "bg-violet-400 cursor-not-allowed"
                          : "bg-violet-600 hover:bg-violet-700"
                      }`}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
                <div className="w-full mt-6">
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full h-12 rounded-xl border border-violet-500 bg-transparent text-violet-400 font-semibold hover:bg-violet-600 hover:text-white transition flex items-center justify-center gap-2"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[390px] ">
              <div className="w-full">
                <div
                  className={`rounded-3xl shadow-2xl p-4 h-fit mb-6 border ${
                    isPurpleTheme
                      ? "bg-[#24163A] border-violet-700"
                      : "bg-[#151C2F] border-slate-800"
                  }`}
                >
                  <h2 className="text-4xl font-extrabold text-violet-400 mb-6">
                    Menu
                  </h2>
                  <button
                    className="w-full flex items-center justify-between text-3xl font-bold pb-5 border-b border-slate-700"
                    onClick={() => setShowLists(!showLists)}
                  >
                    <div className="flex items-center gap-4">
                      <Heart className="text-violet-400" size={28} />
                      <span className="text-2xl font-semibold">My Lists</span>
                    </div>
                    {showLists ? (
                      <ChevronUp size={24} />
                    ) : (
                      <ChevronDown size={24} />
                    )}
                  </button>

                  {showLists && (
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => setSelectedSection("favorites")}
                        className={`w-full flex items-center gap-4 rounded-xl px-5 py-4 transition
${
  selectedSection === "favorites"
    ? "bg-violet-600 text-white"
    : "hover:bg-slate-800"
}`}
                      >
                        <div className="flex items-center gap-4">
                          <Heart size={22} />
                          Favorites ({favorites.length})
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedSection("watchlist")}
                        className={`w-full rounded-xl px-4 py-3 transition
${
  selectedSection === "watchlist"
    ? "bg-violet-600 text-white"
    : "hover:bg-slate-800"
}`}
                      >
                        <div className="flex items-center gap-4">
                          <Tv size={22} />
                          Watchlist ({watchlist.length})
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedSection("continue")}
                        className={`w-full rounded-xl px-4 py-3 transition
${
  selectedSection === "continue"
    ? "bg-violet-600 text-white"
    : "hover:bg-slate-800"
}`}
                      >
                        <div className="flex items-center gap-4">
                          <PlayCircle size={22} />
                          Continue Watching ({continueWatching.length})
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedSection("downloads")}
                        className={`w-full rounded-xl px-4 py-3 transition
${
  selectedSection === "downloads"
    ? "bg-violet-600 text-white"
    : "hover:bg-slate-800"
}`}
                      >
                        <div className="flex items-center gap-4">
                          <Download size={22} />
                          Downloads
                        </div>
                      </button>
                    </div>
                  )}

                  {/* <hr className="my-6" /> */}

                  <button
                    className="w-full flex items-center justify-between py-4 border-b border-slate-700"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <div className="flex items-center gap-4">
                      <Settings size={24} className="text-violet-400" />

                      <span className="text-2xl font-semibold">Settings</span>
                    </div>

                    {showSettings ? <ChevronUp /> : <ChevronDown />}
                  </button>

                  {showSettings && (
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => setSelectedSection("password")}
                        className={`w-full flex items-center gap-4 rounded-xl px-5 py-4 transition
${
  selectedSection === "password"
    ? "bg-violet-600 text-white"
    : "hover:bg-slate-800"
}`}
                      >
                        🔐 Change Password
                      </button>

                      <button
                        onClick={() => setSelectedSection("theme")}
                        className={`w-full flex items-center gap-4 rounded-xl px-5 py-4 transition
${
  selectedSection === "theme"
    ? "bg-violet-600 text-white"
    : "hover:bg-slate-800"
}`}
                      >
                        🎨 Theme
                      </button>

                      <button
                        onClick={() => setSelectedSection("notifications")}
                        className={`w-full flex items-center gap-4 rounded-xl px-5 py-4 transition
${
  selectedSection === "notifications"
    ? "bg-violet-600 text-white"
    : "hover:bg-slate-800"
}`}
                      >
                        🔔 Notifications
                      </button>
                      <hr className="my-1 border-slate-700" />
                    </div>
                  )}

                  {user?.role === "ROLE_ADMIN" && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedSection("admin");
                          navigate("/admin");
                        }}
                        className={`w-full flex items-center justify-between py-4 transition duration-300 group ${
                          selectedSection === "admin"
                            ? "text-violet-400"
                            : "text-white"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Crown
                            size={24}
                            className="text-yellow-400 group-hover:scale-110 transition-transform"
                          />

                          <span
                            className={`text-2xl font-semibold transition-colors ${
                              selectedSection === "admin"
                                ? "text-violet-400"
                                : "group-hover:text-violet-400"
                            }`}
                          >
                            Admin Dashboard
                          </span>
                        </div>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="xl:h-[calc(100vh-100px)] overflow-hidden">
                <div className="h-full overflow-y-auto right-scroll pr-2 xl:ml-7 lg:ml-8 md:ml-4">
                  {selectedSection === "theme" && (
                    <div
                      className={`rounded-3xl p-8 ${
                        isPurpleTheme ? "bg-[#24163A]" : "bg-[#1A2035]"
                      }`}
                    >
                      <h2 className="text-3xl font-bold mb-8">🎨 Theme</h2>

                      <div className="flex items-center justify-between bg-slate-800 rounded-2xl p-5">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Purple Theme
                          </h3>

                          <p className="text-gray-400">
                            Enable AnimeHub Purple Theme
                          </p>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPurpleTheme}
                            onChange={() => {
                              const newTheme = !isPurpleTheme;

                              setIsPurpleTheme(newTheme);
                              setTheme(newTheme ? "purple" : "dark");

                              localStorage.setItem(
                                "theme",
                                newTheme ? "purple" : "dark",
                              );
                            }}
                            className="sr-only peer"
                          />

                          <div className="w-12 h-6 bg-slate-700 rounded-full peer peer-checked:bg-violet-600 transition"></div>

                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></div>
                        </label>
                      </div>
                    </div>
                  )}

                  {selectedSection === "notifications" && (
                    <>
                      <h2 className="text-3xl font-bold mb-6">
                        🔔 Notifications
                      </h2>

                      <div
                        className={`rounded-3xl overflow-hidden ${
                          isPurpleTheme ? "bg-[#24163A]" : "bg-[#1A2035]"
                        }`}
                      >
                        {notifications.length === 0 ? (
                          <div className="py-20 text-center">
                            <Bell
                              size={50}
                              className="mx-auto text-gray-500 mb-4"
                            />

                            <h3 className="text-xl font-semibold">
                              No Notifications
                            </h3>

                            <p className="text-gray-400 mt-2">
                              We'll notify you when something important happens.
                            </p>
                          </div>
                        ) : (
                          [...notifications]
                            .sort(
                              (a, b) =>
                                new Date(b.createdAt) - new Date(a.createdAt),
                            )
                            .map((notification) => (
                              <div
                                key={notification.id}
                                onClick={async () => {
                                  if (!notification.readStatus) {
                                    await markAsRead(notification.id);

                                    setNotifications((prev) =>
                                      prev.map((item) =>
                                        item.id === notification.id
                                          ? { ...item, readStatus: true }
                                          : item,
                                      ),
                                    );
                                  }
                                }}
                                className={`p-6 border-b border-slate-700 cursor-pointer transition ${
                                  !notification.readStatus
                                    ? "bg-slate-700 border-l-4 border-orange-500"
                                    : "hover:bg-slate-800"
                                }`}
                              >
                                <div className="flex justify-between items-start gap-5">
                                  <div>
                                    <h3 className="font-bold">
                                      {notification.title}
                                    </h3>

                                    <p className="text-gray-400 mt-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-3">
                                      {notification.createdAt ? (
                                        <p className="text-xs text-gray-500 mt-3">
                                          {new Date(
                                            notification.createdAt,
                                          ).toLocaleString("en-IN", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                          })}
                                        </p>
                                      ) : (
                                        <p className="text-xs text-gray-500 mt-3">
                                          Just now
                                        </p>
                                      )}
                                    </p>
                                    <div className="mt-3">
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs ${
                                          notification.readStatus
                                            ? "bg-green-600"
                                            : "bg-orange-500"
                                        }`}
                                      >
                                        {notification.readStatus
                                          ? "Read"
                                          : "Unread"}
                                      </span>
                                    </div>
                                  </div>

                                  <Trash2
                                    size={20}
                                    className="cursor-pointer text-red-400 hover:text-red-500 transition"
                                    onClick={async (e) => {
                                      e.stopPropagation();

                                      if (
                                        window.confirm(
                                          "Delete this notification?",
                                        )
                                      ) {
                                        await deleteNotification(
                                          notification.id,
                                        );
                                        fetchNotifications();
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </>
                  )}
                  {selectedSection === "favorites" && (
                    <>
                      <h2 className="text-3xl font-bold mb-6">❤️ Favorites</h2>

                      <div className="space-y-6">
                        {favorites.map((anime) => (
                          <ProfileAnimeCard
                            key={anime.animeId}
                            image={anime.posterUrl}
                            title={anime.title}
                            subtitle={`⭐ ${anime.score || "N/A"}`}
                            extra={
                              anime.genres?.map((g) => g.name).join(" • ") ||
                              anime.genre
                            }
                            watchLink="#"
onWatch={() => handleWatch(anime)}
                            watchText="Watch"
                            removeText="Remove"
                            onRemove={async () => {
                              await removeFavorite(anime.malId);

                              setFavorites(
                                favorites.filter(
                                  (item) => item.malId !== anime.malId,
                                ),
                              );
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {selectedSection === "watchlist" && (
                    <>
                      <h2 className="text-3xl font-bold mb-6">📺 Watchlist</h2>
                      <div className="space-y-6">
                        {watchlist.map((anime) => (
                          <ProfileAnimeCard
                            key={anime.animeId}
                            image={anime.posterUrl}
                            title={anime.title}
                            subtitle={`⭐ ${anime.score || "N/A"}`}
                            extra={
                              anime.genres?.map((g) => g.name).join(" • ") ||
                              anime.genre
                            }
                            watchLink="#"
onWatch={() => handleWatch(anime)}
                            watchText="Watch"
                            removeText="Remove"
                            onRemove={async () => {
                              await removeWatchlist(anime.malId);

                              setWatchlist(
                                watchlist.filter(
                                  (item) => item.malId !== anime.malId,
                                ),
                              );
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {selectedSection === "continue" && (
                    <>
                      <h2 className="text-3xl font-bold mb-6">
                        ▶ Continue Watching
                      </h2>

                      <div className="space-y-6">
                        {continueWatching.map((item) => (
                          <ProfileAnimeCard
                            key={`${item.episodeId}-${item.episodeTitle}`}
                            image={item.posterUrl}
                            title={item.animeTitle}
                            subtitle="▶ Continue Watching"
                            extra={item.episodeTitle}
                            progress={Math.min(
                              ((item.watchedTimeInSeconds || 0) /
                                (item.duration || 1)) *
                                100,
                              100,
                            )}
                            watchedText={`${Math.floor(
                              (item.watchedTimeInSeconds || 0) / 60,
                            )}m watched • ${Math.floor(
                              (item.duration || 0) / 60,
                            )}m total`}
                            watchLink="#"
onWatch={() =>
  navigate(`/db/watch/${item.animeId}/${item.episodeId}`)
}
watchText="Resume"
                            removeText="Remove"
                            onRemove={async () => {
                              try {
                                await removeContinueWatching(item.episodeId);

                                setContinueWatching(
                                  continueWatching.filter(
                                    (watch) =>
                                      watch.episodeId !== item.episodeId,
                                  ),
                                );

                                toast.success("Removed from Continue Watching");
                              } catch (error) {
                                console.error(error);
                                toast.error("Failed to remove");
                              }
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {selectedSection === "password" && (
                    <div
                      className={`rounded-3xl p-8 ${
                        isPurpleTheme ? "bg-[#24163A]" : "bg-[#1A2035]"
                      }`}
                    >
                      <h2 className="text-3xl font-bold mb-8">
                        🔐 Change Password
                      </h2>

                      <div className="space-y-5">
                        <div>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? "text" : "password"}
                              value={currentPassword}
                              placeholder="Current Password"
                              onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                setCurrentPasswordError("");
                              }}
                              className={`w-full bg-slate-800 border rounded-xl p-4 pr-12 ${
                                currentPasswordError
                                  ? "border-red-500"
                                  : "border-slate-700"
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowCurrentPassword(!showCurrentPassword)
                              }
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showCurrentPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>

                          {currentPasswordError && (
                            <p className="text-red-400 text-sm mt-2">
                              {currentPasswordError}
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="relative">
                            <input
                              type={showNewPassword ? "text" : "password"}
                              value={newPassword}
                              onChange={(e) => {
                                const value = e.target.value;

                                setNewPassword(value);

                                const strongPassword =
                                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

                                if (!value.trim()) {
                                  setNewPasswordError(
                                    "New password is required",
                                  );
                                } else if (!strongPassword.test(value)) {
                                  setNewPasswordError(
                                    "Password must contain uppercase, lowercase, number, special character and be at least 8 characters",
                                  );
                                } else {
                                  setNewPasswordError("");
                                }

                                if (
                                  confirmPassword &&
                                  value !== confirmPassword
                                ) {
                                  setConfirmPasswordError(
                                    "Passwords do not match",
                                  );
                                } else {
                                  setConfirmPasswordError("");
                                }
                              }}
                              placeholder="New Password"
                              className={`w-full bg-slate-800 border rounded-xl p-4 pr-12 ${
                                newPasswordError
                                  ? "border-red-500"
                                  : "border-slate-700"
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowNewPassword(!showNewPassword)
                              }
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showNewPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>

                          {newPasswordError && (
                            <p className="text-red-400 text-sm mt-2">
                              {newPasswordError}
                            </p>
                          )}
                        </div>

                        <div>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => {
                                const value = e.target.value;

                                setConfirmPassword(value);

                                if (!value.trim()) {
                                  setConfirmPasswordError(
                                    "Please confirm your password",
                                  );
                                } else if (value !== newPassword) {
                                  setConfirmPasswordError(
                                    "Passwords do not match",
                                  );
                                } else {
                                  setConfirmPasswordError("");
                                }
                              }}
                              placeholder="Confirm Password"
                              className={`w-full bg-slate-800 border rounded-xl p-4 pr-12 ${
                                confirmPasswordError
                                  ? "border-red-500"
                                  : "border-slate-700"
                              }`}
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showConfirmPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>

                          {confirmPasswordError && (
                            <p className="text-red-400 text-sm mt-2">
                              {confirmPasswordError}
                            </p>
                          )}
                        </div>

                        <button
                          disabled={
                            saving ||
                            !currentPassword ||
                            !newPassword ||
                            !confirmPassword
                          }
                          onClick={async () => {
                            setCurrentPasswordError("");
                            setNewPasswordError("");
                            setConfirmPasswordError("");

                            const strongPassword =
                              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

                            if (!currentPassword.trim()) {
                              setCurrentPasswordError(
                                "Current password is required",
                              );
                              return;
                            }

                            if (currentPassword === newPassword) {
                              setNewPasswordError(
                                "New password cannot be the same as the current password",
                              );
                              return;
                            }

                            if (!newPassword.trim()) {
                              setNewPasswordError("New password is required");
                              return;
                            }

                            if (!strongPassword.test(newPassword)) {
                              setNewPasswordError(
                                "Password must contain uppercase, lowercase, number, special character and be at least 8 characters",
                              );
                              return;
                            }

                            if (!confirmPassword.trim()) {
                              setConfirmPasswordError(
                                "Please confirm your password",
                              );
                              return;
                            }

                            if (newPassword !== confirmPassword) {
                              setConfirmPasswordError("Passwords do not match");
                              return;
                            }

                            try {
                              setSaving(true);

                              await changePassword({
                                currentPassword,
                                newPassword,
                              });

                              toast.success("Password changed successfully");

                              setCurrentPassword("");
                              setNewPassword("");
                              setConfirmPassword("");

                              setCurrentPasswordError("");
                              setNewPasswordError("");
                              setConfirmPasswordError("");
                            } catch (error) {
                              console.error(error);

                              const message =
                                error.response?.data?.message ??
                                "Failed to change password";

                              if (message === "Current password is incorrect") {
                                setCurrentPasswordError(message);
                              } else {
                                toast.error(message);
                              }
                            } finally {
                              setSaving(false);
                            }
                          }}
                          className={`w-full h-12 rounded-xl font-semibold transition ${
                            saving
                              ? "bg-violet-400 cursor-not-allowed"
                              : "bg-violet-600 hover:bg-violet-700"
                          }`}
                        >
                          {saving ? "Changing Password..." : "Change Password"}
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedSection === "downloads" && (
                    <>
                      <h2 className="text-3xl font-bold mb-6">⬇ Downloads</h2>

                      <div className="bg-[#1A2035] border border-slate-700 rounded-3xl p-10 text-center">
                        <h3 className="text-2xl font-bold">No Downloads Yet</h3>

                        <p className="text-gray-400 mt-3">
                          Download your favorite episodes to watch offline.
                        </p>

                        <Link to="/">
                          <button className="mt-8 bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl font-semibold transition">
                            Browse Anime
                          </button>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        </div>
      </div>
      {showLogoutModal && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">

    <div className="w-[400px] rounded-3xl bg-[#151C2F] border border-violet-700 shadow-[0_0_35px_rgba(139,92,246,0.25)] p-8">

      <h2 className="text-2xl font-bold text-white mb-3">
        Logout
      </h2>

      <p className="text-gray-400 leading-7">
        Are you sure you want to logout from your account?
      </p>

      <div className="flex justify-end gap-4 mt-8">

        <button
          onClick={() => setShowLogoutModal(false)}
          className="px-6 py-3 rounded-xl border border-slate-700 text-gray-300 hover:bg-slate-800 transition"
        >
          Cancel
        </button>

        <button
          onClick={handleLogout}
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 shadow-[0_0_18px_rgba(139,92,246,0.6)] text-white font-semibold transition-all duration-300"
        >
          Logout
        </button>

      </div>

    </div>

  </div>
)}
    </>
  );
}

export default Profile;
