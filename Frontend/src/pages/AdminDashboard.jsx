import Navbar from "../components/Navbar";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import { Pencil, Trash2, X } from "lucide-react";
import Select from "react-select";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  addAnime,
  getAllAnime,
  deleteAnime,
  updateAnime,
} from "../services/admin/animeAdminService";
import { getAnimeByTitle } from "../services/anime/jikanService";
import { searchDatabaseAnime } from "../services/anime/searchService";
import {
  addEpisode,
  getAllEpisodes,
  deleteEpisode,
  updateEpisode,
} from "../services/admin/episodeAdminService";
import { getAllUsers, deleteUser } from "../services/admin/userAdminService";
import {
  deleteNotification,
  sendNotification,
  getMyNotifications,
} from "../services/admin/notificationService";
import {
  getAllHeroBanners,
  addHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
} from "../services/home/heroBannerService";
import {
  uploadVideo,
  uploadImage,
  uploadTrailer,
} from "../services/upload/uploadService";
import { searchAnimeList } from "../services/anime/jikanService";
import genres from "../data/genres"; // change the path if needed

function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState([]);
  const [releaseYear, setReleaseYear] = useState("");
  const [rating, setRating] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [posterFile, setPosterFile] = useState(null);
  const [status, setStatus] = useState("");
  const [animeId, setAnimeId] = useState("");
  const [seasonNumber, setSeasonNumber] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [duration, setDuration] = useState("");
  const [animeList, setAnimeList] = useState([]);
  const [search, setSearch] = useState("");
  const [episodeList, setEpisodeList] = useState([]);
  const [editingAnimeId, setEditingAnimeId] = useState(null);
  const [editingEpisodeId, setEditingEpisodeId] = useState(null);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const episodeFormRef = useRef(null);
  const animeFormRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(
    localStorage.getItem("adminMenu") || "dashboard",
  );
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [sendType, setSendType] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerImageFile, setBannerImageFile] = useState(null);
  const [bannerGenre, setBannerGenre] = useState([]);
  const [bannerRating, setBannerRating] = useState("");
  const [bannerReleaseYear, setBannerReleaseYear] = useState("");
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [bannerDisplayOrder, setBannerDisplayOrder] = useState("");
  const [episodeLoading, setEpisodeLoading] = useState(false);
  const [animeLoading, setAnimeLoading] = useState(false);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedBannerAnimeId, setSelectedBannerAnimeId] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [malId, setMalId] = useState(null);
  const [expandedAnime, setExpandedAnime] = useState(null);
  const [trailerFile, setTrailerFile] = useState(null);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showCustomAnimePrompt, setShowCustomAnimePrompt] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState("");
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    fetchAnime();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (editingAnimeId && selectedMenu === "anime") {
      animeFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [editingAnimeId, selectedMenu]);

  useEffect(() => {
    localStorage.setItem("adminMenu", selectedMenu);
  }, [selectedMenu]);

  const fetchAnime = async () => {
    try {
      const data = await getAllAnime();
      setAnimeList(data);
      const episodes = await getAllEpisodes();
      const userData = await getAllUsers();
      setUsers(userData);
      setEpisodeList(episodes);

      const datas = await getAllHeroBanners();
      setHeroBanners(datas);
    } catch (error) {
      // Silent fail
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await getMyNotifications();
      setNotifications(data);
    } catch (error) {
      // Silent fail
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setAnimeLoading(true);
      let uploadedPosterUrl = posterUrl;

      if (posterFile) {
        uploadedPosterUrl = await uploadImage(
          posterFile,
          "anime-posters",
          title,
        );
      }
      let uploadedTrailerUrl = trailerUrl;

      if (trailerFile) {
        uploadedTrailerUrl = await uploadTrailer(trailerFile, title);
      }

      const animeRequest = {
        malId,
        title,
        description,
        genre: genre.map((g) => g.value).join(", "),
        releaseYear,
        rating,
        posterUrl: uploadedPosterUrl,
        trailerUrl: uploadedTrailerUrl,
        status,
      };

      if (editingAnimeId) {
        await updateAnime(editingAnimeId, animeRequest);

        toast.success("Anime Updated Successfully!");

        setEditingAnimeId(null);
      } else {
        await addAnime(animeRequest);

        toast.success("Anime Added Successfully!");
      }

      resetAnimeForm();

      fetchAnime();
      setAnimeLoading(false);
    } catch (error) {
      setAnimeLoading(false);
      toast.error("Failed to Save Anime");
    }
  };

  const resetAnimeForm = () => {
    setEditingAnimeId(null);

    setMalId(null);

    setTitle("");
    setDescription("");
    setGenre([]);
    setReleaseYear("");
    setRating("");
    setPosterUrl("");
    setPosterFile(null);
    setTrailerFile(null);
    setTrailerUrl("");
    setStatus("");

    const trailerInput = document.getElementById("trailerVideo");
    if (trailerInput) trailerInput.value = "";

    const input = document.getElementById("posterImage");

    if (input) {
      input.value = "";
    }
  };

  const resetBannerForm = () => {
    setEditingBannerId(null);

    setSelectedBannerAnimeId("");

    setBannerTitle("");
    setBannerDescription("");
    setBannerImageUrl("");
    setBannerImageFile(null);

    setBannerGenre([]);
    setBannerRating("");
    setBannerReleaseYear("");
    setBannerDisplayOrder("");

    const input = document.getElementById("bannerImage");
    if (input) input.value = "";
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setVideoFile(file);

    const video = document.createElement("video");

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);

      const totalSeconds = Math.floor(video.duration);

      setDuration(totalSeconds);
    };

    video.src = URL.createObjectURL(file);
  };

  const removeSelectedVideo = () => {
    setVideoFile(null);
    setDuration("");

    const fileInput = document.getElementById("episodeVideo");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleEpisodeSubmit = async (e) => {
    e.preventDefault();

    try {
      setEpisodeLoading(true);
      let uploadedVideoUrl = "";

      if (videoFile) {
        const selectedAnime = animeList.find(
          (anime) => anime.id === Number(animeId),
        );

        uploadedVideoUrl = await uploadVideo(
          videoFile,
          selectedAnime.title,
          Number(seasonNumber),
          Number(episodeNumber),
        );
      }

      const request = {
        seasonNumber: Number(seasonNumber),
        episodeNumber: Number(episodeNumber),
        title: episodeTitle,
        videoUrl: uploadedVideoUrl || currentVideoUrl,
        duration: Number(duration),
      };

      if (editingEpisodeId !== null) {
        await updateEpisode(editingEpisodeId, request);

        toast.success("Episode Updated Successfully!");
      } else {
        await addEpisode(animeId, request);

        toast.success("Episode Added Successfully!");
      }

      setEditingEpisodeId(null);
      setAnimeId("");
      setSeasonNumber(1);
      setEpisodeNumber("");
      setEpisodeTitle("");
      setDuration("");
      setVideoFile(null);
      setCurrentVideoUrl("");

      const input = document.getElementById("episodeVideo");
      if (input) input.value = "";

      fetchAnime();
      setEpisodeLoading(false);
    } catch (error) {
      setEpisodeLoading(false);
      toast.error("Failed to Save Episode");
    }
  };

  const handleSendNotification = async () => {
    try {
      await sendNotification({
        title: notificationTitle,
        message: notificationMessage,
        sendType,
        userId: sendType === "single" ? selectedUserId : null,
      });

      toast.success("Notification sent successfully!");
      await fetchNotifications();
      setNotificationTitle("");
      setNotificationMessage("");
      setSelectedUserId("");
      setSendType("all");
    } catch (error) {
      toast.error("Failed to send notification");
    }
  };

  const handleSearchAnime = async () => {
    if (!title.trim()) {
      toast.error("Enter an anime title first.");
      return;
    }

    setSearchLoading(true);

    try {
      // Search Jikan
      const jikanResults = await searchAnimeList(title);

      if (jikanResults.length > 0) {
        setSearchResults(jikanResults);
        setShowCustomAnimePrompt(false);
        setShowSearchModal(true);
        return;
      }

      // Search Database
      const dbResults = await searchDatabaseAnime(title);

      if (dbResults.length > 0) {
        setSearchResults(dbResults);
        setShowCustomAnimePrompt(false);
        setShowSearchModal(true);
        return;
      }

      // Nothing found
      setShowCustomAnimePrompt(true);
    } catch (error) {
      try {
        const dbResults = await searchDatabaseAnime(title);

        if (dbResults.length > 0) {
          setSearchResults(dbResults);
          setShowCustomAnimePrompt(false);
          setShowSearchModal(true);
        } else {
          setSearchResults([]);
          setShowSearchModal(false);
          setShowCustomAnimePrompt(true);
        }
      } catch {
        toast.error("Unable to search anime.");
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBannerSubmit = async () => {
    try {
      setBannerLoading(true);
      let uploadedBannerUrl = bannerImageUrl;
      if (bannerImageFile) {
        uploadedBannerUrl = await uploadImage(
          bannerImageFile,
          "hero-banners",
          bannerTitle,
        );
      }

      const selectedAnime = animeList.find(
        (anime) => anime.id === Number(selectedBannerAnimeId),
      );

      const banner = {
        malId: selectedAnime?.malId ?? null,
        title: bannerTitle,
        description: bannerDescription,
        bannerUrl: uploadedBannerUrl,
        genre: bannerGenre.map((g) => g.value).join(", "),
        rating: Number(bannerRating),
        releaseYear: Number(bannerReleaseYear),
        displayOrder: Number(bannerDisplayOrder),
      };

      if (editingBannerId) {
        await updateHeroBanner(editingBannerId, banner);
        toast.success("Hero Banner Updated!");
      } else {
        await addHeroBanner(banner);
        toast.success("Hero Banner Added!");
      }

      const data = await getAllHeroBanners();
      setHeroBanners(data);

      resetBannerForm();
      setBannerLoading(false);
    } catch (error) {
      setBannerLoading(false);
      toast.error("Failed to save Hero Banner");
    }
  };

  const groupedEpisodes = Object.values(
    episodeList.reduce((acc, episode) => {
      if (!acc[episode.animeTitle]) {
        acc[episode.animeTitle] = {
          ...episode,
          allEpisodes: [],
        };
      }

      // Keep all episodes
      acc[episode.animeTitle].allEpisodes.push(episode);

      // Keep latest episode as card
      const latest = acc[episode.animeTitle];

      if (
        episode.seasonNumber > latest.seasonNumber ||
        (episode.seasonNumber === latest.seasonNumber &&
          episode.episodeNumber > latest.episodeNumber)
      ) {
        acc[episode.animeTitle] = {
          ...episode,
          allEpisodes: latest.allEpisodes,
        };
      }

      return acc;
    }, {}),
  );

  const genreOptions = genres.map((genre) => ({
    value: genre.name,
    label: `${genre.icon} ${genre.name}`,
  }));

  const animeOptions = animeList.map((anime) => ({
    value: anime.id,
    label: anime.title,
  }));

  const selectedAnimeEpisodes = episodeList.filter((episode) => {
    const anime = animeList.find((a) => a.id === Number(animeId));

    return anime && anime.title === episode.animeTitle;
  });

  const availableSeasons = [
    ...new Set(selectedAnimeEpisodes.map((e) => e.seasonNumber)),
  ].sort((a, b) => a - b);

  const seasonOptions = [
    ...availableSeasons.map((season) => ({
      value: season,
      label: `Season ${season}`,
    })),

    ...(availableSeasons.length === 0
      ? [{ value: 1, label: "Season 1" }]
      : [
          {
            value: Math.max(...availableSeasons) + 1,
            label: `+ New Season ${Math.max(...availableSeasons) + 1}`,
          },
        ]),
  ];

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUser(userToDelete.id);

      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== userToDelete.id),
      );

      toast.success("User deleted successfully.");

      setShowDeleteConfirm(false);
      setShowUserModal(false);
      setSelectedUser(null);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Failed to delete user.");
    }
  };

  const handleDelete = async () => {
    try {
      switch (deleteType) {
        case "anime":
          await deleteAnime(deleteItem.id);
          break;

        case "episode":
          await deleteEpisode(deleteItem.id);
          break;

        case "banner":
          await deleteHeroBanner(deleteItem.id);
          break;

        case "notification":
          await deleteNotification(deleteItem.id);
          await fetchNotifications();
          break;

        default:
          return;
      }

      if (deleteType !== "notification") {
        fetchAnime();
      }

      toast.success("Deleted Successfully!");

      setShowDeleteModal(false);
      setDeleteItem(null);
      setDeleteType("");
    } catch (error) {
      toast.error("Delete failed.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#0f172a] pt-24 md:pt-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1700px] mx-auto flex flex-col xl:flex-row gap-6 xl:gap-8 items-start">
          {/* Sidebar */}
          <div className="w-full xl:w-[280px] bg-slate-900 rounded-3xl p-5 md:p-6 xl:sticky xl:top-28 self-start">
            <h2 className="text-2xl md:text-3xl font-bold text-violet-400 mb-6 md:mb-8">
              👑 Admin
            </h2>

            <div className="space-y-4 mt-6">
              <button
                onClick={() => setSelectedMenu("dashboard")}
                className={`w-full text-left rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base transition ${
                  selectedMenu === "dashboard"
                    ? "bg-violet-600 text-white"
                    : "hover:bg-slate-800"
                }`}
              >
                📊 Dashboard
              </button>

              <button
                onClick={() => setSelectedMenu("anime")}
                className={`w-full text-left rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base transition ${
                  selectedMenu === "anime"
                    ? "bg-violet-600 text-white"
                    : "hover:bg-slate-800"
                }`}
              >
                🎬 Anime
              </button>

              <button
                onClick={() => setSelectedMenu("episodes")}
                className={`w-full text-left rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base transition ${
                  selectedMenu === "episodes"
                    ? "bg-violet-600 text-white"
                    : "hover:bg-slate-800"
                }`}
              >
                ▶ Episodes
              </button>

              <button
                onClick={() => setSelectedMenu("banners")}
                className={`w-full text-left rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base transition ${
                  selectedMenu === "banners"
                    ? "bg-violet-600 text-white"
                    : "hover:bg-slate-800"
                }`}
              >
                🖼 Hero Banner
              </button>

              <button
                onClick={() => setSelectedMenu("notifications")}
                className={`w-full text-left rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base transition ${
                  selectedMenu === "notifications"
                    ? "bg-violet-600 text-white"
                    : "hover:bg-slate-800"
                }`}
              >
                🔔 Notifications
              </button>

              <button
                onClick={() => setSelectedMenu("users")}
                className={`w-full text-left rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base transition ${
                  selectedMenu === "users"
                    ? "bg-violet-600 text-white"
                    : "hover:bg-slate-800"
                }`}
              >
                👥 Users
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 w-full pb-10">
            {selectedMenu === "dashboard" && (
              <>
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-slate-800">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    Welcome Back 👋
                  </h1>

                  <p className="text-gray-400 mt-3 text-sm sm:text-base lg:text-lg">
                    Manage AnimeHub, users, episodes and notifications from one
                    place.
                  </p>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-6 lg:mt-8">
                  <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-800">
                    <p className="text-gray-400">🎬 Anime</p>
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-2 lg:mt-3">
                      {animeList.length}
                    </h2>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-800">
                    <p className="text-gray-400">▶ Episodes</p>
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-2 lg:mt-3">
                      {episodeList.length}
                    </h2>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-800">
                    <p className="text-gray-400">👥 Users</p>
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-2 lg:mt-3">
                      {users.length}
                    </h2>
                  </div>

                  <div className="bg-slate-900 rounded-3xl p-4 sm:p-5 lg:p-6 border border-slate-800">
                    <p className="text-gray-400">🖼 Hero Banner</p>
                    <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mt-2 lg:mt-3">
                      {heroBanners.length}
                    </h2>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 mt-6 lg:mt-8 border border-slate-800">
                  <h2 className="text-2xl lg:text-3xl font-bold mb-5 lg:mb-6">
                    ⚡ Quick Actions
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
                    <button
                      onClick={() => setSelectedMenu("anime")}
                      className="bg-violet-600 hover:bg-violet-700 rounded-2xl py-5 font-semibold transition"
                    >
                      ➕ Add Anime
                    </button>

                    <button
                      onClick={() => setSelectedMenu("episodes")}
                      className="bg-violet-600 hover:bg-violet-700 rounded-2xl py-5 font-semibold transition"
                    >
                      ➕ Add Episode
                    </button>

                    <button
                      onClick={() => setSelectedMenu("banners")}
                      className="bg-violet-600 hover:bg-violet-700 rounded-2xl py-5 font-semibold transition"
                    >
                      ➕ Hero Banner
                    </button>

                    <button
                      onClick={() => setSelectedMenu("notifications")}
                      className="bg-violet-600 hover:bg-violet-700 rounded-2xl py-5 font-semibold transition"
                    >
                      ➕ Notifications
                    </button>
                  </div>
                </div>
                {/* Keep your existing statistics cards here */}
              </>
            )}
            {selectedMenu === "anime" && (
              <>
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8 border border-slate-800">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    🎬 Anime Management
                  </h2>

                  <p className="text-gray-400 text-sm sm:text-base">
                    Add, edit and manage all anime.
                  </p>
                </div>

                {/* Add Anime Form */}
                <div
                  ref={animeFormRef}
                  className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl mt-6 lg:mt-8 mb-8 lg:mb-10"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 lg:mb-8">
                    Add Anime 🎬
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4">
                      <label className="font-medium text-gray-300">
                        Title :
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 pr-12 py-4 outline-none"
                            placeholder="Enter Anime Title"
                          />

                          {title && (
                            <button
                              type="button"
                              onClick={() => setTitle("")}
                              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-700 transition"
                            >
                              <X
                                size={18}
                                className="text-gray-400 hover:text-white"
                              />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleSearchAnime}
                          disabled={searchLoading}
                          className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed rounded-2xl px-6 py-4 font-semibold transition"
                        >
                          {searchLoading ? "Searching..." : "Search Jikan"}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4">
                      <label className="font-medium text-gray-300">
                        Description :
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        rows={3}
                        className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4">
                      <label className="font-medium text-gray-300">
                        Genre :
                      </label>
                      <Select
                        options={genreOptions}
                        isMulti
                        value={genre}
                        onChange={setGenre}
                        placeholder="Select Genres..."
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            backgroundColor: "#1e293b",
                            borderColor: state.isFocused
                              ? "#7c3aed"
                              : "#334155",
                            minHeight: "56px",
                            borderRadius: "16px",
                            boxShadow: "none",
                            "&:hover": {
                              borderColor: "#7c3aed",
                            },
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor: "#0f172a",
                            borderRadius: "16px",
                            overflow: "hidden",
                            zIndex: 9999,
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused
                              ? "#7c3aed"
                              : "#0f172a",
                            color: "white",
                            cursor: "pointer",
                          }),
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: "#7c3aed",
                            borderRadius: "8px",
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: "white",
                          }),
                          multiValueRemove: (base) => ({
                            ...base,
                            color: "white",
                            ":hover": {
                              backgroundColor: "#6d28d9",
                              color: "white",
                            },
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: "white",
                          }),
                          input: (base) => ({
                            ...base,
                            color: "white",
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: "#94a3b8",
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4">
                      <label className="font-medium text-gray-300">
                        Release Year :
                      </label>
                      <input
                        type="number"
                        value={releaseYear}
                        onChange={(e) => setReleaseYear(e.target.value)}
                        placeholder="Release Year"
                        className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4">
                      <label className="font-medium text-gray-300">
                        Rating :
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        placeholder="Rating"
                        className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4">
                      <label className="font-medium text-gray-300">
                        Poster Image :
                      </label>

                      <input
                        id="posterImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setPosterFile(e.target.files[0])}
                      />

                      <div className="w-full flex flex-col sm:flex-row sm:items-center bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                        <label
                          htmlFor="posterImage"
                          className="bg-violet-600 hover:bg-violet-700 px-6 py-4 cursor-pointer font-semibold text-center whitespace-nowrap"
                        >
                          Choose Image
                        </label>

                        <div className="flex-1 px-4 py-3 text-gray-300 truncate min-w-0">
                          {posterFile
                            ? posterFile.name
                            : editingAnimeId && posterUrl
                              ? "Current image uploaded (choose new image to replace)"
                              : "No image chosen"}
                        </div>

                        {posterFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setPosterFile(null);
                              document.getElementById("posterImage").value = "";
                            }}
                            className="px-4 text-xl text-gray-400 hover:text-red-500"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4">
                      <label className="font-medium text-gray-300">
                        Trailer URL :
                      </label>

                      <input
                        id="trailerVideo"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => setTrailerFile(e.target.files[0])}
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                        <label
                          htmlFor="trailerVideo"
                          className="bg-violet-600 hover:bg-violet-700 px-6 py-4 cursor-pointer font-semibold text-center whitespace-nowrap"
                        >
                          Choose Trailer
                        </label>

                        <div className="flex-1 px-4 py-3 text-gray-300 truncate min-w-0">
                          {trailerFile
                            ? trailerFile.name
                            : editingAnimeId && trailerUrl
                              ? "Current trailer uploaded"
                              : "No trailer selected"}
                        </div>

                        {trailerFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setTrailerFile(null);
                              document.getElementById("trailerVideo").value =
                                "";
                            }}
                            className="px-4 text-xl text-gray-400 hover:text-red-500"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4">
                      <label className="font-medium text-gray-300">
                        Status :
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none"
                      >
                        <option value="">Select Status</option>
                        <option value="ONGOING">ONGOING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="UPCOMING">UPCOMING</option>
                      </select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                      {!editingAnimeId && (
                        <button
                          type="submit"
                          disabled={animeLoading}
                          className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed rounded-2xl py-4 font-semibold transition"
                        >
                          {animeLoading ? "Adding Anime..." : "Add Anime"}
                        </button>
                      )}

                      {editingAnimeId && (
                        <>
                          <button
                            type="submit"
                            disabled={animeLoading}
                            className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed rounded-2xl py-4 font-semibold transition-all duration-300"
                          >
                            {animeLoading ? "Updating..." : "Update Anime"}
                          </button>

                          <button
                            type="button"
                            onClick={resetAnimeForm}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 rounded-2xl py-4 font-semibold transition"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </div>

                {/* Search */}
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 mt-6 lg:mt-8 border border-slate-800">
                  <h2 className="text-2xl sm:text-3xl font-bold mt-2 lg:mt-4 mb-5">
                    Anime List 🎥
                  </h2>
                  <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 mb-6 border border-slate-800">
                    <div className="relative">
                      <input
                        placeholder="Search Anime..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 outline-none"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />

                      {search && (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-700 transition"
                        >
                          <X
                            size={18}
                            className="text-gray-400 hover:text-white"
                          />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    {animeList
                      .filter((anime) =>
                        anime.title
                          .toLowerCase()
                          .includes(search.toLowerCase()),
                      )
                      .map((anime) => (
                        <div
                          key={anime.id}
                          className="bg-slate-800 rounded-3xl p-5 shadow-xl flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6"
                        >
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full">
                            <img
                              src={anime.posterUrl}
                              alt={anime.title}
                              className="w-28 h-40 sm:w-24 sm:h-32 lg:w-20 lg:h-28 rounded-2xl object-cover shadow-lg"
                            />

                            <div>
                              <h3 className="text-xl font-bold text-center sm:text-left">
                                {anime.title}
                              </h3>

                              <p className="text-gray-400 mt-2 text-center sm:text-left">
                                {anime.genre}
                              </p>

                              <p className="text-gray-500 text-sm mt-2 text-center sm:text-left">
                                {anime.releaseYear}
                              </p>

                              <span
                                className={`inline-block mt-3 px-4 py-2 rounded-full text-sm font-semibold ${
                                  anime.status === "ONGOING"
                                    ? "bg-green-600"
                                    : anime.status === "COMPLETED"
                                      ? "bg-blue-600"
                                      : "bg-violet-600"
                                }`}
                              >
                                {anime.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-center lg:justify-end gap-4 w-full lg:w-auto">
                            {/* Keep your existing Edit button */}
                            <button
                              className="w-12 h-12 rounded-full hover:bg-blue-600/20 text-blue-500 flex items-center justify-center transition"
                              title="Edit Anime"
                              onClick={() => {
                                setEditingAnimeId(anime.id);
                                setMalId(anime.malId ?? null);
                                setTitle(anime.title ?? "");
                                setDescription(anime.description ?? "");
                                setGenre(
                                  (anime.genre || "")
                                    .split(",")
                                    .map((g) => g.trim())
                                    .filter(Boolean)
                                    .map((g) => ({
                                      value: g,
                                      label: genres.find(
                                        (item) => item.name === g,
                                      )
                                        ? `${genres.find((item) => item.name === g).icon} ${g}`
                                        : g,
                                    })),
                                );
                                setReleaseYear(anime.releaseYear ?? "");
                                setRating(anime.rating ?? "");
                                setPosterUrl(anime.posterUrl ?? "");
                                setTrailerUrl(anime.trailerUrl ?? "");
                                setTrailerFile(null);
                                setStatus(anime.status ?? "");
                              }}
                            >
                              <Pencil size={18} />
                            </button>
                            {/* Keep your existing Delete button */}
                            <button
                              onClick={() => {
                                setDeleteType("anime");
                                setDeleteItem(anime);
                                setShowDeleteModal(true);
                              }}
                              className="w-12 h-12 rounded-full hover:bg-red-600/20 text-red-500 flex items-center justify-center transition"
                              title="Delete Anime"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            )}

            {showCustomAnimePrompt && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
                <div className="bg-slate-900 rounded-3xl p-8 w-[90%] max-w-md border border-slate-700">
                  <h2 className="text-2xl font-bold mb-4">Anime Not Found</h2>

                  <p className="text-gray-400 mb-8">
                    No anime was found in Jikan or your database.
                    <br />
                    <br />
                    Would you like to continue by creating a custom anime?
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowCustomAnimePrompt(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-2xl font-semibold"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => {
                        setShowCustomAnimePrompt(false);
                        setSearchResults([]);
                        setShowSearchModal(false);
                        toast.info(
                          "Fill in the form below to create a custom anime.",
                        );
                      }}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 py-3 rounded-2xl font-semibold"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}
            {selectedMenu === "episodes" && (
              <>
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8 border border-slate-800">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    ▶ Episode Management
                  </h2>

                  <p className="text-gray-400 text-sm sm:text-base">
                    Add, edit and manage all anime episodes.
                  </p>
                </div>

                {/* Add Episode Form */}
                <div
                  ref={episodeFormRef}
                  className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl mb-8 lg:mb-10"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold mb-6 lg:mb-8">
                    Add Episode ▶
                  </h2>

                  <form onSubmit={handleEpisodeSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4 mb-4">
                      <label className="font-medium text-gray-300">
                        Anime :
                      </label>

                      <Select
                        options={animeOptions}
                        value={
                          animeOptions.find(
                            (option) => option.value === Number(animeId),
                          ) || null
                        }
                        onChange={(selected) => {
                          setAnimeId(selected ? selected.value : "");
                          setSeasonNumber(1);
                        }}
                        placeholder="Search Anime..."
                        isSearchable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            backgroundColor: "#1e293b",
                            borderColor: state.isFocused
                              ? "#7c3aed"
                              : "#334155",
                            boxShadow: "none",
                            minHeight: "56px",
                            borderRadius: "16px",
                            color: "white",
                            "&:hover": {
                              borderColor: "#7c3aed",
                            },
                          }),

                          menu: (base) => ({
                            ...base,
                            backgroundColor: "#0f172a",
                            borderRadius: "16px",
                            overflow: "hidden",
                            zIndex: 9999,
                          }),

                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused
                              ? "#7c3aed"
                              : "#0f172a",
                            color: "white",
                            cursor: "pointer",
                          }),

                          singleValue: (base) => ({
                            ...base,
                            color: "white",
                          }),

                          input: (base) => ({
                            ...base,
                            color: "white",
                          }),

                          placeholder: (base) => ({
                            ...base,
                            color: "#94a3b8",
                          }),

                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4 mb-4">
                      <label className="font-medium text-gray-300">
                        Season Number :
                      </label>
                      <Select
                        options={seasonOptions}
                        value={
                          seasonOptions.find(
                            (option) => option.value === Number(seasonNumber),
                          ) || null
                        }
                        onChange={(selected) =>
                          setSeasonNumber(selected ? selected.value : 1)
                        }
                        placeholder="Select Season"
                        isSearchable={false}
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            backgroundColor: "#1e293b",
                            borderColor: state.isFocused
                              ? "#7c3aed"
                              : "#334155",
                            borderRadius: "16px",
                            minHeight: "56px",
                            boxShadow: "none",
                            "&:hover": {
                              borderColor: "#7c3aed",
                            },
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: "white",
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: "#94a3b8",
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor: "#0f172a",
                            color: "white",
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused
                              ? "#7c3aed"
                              : "#0f172a",
                            color: "white",
                          }),
                          input: (base) => ({
                            ...base,
                            color: "white",
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4 mb-4">
                      <label className="font-medium text-gray-300">
                        Episode Number :
                      </label>
                      <input
                        placeholder="Episode Number"
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none"
                        value={episodeNumber}
                        onChange={(e) => setEpisodeNumber(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4">
                      <label className="font-medium text-gray-300">
                        Episode Title :
                      </label>
                      <input
                        placeholder="Episode Title"
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 mb-4 outline-none"
                        value={episodeTitle}
                        onChange={(e) => setEpisodeTitle(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4 mb-4">
                      <label className="font-medium text-gray-300">
                        Episode Video :
                      </label>

                      <input
                        id="episodeVideo"
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                      />

                      <div className="flex flex-col sm:flex-row sm:items-center bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                        <label
                          htmlFor="episodeVideo"
                          className="bg-violet-600 hover:bg-violet-700 px-6 py-4 cursor-pointer font-semibold text-center whitespace-nowrap transition"
                        >
                          Choose File
                        </label>

                        <div className="flex-1 px-4 py-3 text-gray-300 truncate min-w-0">
                          {videoFile
                            ? videoFile.name
                            : editingEpisodeId && currentVideoUrl
                              ? "Current video uploaded (choose file to replace)"
                              : "No file chosen"}
                        </div>

                        {videoFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setVideoFile(null);
                              setDuration("");

                              document.getElementById("episodeVideo").value =
                                "";
                            }}
                            className="px-4 text-xl text-gray-400 hover:text-red-500 transition"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-[170px_1fr] items-start lg:items-center gap-3 lg:gap-4 mb-4">
                      <label className="font-medium text-gray-300">
                        Duration :
                      </label>

                      <input
                        placeholder="Duration"
                        value={duration}
                        readOnly
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 mb-4 outline-none text-gray-300 cursor-not-allowed"
                      />
                    </div>
                    {duration !== "" && (
                      <p className="text-sm text-gray-400 mb-4">
                        Duration: {Math.floor(duration / 60)}m {duration % 60}s
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        type="submit"
                        disabled={episodeLoading}
                        className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed rounded-2xl py-4 font-semibold transition"
                      >
                        {episodeLoading
                          ? editingEpisodeId
                            ? "Updating..."
                            : "Uploading..."
                          : editingEpisodeId
                            ? "Update Episode"
                            : "Add Episode"}
                      </button>

                      {editingEpisodeId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingEpisodeId(null);
                            setAnimeId("");
                            setSeasonNumber(1);
                            setEpisodeNumber("");
                            setEpisodeTitle("");
                            setDuration("");
                            setVideoFile(null);
                            setCurrentVideoUrl("");

                            const input =
                              document.getElementById("episodeVideo");
                            if (input) input.value = "";

                            toast.info("Episode edit cancelled");
                          }}
                          className="flex-1 bg-slate-700 hover:bg-slate-600 rounded-2xl py-4 font-semibold transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* Episode List */}
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 mt-6 border border-slate-800">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-5">
                    Episode List ▶
                  </h2>

                  <div className="space-y-6 mt-4">
                    {groupedEpisodes.map((episode) => {
                      const animeInfo = animeList.find(
                        (anime) => anime.title === episode.animeTitle,
                      );

                      return (
                        <div
                          key={episode.id}
                          className="bg-slate-800 rounded-3xl shadow-xl overflow-hidden hover:ring-2 hover:ring-violet-500/40 transition-all duration-300 border border-slate-700"
                        >
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center px-4 sm:px-6 py-5 gap-5">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full">
                              <img
                                src={animeInfo?.posterUrl}
                                alt={episode.animeTitle}
                                className="w-28 h-40 sm:w-24 sm:h-32 lg:w-20 lg:h-28 rounded-2xl object-cover shadow-lg"
                              />

                              <div>
                                <h3 className="text-xl font-bold text-violet-400 text-center sm:text-left">
                                  {episode.animeTitle}
                                </h3>

                                <p className="text-gray-300 mt-2">
                                  Latest : Season {episode.seasonNumber}
                                  {" • "}
                                  Episode {episode.episodeNumber}
                                </p>

                                <p className="text-white font-semibold mt-2">
                                  {episode.title}
                                </p>

                                <div className="flex gap-3 mt-4">
                                  <span className="bg-violet-600/20 text-violet-300 px-3 py-1 rounded-full text-sm font-semibold">
                                    {episode.allEpisodes.length} Episodes
                                  </span>

                                  <span className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                                    Latest S{episode.seasonNumber}E
                                    {episode.episodeNumber}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-center lg:justify-end gap-3 w-full lg:w-auto">
                              <button
                                onClick={() =>
                                  setExpandedAnime(
                                    expandedAnime === episode.animeTitle
                                      ? null
                                      : episode.animeTitle,
                                  )
                                }
                                className="flex items-center gap-2 text-violet-400 hover:text-violet-300 transition"
                              >
                                <span className="font-medium">Episodes</span>

                                {expandedAnime === episode.animeTitle ? (
                                  <ChevronUp size={22} />
                                ) : (
                                  <ChevronDown size={22} />
                                )}
                              </button>
                            </div>
                          </div>
                          {expandedAnime === episode.animeTitle && (
                            <div className="mt-4 rounded-b-3xl bg-slate-900 px-4 sm:px-6 py-4">
                              {episode.allEpisodes
                                .sort((a, b) => {
                                  if (a.seasonNumber !== b.seasonNumber) {
                                    return b.seasonNumber - a.seasonNumber;
                                  }

                                  return b.episodeNumber - a.episodeNumber;
                                })
                                .map((ep) => (
                                  <div
                                    key={ep.id}
                                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-700 py-5 last:border-b-0"
                                  >
                                    <div className="flex flex-col flex-1">
                                      <span className="text-violet-400 font-semibold text-sm text-center md:text-left">
                                        S{ep.seasonNumber} • Episode{" "}
                                        {ep.episodeNumber}
                                      </span>

                                      <span className="text-white font-medium mt-2 text-center md:text-left">
                                        {ep.title}
                                      </span>

                                      <span className="text-gray-500 text-sm mt-2 text-center md:text-left">
                                        {Math.floor(ep.duration / 60)}m{" "}
                                        {ep.duration % 60}s
                                      </span>
                                    </div>

                                    <div className="flex justify-center md:justify-end gap-3 w-full md:w-auto">
                                      <button
                                        onClick={() => {
                                          setEditingEpisodeId(ep.id);

                                          const anime = animeList.find(
                                            (a) => a.title === ep.animeTitle,
                                          );

                                          if (anime) {
                                            setAnimeId(anime.id);
                                          }

                                          setSeasonNumber(ep.seasonNumber);
                                          setEpisodeNumber(ep.episodeNumber);
                                          setEpisodeTitle(ep.title);
                                          setDuration(ep.duration);
                                          setCurrentVideoUrl(ep.videoUrl);

                                          episodeFormRef.current?.scrollIntoView(
                                            {
                                              behavior: "smooth",
                                              block: "start",
                                            },
                                          );
                                        }}
                                        className="w-12 h-12 rounded-full hover:bg-blue-600/20 text-blue-500 flex items-center justify-center transition"
                                        title="Edit Episode"
                                      >
                                        <Pencil size={18} />
                                      </button>

                                      <button
                                        onClick={() => {
                                          setDeleteType("episode");
                                          setDeleteItem(ep);
                                          setShowDeleteModal(true);
                                        }}
                                        className="w-12 h-12 rounded-full hover:bg-red-600/20 text-red-500 flex items-center justify-center transition"
                                        title="Delete Episode"
                                      >
                                        <Trash2 size={18} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {showSearchModal && (
              <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
                <div className="bg-slate-900 w-[95%] sm:w-[90%] lg:w-[900px] max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6 border border-slate-800 relative">
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold">
                      Search Results
                    </h2>

                    <button
                      type="button"
                      onClick={() => {
                        setShowSearchModal(false);
                        setSearchResults([]);
                      }}
                      className="p-2 rounded-full hover:bg-slate-700 transition"
                    >
                      <X className="w-6 h-6 text-red-500 hover:text-red-400" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {searchResults.length > 0 ? (
                      searchResults.map((anime) => (
                        <div
                          key={anime.mal_id || anime.id}
                          onClick={() => {
                            if (anime.id) {
                              setEditingAnimeId(anime.id);
                            } else {
                              setEditingAnimeId(null);
                            }

                            setMalId(anime.mal_id ?? anime.malId ?? null);
                            setTitle(anime.title || "");
                            setDescription(
                              anime.synopsis || anime.description || "",
                            );
                            setGenre(
                              anime.genres
                                ? anime.genres.map((g) => g.name).join(", ")
                                : anime.genre || "",
                            );
                            setReleaseYear(
                              anime.year || anime.releaseYear || "",
                            );
                            setRating(anime.score || anime.rating || "");
                            setPosterUrl(
                              anime.images?.jpg?.large_image_url ||
                                anime.posterUrl ||
                                "",
                            );
                            setTrailerUrl(
                              anime.trailer?.url || anime.trailerUrl || "",
                            );
                            setStatus(
                              anime.status === "Currently Airing"
                                ? "ONGOING"
                                : anime.status === "Finished Airing"
                                  ? "COMPLETED"
                                  : anime.status || "",
                            );

                            setPosterFile(null);
                            setShowSearchModal(false);

                            toast.success(
                              anime.id
                                ? "Anime loaded for editing."
                                : "Anime imported successfully!",
                            );
                          }}
                          className="flex flex-col sm:flex-row items-center sm:items-center gap-4 p-4 rounded-2xl bg-slate-800 hover:bg-violet-600 transition-all duration-300 cursor-pointer"
                        >
                          <img
                            src={
                              anime.images?.jpg?.large_image_url ||
                              anime.posterUrl
                            }
                            alt={anime.title}
                            className="w-24 h-32 sm:w-14 sm:h-20 rounded-xl object-cover flex-shrink-0 shadow-lg"
                          />

                          <div className="flex-1 overflow-hidden text-center sm:text-left w-full">
                            <h3 className="font-semibold text-lg sm:text-base line-clamp-2 sm:truncate">
                              {anime.title}
                            </h3>

                            <p className="text-sm text-gray-400 line-clamp-2 sm:truncate">
                              ⭐ {anime.score || anime.rating || "N/A"} •{" "}
                              {anime.year || anime.releaseYear || "-"}
                            </p>

                            <p className="text-xs text-violet-300 line-clamp-2 sm:truncate">
                              {anime.genres
                                ? anime.genres.map((g) => g.name).join(", ")
                                : anime.genre}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 px-4">
                        <div className="text-4xl sm:text-5xl mb-4">🎬</div>

                        <h2 className="text-xl sm:text-2xl font-bold">
                          No Anime Found
                        </h2>

                        <p className="text-sm sm:text-base text-gray-400 mt-2">
                          Search didn't return any results.
                        </p>

                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Continue filling the form to create a custom anime.
                        </p>

                        <button
                          onClick={() => setShowSearchModal(false)}
                          className="mt-6 w-full sm:w-auto bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl font-medium transition"
                        >
                          Continue
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {selectedMenu === "notifications" && (
              <>
                <div className="bg-slate-900 rounded-3xl p-5 md:p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    🔔 Notification Management
                  </h2>

                  <p className="text-sm md:text-base text-gray-400">
                    Send notifications to all users or a specific user.
                  </p>
                </div>

                {/* Notification Form */}
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-800 mb-8">
                  <h2 className="text-xl md:text-2xl font-bold mb-6">
                    📢 Send Notification
                  </h2>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-3 lg:gap-5 mb-5">
                      <label className="font-medium text-gray-300">
                        Notification Title :
                      </label>
                      <input
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                        placeholder="Notification Title"
                        className="w-full bg-slate-800 border border-slate-700 focus:border-violet-500 rounded-2xl px-5 py-4 outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-3 lg:gap-5 mb-5">
                      <label className="font-medium text-gray-300">
                        Message :
                      </label>
                      <textarea
                        rows={5}
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                        placeholder="Notification Message"
                        className="w-full bg-slate-800 border border-slate-700 focus:border-violet-500 rounded-2xl px-5 py-4 outline-none resize-none transition"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          checked={sendType === "all"}
                          onChange={() => setSendType("all")}
                        />
                        All Users
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          checked={sendType === "single"}
                          onChange={() => setSendType("single")}
                        />
                        Specific User
                      </label>
                    </div>
                    {sendType === "single" && (
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 focus:border-violet-500 rounded-2xl px-5 py-4 outline-none transition"
                      >
                        <option value="">Select User</option>

                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.username} ({user.email})
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={handleSendNotification}
                      className="w-full rounded-2xl bg-violet-600 hover:bg-violet-700 py-4 font-semibold transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-violet-600/20"
                    >
                      Send Notification
                    </button>
                  </div>
                </div>

                {/* Notification History */}
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-800">
                  <h2 className="text-xl md:text-2xl font-bold mb-6">
                    📜 Notification History
                  </h2>

                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="text-center text-gray-400 py-14 px-4">
                        <div className="text-4xl mb-4">🔔</div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          No Notifications Found
                        </h3>
                        <p className="text-sm text-gray-400">
                          Notifications sent from the admin will appear here.
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="bg-slate-800 border border-slate-700 hover:border-violet-500 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 transition-all duration-300"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-bold break-words">
                              {notification.title}
                            </h3>

                            <p className="text-sm md:text-base text-gray-400 mt-2 leading-7 break-words">
                              {notification.message}
                            </p>

                            <p className="text-xs md:text-sm text-violet-300 mt-3 break-all">
                              {new Date(
                                notification.createdAt,
                              ).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex justify-end lg:justify-center flex-shrink-0">
                            <button
                              onClick={() => {
                                setDeleteType("notification");
                                setDeleteItem(notification);
                                setShowDeleteModal(true);
                              }}
                              className="w-11 h-11 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-300 hover:scale-110"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}

            {selectedMenu === "banners" && (
              <>
                <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 lg:p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    🖼 Hero Banner Management
                  </h2>

                  <p className="text-sm md:text-base text-gray-400">
                    Upload and manage home page hero banners.
                  </p>
                </div>

                {/* Upload Banner */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleBannerSubmit();
                  }}
                  className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-800 mb-8"
                >
                  <h2 className="text-xl md:text-2xl font-bold mb-6">
                    📤 Upload Hero Banner
                  </h2>

                  <div className="grid grid-cols-1 2xl:grid-cols-2 gap-5 lg:gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] items-start md:items-center gap-3 md:gap-4">
                      <label className="font-medium text-gray-300">
                        Anime :
                      </label>
                      <Select
                        options={animeOptions}
                        value={
                          animeOptions.find(
                            (option) => option.value === selectedBannerAnimeId,
                          ) || null
                        }
                        onChange={(selected) => {
                          if (!selected) {
                            setSelectedBannerAnimeId("");
                            return;
                          }

                          const id = selected.value;

                          setSelectedBannerAnimeId(id);

                          const anime = animeList.find((a) => a.id === id);

                          if (!anime) return;

                          setBannerTitle(anime.title || "");
                          setBannerDescription(anime.description || "");
                          setBannerGenre(anime.genre || "");
                          setBannerRating(anime.rating || "");
                          setBannerReleaseYear(anime.releaseYear || "");
                        }}
                        placeholder="Select Anime..."
                        isSearchable
                        isClearable
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            backgroundColor: "#1e293b",
                            borderColor: state.isFocused
                              ? "#7c3aed"
                              : "#334155",
                            minHeight: "56px",
                            borderRadius: "16px",
                            boxShadow: "none",
                            "&:hover": {
                              borderColor: "#7c3aed",
                            },
                          }),

                          menu: (base) => ({
                            ...base,
                            backgroundColor: "#0f172a",
                            borderRadius: "16px",
                            overflow: "hidden",
                            zIndex: 9999,
                          }),

                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused
                              ? "#7c3aed"
                              : "#0f172a",
                            color: "white",
                            cursor: "pointer",
                          }),

                          singleValue: (base) => ({
                            ...base,
                            color: "white",
                          }),

                          input: (base) => ({
                            ...base,
                            color: "white",
                          }),

                          placeholder: (base) => ({
                            ...base,
                            color: "#94a3b8",
                          }),

                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] items-start md:items-center gap-3 md:gap-4">
                      <label className="font-medium text-gray-300">
                        Banner Image :
                      </label>

                      <input
                        id="bannerImage"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setBannerImageFile(e.target.files[0])}
                      />

                      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                        <label
                          htmlFor="bannerImage"
                          className="bg-violet-600 hover:bg-violet-700 px-6 py-4 text-center cursor-pointer font-semibold whitespace-nowrap"
                        >
                          Choose Image
                        </label>

                        <div className="flex-1 px-4 py-3 sm:py-0 text-gray-300 break-all">
                          {bannerImageFile
                            ? bannerImageFile.name
                            : editingBannerId && bannerImageUrl
                              ? "Current image uploaded (choose new image to replace)"
                              : "No image chosen"}
                        </div>

                        {bannerImageFile && (
                          <button
                            type="button"
                            onClick={() => {
                              setBannerImageFile(null);
                              document.getElementById("bannerImage").value = "";
                            }}
                            className="px-4 py-3 sm:py-0 text-xl text-gray-400 hover:text-red-500 transition"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] items-start md:items-center gap-3 md:gap-4">
                      <label className="font-medium text-gray-300">
                        Display Order :
                      </label>
                      <input
                        type="number"
                        value={bannerDisplayOrder}
                        onChange={(e) => setBannerDisplayOrder(e.target.value)}
                        placeholder="Display Order"
                        className="w-full bg-slate-800 border border-slate-700 focus:border-violet-500 rounded-2xl px-5 py-4 outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] items-start md:items-center gap-3 md:gap-4">
                      <label className="font-medium text-gray-300">
                        Description :
                      </label>
                      <textarea
                        rows={4}
                        value={bannerDescription}
                        onChange={(e) => setBannerDescription(e.target.value)}
                        placeholder="Description"
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] items-start md:items-center gap-3 md:gap-4">
                      <label className="font-medium text-gray-300">
                        Genre :
                      </label>

                      <Select
                        options={genreOptions}
                        isMulti
                        value={bannerGenre}
                        onChange={setBannerGenre}
                        placeholder="Select Genres..."
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          control: (base, state) => ({
                            ...base,
                            backgroundColor: "#1e293b",
                            borderColor: state.isFocused
                              ? "#7c3aed"
                              : "#334155",
                            minHeight: "56px",
                            borderRadius: "16px",
                            boxShadow: "none",
                            "&:hover": {
                              borderColor: "#7c3aed",
                            },
                          }),
                          menu: (base) => ({
                            ...base,
                            backgroundColor: "#0f172a",
                            borderRadius: "16px",
                            overflow: "hidden",
                            zIndex: 9999,
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isFocused
                              ? "#7c3aed"
                              : "#0f172a",
                            color: "white",
                            cursor: "pointer",
                          }),
                          multiValue: (base) => ({
                            ...base,
                            backgroundColor: "#7c3aed",
                            borderRadius: "8px",
                          }),
                          multiValueLabel: (base) => ({
                            ...base,
                            color: "white",
                          }),
                          multiValueRemove: (base) => ({
                            ...base,
                            color: "white",
                            ":hover": {
                              backgroundColor: "#6d28d9",
                              color: "white",
                            },
                          }),
                          singleValue: (base) => ({
                            ...base,
                            color: "white",
                          }),
                          input: (base) => ({
                            ...base,
                            color: "white",
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: "#94a3b8",
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] items-start md:items-center gap-3 md:gap-4">
                      <label className="font-medium text-gray-300">
                        Rating :
                      </label>
                      <input
                        type="number"
                        value={bannerRating}
                        onChange={(e) => setBannerRating(e.target.value)}
                        placeholder="Rating"
                        className="w-full bg-slate-800 border border-slate-700 focus:border-violet-500 rounded-2xl px-5 py-4 outline-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[130px_1fr] items-start md:items-center gap-3 md:gap-4">
                      <label className="font-medium text-gray-300">
                        Release Year :
                      </label>
                      <input
                        type="number"
                        value={bannerReleaseYear}
                        onChange={(e) => setBannerReleaseYear(e.target.value)}
                        placeholder="Release Year"
                        className="w-full bg-slate-800 border border-slate-700 focus:border-violet-500 rounded-2xl px-5 py-4 outline-none transition"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4 mt-8">
                    {!editingBannerId ? (
                      <button
                        type="submit"
                        disabled={bannerLoading}
                        className="flex-1 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed py-4 font-semibold transition-all duration-300"
                      >
                        {bannerLoading ? "Uploading Banner..." : "Add Banner"}
                      </button>
                    ) : (
                      <>
                        <button
                          type="submit"
                          disabled={bannerLoading}
                          className="flex-1 rounded-2xl bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed py-4 font-semibold transition-all duration-300"
                        >
                          {bannerLoading
                            ? "Updating Banner..."
                            : "Update Banner"}
                        </button>

                        <button
                          type="button"
                          onClick={resetBannerForm}
                          className="flex-1 rounded-2xl bg-slate-700 hover:bg-slate-600 py-4 font-semibold transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </form>

                {/* Banner List */}
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 border border-slate-800">
                  <h2 className="text-xl md:text-2xl font-bold mb-6">
                    🖼 Hero Banner List
                  </h2>

                  <div className="space-y-5">
                    {heroBanners.map((banner) => (
                      <div
                        key={banner.id}
                        className="bg-slate-800 border border-slate-700 hover:border-violet-500 rounded-3xl p-5 lg:p-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 transition-all duration-300"
                      >
                        {/* Banner Info */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 flex-1">
                          <img
                            src={banner.bannerUrl}
                            alt={banner.title}
                            className="w-full sm:w-44 h-48 sm:h-24 rounded-2xl object-cover shadow-lg flex-shrink-0"
                          />

                          <div className="text-center sm:text-left flex-1">
                            <h3 className="text-xl font-bold break-words">
                              {banner.title}
                            </h3>

                            <p className="text-gray-400 text-sm mt-1 break-words">
                              {banner.genre}
                            </p>

                            <p className="text-sm text-yellow-400 mt-2 font-medium">
                              ⭐ {banner.rating}
                            </p>
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-row justify-center sm:justify-end gap-3 w-full lg:w-auto flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingBannerId(banner.id);

                              setBannerTitle(banner.title ?? "");
                              setBannerDescription(banner.description ?? "");
                              setBannerImageUrl(banner.bannerUrl ?? "");
                              console.log("Banner Genre:", banner.genre);
                              setBannerGenre(
                                (banner.genre || "")
                                  .split(",")
                                  .map((g) => g.trim())
                                  .filter(Boolean)
                                  .map((g) => ({
                                    value: g,
                                    label: genres.find(
                                      (item) => item.name === g,
                                    )
                                      ? `${genres.find((item) => item.name === g).icon} ${g}`
                                      : g,
                                  })),
                              );
                              setBannerRating(banner.rating ?? "");
                              setBannerReleaseYear(banner.releaseYear ?? "");
                              setBannerDisplayOrder(banner.displayOrder ?? "");

                              const anime = animeList.find(
                                (a) => a.malId === banner.malId,
                              );

                              if (anime) {
                                setSelectedBannerAnimeId(anime.id);
                              } else {
                                setSelectedBannerAnimeId("");
                              }

                              setBannerImageFile(null);

                              window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                              });
                            }}
                            className="w-11 h-11 rounded-full bg-slate-700 hover:bg-blue-600 text-blue-400 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                            title="Edit Herobanner"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteType("banner");
                              setDeleteItem(banner);
                              setShowDeleteModal(true);
                            }}
                            className="w-11 h-11 rounded-full bg-slate-700 hover:bg-red-600 text-red-400 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-110"
                            title="Delete Herobanner"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {selectedMenu === "users" && (
              <>
                <div className="bg-slate-900 rounded-3xl p-5 sm:p-8 mb-8 border border-slate-800">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    👥 User Management
                  </h2>

                  <p className="text-gray-400">
                    View and manage all registered users.
                  </p>
                </div>
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 mb-6 border border-slate-800">
                  <div className="relative">
                    <input
                      placeholder="Search User..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 outline-none"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                    {userSearch && (
                      <button
                        onClick={() => setUserSearch("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Users Table */}
                <div className="bg-slate-900 rounded-3xl overflow-x-auto border border-slate-800 mb-8">
                  <div className="hidden lg:block bg-slate-900 rounded-3xl overflow-x-auto border border-slate-800 mb-8">
                    <table className="w-full">
                      <thead className="bg-slate-800">
                        <tr>
                          <th className="text-left pl-12 pr-5 py-5">
                            Username
                          </th>
                          <th className="text-left pl-8">Email</th>
                          <th className="text-left p-5">Role</th>
                          <th className="text-left p-5">Status</th>
                          <th className="text-left p-5">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {users
                          .filter(
                            (user) =>
                              user.username
                                .toLowerCase()
                                .includes(userSearch.toLowerCase()) ||
                              user.email
                                .toLowerCase()
                                .includes(userSearch.toLowerCase()),
                          )
                          .map((user) => (
                            <tr
                              key={user.id}
                              className="border-t border-slate-700 hover:bg-slate-800 "
                            >
                              <td className="pl-12 pr-5 py-5">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      user.profileImage ||
                                      `https://ui-avatars.com/api/?name=${user.username}`
                                    }
                                    className="w-10 h-10 rounded-full object-cover"
                                  />

                                  <span>{user.username}</span>
                                </div>
                              </td>

                              <td className="p-5">{user.email}</td>

                              <td className="p-5">
                                <span
                                  className={`px-3 py-1 rounded-full text-sm ${
                                    user.role === "ROLE_ADMIN"
                                      ? "bg-violet-600"
                                      : "bg-green-600"
                                  }`}
                                >
                                  {user.role}
                                </span>
                              </td>
                              <td className="p-5">
                                <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
                                  Active
                                </span>
                              </td>

                              <td className="p-5">
                                <button
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserModal(true);
                                  }}
                                  className="bg-violet-600 hover:bg-violet-700 px-5 py-2 rounded-xl transition"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="lg:hidden space-y-4 mb-8">
                  {users
                    .filter(
                      (user) =>
                        user.username
                          .toLowerCase()
                          .includes(userSearch.toLowerCase()) ||
                        user.email
                          .toLowerCase()
                          .includes(userSearch.toLowerCase()),
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-5"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={
                              user.profileImage ||
                              `https://ui-avatars.com/api/?name=${user.username}`
                            }
                            className="w-14 h-14 rounded-full object-cover"
                          />

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate">
                              {user.username}
                            </h3>

                            <p className="text-sm text-gray-400 break-all">
                              {user.email}
                            </p>

                            <div className="flex gap-2 mt-2 flex-wrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs ${
                                  user.role === "ROLE_ADMIN"
                                    ? "bg-violet-600"
                                    : "bg-green-600"
                                }`}
                              >
                                {user.role}
                              </span>

                              <span className="bg-green-600 px-3 py-1 rounded-full text-xs">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="w-full mt-5 bg-violet-600 hover:bg-violet-700 py-3 rounded-xl transition"
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-3xl border border-slate-700 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img
                src={
                  selectedUser.profileImage ||
                  "https://ui-avatars.com/api/?name=" + selectedUser.username
                }
                alt={selectedUser.username}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-violet-600 object-cover"
              />

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold">{selectedUser.username}</h2>

                <p className="text-gray-400">{selectedUser.email}</p>

                <span className="inline-block mt-2 bg-violet-600 px-3 py-1 rounded-full text-sm">
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">Username</p>
                <p className="font-semibold">{selectedUser.username}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">Email</p>
                <p className="font-semibold break-all">{selectedUser.email}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="font-semibold">{selectedUser.phone || "-"}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">Gender</p>
                <p className="font-semibold">{selectedUser.gender || "-"}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">Date of Birth</p>
                <p className="font-semibold">{selectedUser.dob || "-"}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4">
                <p className="text-gray-400 text-sm">Role</p>

                <span
                  className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedUser.role === "ROLE_ADMIN"
                      ? "bg-red-600"
                      : "bg-green-600"
                  }`}
                >
                  {selectedUser.role}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 mt-8">
              {selectedUser.role !== "ROLE_ADMIN" && (
                <button
                  onClick={() => {
                    setUserToDelete(selectedUser);
                    setShowDeleteConfirm(true);
                  }}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl transition"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete User
                </button>
              )}

              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-[420px] mx-4">
            <h2 className="text-2xl font-bold text-center">Delete User</h2>

            <p className="text-gray-400 text-center mt-4">
              Are you sure you want to delete
              <span className="font-semibold text-white">
                {" "}
                {userToDelete?.username}
              </span>
              ?
            </p>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 py-3 rounded-xl transition"
              >
                No
              </button>

              <button
                onClick={handleDeleteUser}
                className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-8 shadow-2xl">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="text-red-500" size={30} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center">
              Delete{" "}
              {deleteType === "anime"
                ? "Anime"
                : deleteType === "episode"
                  ? "Episode"
                  : "Hero Banner"}
              ?
            </h2>

            <p className="text-gray-400 text-center mt-4">
              Are you sure you want to delete this{" "}
              <span className="font-semibold text-white">
                {deleteType === "anime"
                  ? "anime"
                  : deleteType === "episode"
                    ? "episode"
                    : "hero banner"}
              </span>
              ?
            </p>

            <p className="text-sm text-red-400 text-center mt-2">
              This action cannot be undone.
            </p>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteItem(null);
                  setDeleteType("");
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 rounded-2xl py-3 font-semibold transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 rounded-2xl py-3 font-semibold transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;
