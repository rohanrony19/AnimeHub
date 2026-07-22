import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchAnime } from "../services/anime/jikanService";
import { searchDatabaseAnime } from "../services/anime/searchService";
import { Search, Menu, X } from "lucide-react";
import { getCurrentUser } from "../services/user/userService";
import { Bell, Trash2 } from "lucide-react";
import genres from "../data/genres";
import {
  getMyNotifications,
  markAsRead,
  deleteNotification,
} from "../services/admin/notificationService";
import { User, Heart, Settings, LayoutDashboard, LogOut } from "lucide-react";
import { Crown } from "lucide-react";

function Navbar({ setSelectedGenre }) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showGenres, setShowGenres] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [databaseResults, setDatabaseResults] = useState([]);
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profileImage"),
  );
  const [isPurpleTheme, setIsPurpleTheme] = useState(
    localStorage.getItem("theme") === "purple",
  );
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (keyword.trim() === "") {
      setSearchResults([]);
      setDatabaseResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const dbAnime = await searchDatabaseAnime(keyword);
        setDatabaseResults(dbAnime);
      } catch (error) {
        setDatabaseResults([]);
      }

      try {
        const jikanAnime = await searchAnime(keyword);
        setSearchResults(jikanAnime);
      } catch (error) {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [keyword]);

  const mergedResults = [
    ...databaseResults,
    ...searchResults.filter(
      (jikanAnime) =>
        !databaseResults.some(
          (dbAnime) => dbAnime.malId && dbAnime.malId === jikanAnime.mal_id,
        ),
    ),
  ];

  useEffect(() => {
    const image = localStorage.getItem("profileImage");

    if (image) {
      setProfileImage(image);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();

      setNotifications(
        [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      );
    } catch (error) {
      toast.error("Failed to load notifications.");
    }
  };

  useEffect(() => {
    if (!token) return;

    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
        setProfileImage(user.profileImage);
        
        localStorage.setItem("profileImage", user.profileImage);
      } catch (error) {
        setProfileImage("/default-avatar.png");
      }
    };

    loadUser();
  }, [token]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between px-4 md:px-10 py-4 md:py-6 bg-transparent">
      {/* Logo */}
      <Link
        to="/"
        style={{ fontFamily: "Audiowide" }}
        className="text-3xl md:text-4xl tracking-wide"
      >
        <span className="text-white font-bold">
          Anime<span className="text-violet-500">Hub</span>
        </span>
      </Link>
      <button
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        className="md:hidden text-white"
      >
        {showMobileMenu ? <X size={28} /> : <Menu size={28} />}
      </button>
      {/* Search */}
      <div className="relative hidden md:block w-[600px]">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search anime..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              navigate(`/search/${keyword}`);
            }
          }}
          className="w-full bg-slate-700/60 text-white placeholder-gray-400 rounded-full pl-12 pr-5 py-3 outline-none border border-slate-600"
        />
        {keyword && (
          <button
            type="button"
            onClick={() => {
              setKeyword("");
              setSearchResults([]);
              setDatabaseResults([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-700 transition"
          >
            <X size={18} className="text-gray-400 hover:text-white" />
          </button>
        )}

        {mergedResults.length > 0 && (
          <div className="absolute top-14 w-full bg-slate-900 rounded-2xl shadow-xl overflow-hidden z-50">
            {mergedResults.map((anime) => (
              <Link
                key={anime.id || anime.mal_id}
                to={anime.id ? `/anime/${anime.id}` : `/jikan/${anime.mal_id}`}
                className="flex items-center gap-3 p-3 hover:bg-slate-800 transition"
                onClick={() => {
                  setKeyword("");
                  setSearchResults([]);
                  setDatabaseResults([]);
                }}
              >
                <img
                  src={anime.posterUrl || anime.images?.jpg?.image_url}
                  alt={anime.title}
                  className="w-12 h-16 rounded-lg object-cover"
                />

                <div>
                  <h3 className="font-semibold text-white">{anime.title}</h3>

                  <p className="text-sm text-gray-400">
                    {anime.releaseYear || anime.year || "Unknown"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right Side */}
      <div className="hidden md:flex items-center gap-8">
        {/* Genres */}
        <div className="relative">
          <button
            onClick={() => setShowGenres(!showGenres)}
            className={`transition ${
              localStorage.getItem("theme") === "purple"
                ? "text-violet-700 hover:text-violet-900"
                : "text-white hover:text-violet-400"
            }`}
          >
            Genres ▼
          </button>
          {showGenres && (
            <div
              className="
        absolute
        top-12
        right-0
        w-[360px]
        rounded-3xl
        bg-[#111827]
        border
        border-slate-700
        shadow-2xl
        p-5
        z-50
      "
            >
              <h3 className="text-xl font-bold text-violet-400 mb-5">
                🎬 Browse Genres
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() => {
                      if (genre.name === "Popular") {
                        navigate("/popular");
                      } else {
                        navigate(`/genre/${genre.id}/${genre.name}`);
                      }

                      setShowGenres(false);
                    }}
                    className="
              flex
              items-center
              gap-3
              bg-slate-800
              hover:bg-violet-600
              rounded-2xl
              px-4
              py-3
              transition-all
              duration-300
              hover:scale-105
            "
                  >
                    <span className="text-2xl">{genre.icon}</span>

                    <span className="font-medium">{genre.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isPurpleTheme}
            onChange={() => {
              const newTheme = !isPurpleTheme;

              setIsPurpleTheme(newTheme);

              localStorage.setItem("theme", newTheme ? "purple" : "dark");

              window.location.reload();
            }}
            className="sr-only peer"
          />

          <div
            className="
      w-12 h-6
      bg-slate-700
      rounded-full
      peer
      peer-checked:bg-violet-600
      transition
    "
          ></div>

          <div
            className="
      absolute
      left-1
      top-1
      w-4 h-4
      bg-white
      rounded-full
      transition
      peer-checked:translate-x-6 
    "
          ></div>
        </label>
        <div className="relative">
          <Bell
            size={22}
            onClick={() => setShowNotifications(!showNotifications)}
            className={`cursor-pointer transition ${
              localStorage.getItem("theme") === "purple"
                ? "text-violet-700 hover:text-violet-900"
                : "text-white hover:text-orange-500"
            }`}
          />

          {notifications.filter((n) => !n.readStatus).length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {notifications.filter((n) => !n.readStatus).length}
            </span>
          )}
        </div>

        {/* Profile */}
        <div
          className="relative"
          onMouseEnter={() => setShowProfileMenu(true)}
          onMouseLeave={() => setShowProfileMenu(false)}
        >
          <Link
            to={token ? "/profile?tab=overview" : "/login"}
            className={`w-11 h-11 rounded-full overflow-hidden block border ${
              localStorage.getItem("theme") === "purple"
                ? "border-violet-400"
                : "border-slate-600"
            }`}
          >
            {token && profileImage ? (
              <img
                src={profileImage}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-700">
                <User size={22} className="text-gray-300" />
              </div>
            )}
          </Link>

          {showProfileMenu && (
            <div
              className={`absolute right-0 top-11 z-[9999] w-72 rounded-3xl shadow-2xl overflow-hidden border ${
                isPurpleTheme
                  ? "bg-[#24163A] border-violet-700 text-white"
                  : "bg-[#151C2F] border-slate-700 text-white"
              }`}
            >
              {token ? (
                <>
                  {/* Header */}
                  <div
                    className={`flex items-center gap-4 p-5 border-b ${
                      isPurpleTheme ? "border-violet-700" : "border-slate-700"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-slate-700">
                      {token && profileImage ? (
                        <img
                          src={profileImage}
                          alt="profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-gray-300" />
                      )}
                    </div>

                    <div>
                      <h2
                        className={`font-semibold ${
                          isPurpleTheme ? "text-violet-100" : "text-white"
                        }`}
                      >
                        {currentUser?.username}
                      </h2>

                      <p className="text-sm text-violet-600">
                        {role === "ROLE_ADMIN"
                          ? "Administrator"
                          : "AnimeHub Member"}
                      </p>
                      <hr className="border-slate-700" />
                    </div>
                  </div>

                  <Link
                    to="/profile?tab=overview"
                    className={`flex items-center gap-3 px-5 py-4 ${"text-white hover:bg-slate-800"}`}
                  >
                    <User size={18} />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/profile?tab=lists"
                    className={`flex items-center gap-3 px-5 py-4 ${"text-white hover:bg-slate-800"}`}
                  >
                    <Heart size={18} />
                    <span>My Lists</span>
                  </Link>

                  <Link
                    to="/profile?tab=settings"
                    className={`flex items-center gap-3 px-5 py-4 ${"text-white hover:bg-slate-800"}`}
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>

                  {role === "ROLE_ADMIN" && (
                    <Link
                      to="/admin"
                      className={`flex items-center gap-3 px-5 py-4 ${"text-white hover:bg-slate-800"}`}
                    >
                      <Crown size={18} className="text-yellow-400" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <hr
                    className={`${
                      localStorage.getItem("theme") === "purple"
                        ? "border-violet-300"
                        : "border-slate-700"
                    }`}
                  />

                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("username");
                      localStorage.removeItem("role");

                      window.location.href = "/";
                    }}
                    className="w-full flex items-center gap-3 px-5 py-4 text-red-400 hover:bg-red-500 hover:text-white transition duration-200"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="p-5 space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setShowProfileMenu(false)}
                    className="block w-full text-center bg-violet-600 hover:bg-violet-700 rounded-xl py-3 font-semibold text-white"
                  >
                    Login
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setShowProfileMenu(false)}
                    className="block w-full text-center border border-violet-500 text-violet-400 hover:bg-violet-600 hover:text-white rounded-xl py-3 font-semibold transition"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showNotifications && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999]"
          onClick={() => setShowNotifications(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`
            fixed
            inset-4
            md:inset-auto
            md:left-1/2
            md:top-1/2
            md:w-[500px]
            md:-translate-x-1/2
            md:-translate-y-1/2
            bg-slate-900
            rounded-3xl
            overflow-y-auto
            max-h-[calc(100vh-2rem)]
            border
            border-slate-700
            z-[100000]
            ${
              isPurpleTheme
                ? "bg-[#24163A] border-violet-700"
                : "bg-slate-900 border-slate-700"
            }`}
          >
            <div
              className={`flex items-center justify-between p-5 border-b ${
                isPurpleTheme ? "border-violet-700" : "border-slate-700"
              }`}
            >
              <h2
                className={`text-xl font-bold ${
                  isPurpleTheme ? "text-violet-100" : "text-white"
                }`}
              >
                🔔 Notifications
              </h2>

              <button
                onClick={() => setShowNotifications(false)}
                className={`${
                  isPurpleTheme
                    ? "text-violet-300 hover:text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                ✕
              </button>
            </div>

            {notifications.length === 0 ? (
              <p className="p-6 text-center text-gray-400">No notifications</p>
            ) : selectedNotification ? (
              <>
                <div className="flex items-center justify-between p-5 border-b border-slate-700">
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="text-violet-400"
                  >
                    ← Back
                  </button>

                  <h2 className="font-bold">Notification</h2>
                </div>

                <div className="p-6">
                  <h2
                    className={`text-2xl font-bold ${
                      isPurpleTheme ? "text-violet-100" : "text-white"
                    }`}
                  >
                    {selectedNotification.title}
                  </h2>

                  <p
                    className={`mt-4 ${
                      isPurpleTheme ? "text-violet-200" : "text-gray-300"
                    }`}
                  >
                    {selectedNotification.message}
                  </p>

                  <div className="mt-6">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedNotification.readStatus
                          ? "bg-green-600"
                          : "bg-orange-500"
                      }`}
                    >
                      {selectedNotification.readStatus ? "Read" : "Unread"}
                    </span>
                  </div>

                  <div className="flex justify-end gap-4 mt-8">
                    <Trash2
                      size={20}
                      className="cursor-pointer text-red-400"
                      onClick={async () => {
                        await deleteNotification(selectedNotification.id);
                        setSelectedNotification(null);
                        fetchNotifications();
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex justify-between items-start p-5 border-b transition ${
                    isPurpleTheme
                      ? "border-violet-700 hover:bg-[#35204F]"
                      : "border-slate-800 hover:bg-slate-800"
                  } ${
                    !notification.readStatus
                      ? isPurpleTheme
                        ? "bg-[#35204F] border-l-4 border-violet-400"
                        : "bg-slate-700 border-l-4 border-orange-500"
                      : isPurpleTheme
                        ? "bg-[#24163A]"
                        : "bg-slate-900"
                  }`}
                >
                  {/* Keep your existing click logic */}
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={async () => {
                      if (!notification.readStatus) {
                        await markAsRead(notification.id);
                      }

                      setSelectedNotification({
                        ...notification,
                        readStatus: true,
                      });

                      fetchNotifications();
                    }}
                  >
                    <h3
                      className={`font-semibold ${
                        isPurpleTheme ? "text-violet-100" : "text-white"
                      }`}
                    >
                      {notification.title}
                    </h3>

                    <p
                      className={`text-sm ${
                        isPurpleTheme ? "text-violet-200" : "text-gray-400"
                      }`}
                    >
                      {notification.message}
                    </p>
                  </div>

                  {/* Delete Icon */}
                  <Trash2
                    size={18}
                    className="ml-4 mt-1 cursor-pointer text-violet-400 hover:text-violet-200"
                    onClick={async (e) => {
                      e.stopPropagation(); // Prevent opening the notification

                      await deleteNotification(notification.id);

                      fetchNotifications();
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showMobileMenu && (
        <div className="absolute top-full left-0 w-full bg-slate-900 border-t border-slate-700 md:hidden">
          <div className="flex flex-col gap-4 p-5">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate(`/search/${keyword}`);
                    setShowMobileMenu(false);
                  }
                }}
                placeholder="Search anime..."
                className="w-full bg-slate-700 rounded-full pl-11 pr-10 py-3 text-white outline-none"
              />

              {keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    setSearchResults([]);
                    setDatabaseResults([]);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-600 transition"
                >
                  <X size={18} className="text-gray-400 hover:text-white" />
                </button>
              )}
            </div>
            {mergedResults.length > 0 && (
              <div className="mt-3 bg-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                {mergedResults.map((anime) => (
                  <Link
                    key={anime.id || anime.mal_id}
                    to={
                      anime.id ? `/anime/${anime.id}` : `/jikan/${anime.mal_id}`
                    }
                    onClick={() => {
                      setKeyword("");
                      setSearchResults([]);
                      setDatabaseResults([]);
                      setShowMobileMenu(false);
                    }}
                    className="flex items-center gap-3 p-3 border-b border-slate-700 hover:bg-slate-700"
                  >
                    <img
                      src={anime.posterUrl || anime.images?.jpg?.image_url}
                      alt={anime.title}
                      className="w-12 h-16 rounded-lg object-cover"
                    />

                    <div>
                      <h3 className="text-white font-semibold">
                        {anime.title}
                      </h3>

                      <p className="text-gray-400 text-sm">
                        {anime.releaseYear || anime.year || "Unknown"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div>
              <button
                onClick={() => setShowGenres(!showGenres)}
                className="flex justify-between items-center w-full text-white"
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard size={18} />
                  <span>Genres</span>
                </div>
                <span>{showGenres ? "▲" : "▼"}</span>
              </button>

              {showGenres && (
                <div className="mt-3 ml-4 flex flex-col gap-2">
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => {
                        setShowMobileMenu(false);
                        setShowGenres(false);

                        if (genre.name === "Popular") {
                          navigate("/popular");
                        } else {
                          navigate(`/genre/${genre.id}/${genre.name}`);
                        }
                      }}
                      className="text-left text-gray-300 hover:text-violet-400"
                    >
                      {genre.icon} {genre.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to={token ? "/profile?tab=overview" : "/login"}
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 text-white hover:text-violet-400 transition"
            >
              <User size={18} />
              <span>{token ? "Profile" : "Login"}</span>
            </Link>
            {token && role === "ROLE_ADMIN" && (
              <Link
                to="/admin"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-3 text-yellow-400 hover:text-yellow-300 transition"
              >
                <Crown size={18} />
                <span>Admin Dashboard</span>
              </Link>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings size={18} />
                <span className="text-white">Theme</span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPurpleTheme}
                  onChange={() => {
                    const newTheme = !isPurpleTheme;

                    setIsPurpleTheme(newTheme);

                    localStorage.setItem("theme", newTheme ? "purple" : "dark");

                    window.location.reload();
                  }}
                  className="sr-only peer"
                />

                <div className="w-12 h-6 bg-slate-700 rounded-full peer peer-checked:bg-violet-600 transition"></div>

                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-6"></div>
              </label>
            </div>

            {token && (
              <button
                onClick={() => {
                  setShowMobileMenu(false);

                  setTimeout(() => {
                    setShowNotifications(true);
                  }, 200);
                }}
                className="flex items-center gap-3 text-left text-white hover:text-violet-400 transition"
              >
                <Bell size={18} />
                <span>Notifications</span>
              </button>
            )}
            {token && (
              <button
                onClick={() => {
                  setShowMobileMenu(false);

                  setTimeout(() => {
                    setShowLogoutModal(true);
                  }, 150);
                }}
                className="flex items-center gap-3 text-left text-red-400 hover:text-red-300 transition"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      )}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[400px] rounded-3xl bg-[#151C2F] border border-violet-700 shadow-[0_0_35px_rgba(139,92,246,0.25)] p-8">
            <h2 className="text-2xl font-bold text-white mb-3">Logout</h2>

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
                onClick={() => {
                  localStorage.removeItem("token");
                  localStorage.removeItem("username");
                  localStorage.removeItem("role");
                  localStorage.removeItem("profileImage");
                  window.location.href = "/";
                }}
                className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
