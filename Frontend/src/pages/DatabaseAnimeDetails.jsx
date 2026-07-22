import { FaPlay } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import {
  getDatabaseAnimeById,
  getDatabaseAnimeByMalId,
} from "../services/anime/databaseAnimeService";
import {
  getEpisodesByAnime,
  getEpisodesBySeason,
} from "../services/anime/databaseEpisodeService";
import {
  getAnimeCharacters,
  getAnimeRecommendations,
} from "../services/anime/jikanService";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
} from "../services/user/favoriteService";

import {
  addWatchlist,
  removeWatchlist,
  getWatchlist,
} from "../services/user/watchlistService";
import {
  getReviews,
  addReview,
  getAverageRating,
} from "../services/user/reviewService";

function DatabaseAnimeDetails() {
  const { id } = useParams();

  const [anime, setAnime] = useState(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [episodePage, setEpisodePage] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [characters, setCharacters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlist, setIsWatchlist] = useState(false);

  useEffect(() => {
    const fetchAnime = async () => {
      let animeData;

      try {
        animeData = await getDatabaseAnimeById(id);

        setAnime(animeData);
      } catch (error) {
        toast.error("Failed to load anime details.");
        return;
      }

      try {
        const reviewData = await getReviews(animeData.id);
        setUserReviews(reviewData);

        const avg = await getAverageRating(animeData.id);
        setAverageRating(avg);

        const favorites = await getFavorites();

        setIsFavorite(favorites.some((fav) => fav.malId === animeData.malId));

        const watchlist = await getWatchlist();

        setIsWatchlist(
          watchlist.some((item) => item.malId === animeData.malId),
        );
      } catch (error) {
      }

      try {
        if (animeData.malId) {
          const characterData = await getAnimeCharacters(animeData.malId);
          setCharacters(characterData);

          const recommendationData = await getAnimeRecommendations(
            animeData.malId,
          );
          setRecommendations(recommendationData);
        }
      } catch (error) {
      }
    };

    fetchAnime();
  }, [id]);

  useEffect(() => {
    if (!anime) return;

    const fetchEpisodes = async () => {
      try {
        const data = await getEpisodesByAnime(anime.id);

        setEpisodes(data);

        if (data.length > 0 && !selectedEpisode) {
          setSelectedEpisode(data[0].id);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchEpisodes();
  }, [anime, episodePage]);

  if (!anime) {
    return (
      <>
        <Navbar />

        <div className="p-8 pt-24">
          <div className="grid lg:grid-cols-[25%_75%] gap-6">
            {/* Left Skeleton */}
            <div className="bg-slate-900 rounded-3xl p-6 animate-pulse">
              <div className="w-60 h-[340px] bg-slate-800 rounded-3xl mx-auto"></div>

              <div className="h-8 bg-slate-800 rounded mt-6"></div>

              <div className="space-y-3 mt-6">
                <div className="h-4 bg-slate-800 rounded"></div>
                <div className="h-4 bg-slate-800 rounded"></div>
                <div className="h-4 bg-slate-800 rounded"></div>
              </div>
            </div>

            {/* Right Skeleton */}
            <div className="bg-slate-900 rounded-3xl p-6 animate-pulse">
              <div className="h-[550px] bg-slate-800 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleFavorite = async () => {
    try {
      if (isFavorite) {
        await removeFavorite(anime.malId);

        setIsFavorite(false);
        toast.success("Removed from Favorites ❤️");
        return;
      }

      await addFavorite({
        malId: anime.malId,
        title: anime.title,
        description: anime.description,
        genre: anime.genre,
        releaseYear: anime.releaseYear,
        rating: anime.rating,
        posterUrl: anime.posterUrl,
        status: anime.status,
        featured: anime.featured,
        heroOrder: anime.heroOrder,
        bannerUrl: anime.bannerUrl,
      });

      setIsFavorite(true);
      toast.success("Added to Favorites ❤️");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };

  const handleWatchlist = async () => {
    try {
      if (isWatchlist) {
        await removeWatchlist(anime.malId);

        setIsWatchlist(false);
        toast.success("Removed from Watchlist 📌");
        return;
      }

      await addWatchlist({
        malId: anime.malId,
        title: anime.title,
        description: anime.description,
        genre: anime.genre,
        releaseYear: anime.releaseYear,
        rating: anime.rating,
        posterUrl: anime.posterUrl,
        status: anime.status,
        featured: anime.featured,
        heroOrder: anime.heroOrder,
        bannerUrl: anime.bannerUrl,
      });

      setIsWatchlist(true);
      toast.success("Added to Watchlist 📌");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong.");
    }
  };

  const handleReview = async () => {
    try {
      await addReview(anime.id, {
        rating,
        comment,
      });

      const reviewData = await getReviews(anime.id);
      setUserReviews(reviewData);

      const avg = await getAverageRating(anime.id);
      setAverageRating(avg);

      setRating(5);
      setComment("");

      toast.success("Review submitted successfully ⭐");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to submit review.");
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return null;

    if (url.includes("youtu.be/")) {
      return `https://www.youtube.com/embed/${url.split("youtu.be/")[1]}`;
    }

    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }

    return url;
  };

  return (
    <>
      <Navbar />

      <div className="p-8 pt-24">
        {/* Top Section */}
        <div className="grid lg:grid-cols-[25%_75%] gap-6 items-start">
          {/* Left Side */}
          <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col items-center h-full">
            <img
              src={anime.posterUrl}
              alt={anime.title}
              className="w-60 rounded-3xl shadow-2xl"
            />

            <h1 className="text-3xl font-bold mt-6 text-center">
              {anime.title}
            </h1>

            <p className="text-gray-400 mt-4">{anime.description}</p>

            <div className="flex gap-4 mt-6 justify-center">
              <button
                onClick={handleFavorite}
                className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  isFavorite
                    ? "bg-red-600 border border-red-600 text-white hover:bg-red-700"
                    : "bg-slate-900 border border-violet-500 text-violet-300 hover:bg-red-600 hover:border-red-600 hover:text-white"
                }`}
              >
                {isFavorite ? "❤️ In Favorites" : "🤍 Add to Favorites"}
              </button>

              <button
                onClick={handleWatchlist}
                className={`flex-1 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                  isWatchlist
                    ? "bg-orange-500 border border-orange-500 text-white hover:bg-orange-600"
                    : "bg-slate-900 border border-violet-500 text-violet-300 hover:bg-orange-500 hover:border-orange-500 hover:text-white"
                }`}
              >
                {isWatchlist ? "📌 In Watchlist" : "➕ Add to Watchlist"}
              </button>
            </div>
          </div>

          {/* Right Side */}
          <div>
            <div className=" bg-slate-900 rounded-3xl p-6 shadow-2xl h-full">
              <div className="relative">
                {anime.trailerUrl ? (
                  <div className="relative w-[90%] mx-auto">
                    <video
                      ref={videoRef}
                      controls
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full h-[550px] rounded-3xl bg-black object-cover"
                    >
                      <source src={anime.trailerUrl} type="video/mp4" />
                    </video>

                    {!isPlaying && (
                      <div
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={() => videoRef.current?.play()}
                      >
                        <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition">
                          <FaPlay className="text-black text-3xl ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-[90%] h-[550px] mx-auto rounded-3xl bg-slate-800 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold">
                        🎬 Trailer Coming Soon
                      </h2>

                      <p className="text-gray-400 mt-4">
                        Trailer is not available for this anime.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-8 mt-8 border-b border-gray-700 pb-4">
              <button
                onClick={() => setActiveTab("overview")}
                className={`font-semibold ${
                  activeTab === "overview"
                    ? "text-orange-500 border-b-2 border-orange-500 pb-2"
                    : "text-gray-400"
                }`}
              >
                Overview
              </button>

              <button
                onClick={() => setActiveTab("episodes")}
                className={`font-semibold ${
                  activeTab === "episodes"
                    ? "text-orange-500 border-b-2 border-orange-500 pb-2"
                    : "text-gray-400"
                }`}
              >
                Episodes
              </button>

              <button
                onClick={() => setActiveTab("characters")}
                className={`font-semibold ${
                  activeTab === "characters"
                    ? "text-orange-500 border-b-2 border-orange-500 pb-2"
                    : "text-gray-400"
                }`}
              >
                Characters
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`font-semibold ${
                  activeTab === "reviews"
                    ? "text-orange-500 border-b-2 border-orange-500 pb-2"
                    : "text-gray-400"
                }`}
              >
                Reviews
              </button>
              <button
                onClick={() => setActiveTab("similar")}
                className={`font-semibold ${
                  activeTab === "similar"
                    ? "text-orange-500 border-b-2 border-orange-500 pb-2"
                    : "text-gray-400"
                }`}
              >
                Similar Anime
              </button>
            </div>
            {activeTab === "overview" && (
              <div className="mt-8 bg-slate-900 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-4">Description</h2>

                <p className="text-gray-300 leading-8">{anime.description}</p>
              </div>
            )}
            {/* Episodes */}

            {activeTab === "characters" && (
              <div className="mt-8 bg-slate-900 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">Characters</h2>

                {characters.length === 0 ? (
                  <div className="bg-[#1b1b1b] rounded-2xl p-10 text-center">
                    <div className="text-6xl mb-4">👥</div>

                    <h3 className="text-2xl font-bold">No Characters Found</h3>

                    <p className="text-gray-400 mt-3">
                      Character information is currently unavailable for this
                      anime.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {characters.slice(0, 12).map((item) => (
                      <div
                        key={item.character.mal_id}
                        className="bg-[#1b1b1b] rounded-2xl overflow-hidden hover:scale-105 transition duration-300"
                      >
                        <img
                          src={item.character.images.jpg.image_url}
                          alt={item.character.name}
                          className="w-full h-72 object-cover"
                        />

                        <div className="p-4">
                          <h3 className="font-semibold text-lg">
                            {item.character.name}
                          </h3>

                          <p className="text-sm text-gray-400 mt-2">
                            {item.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="mt-8 bg-slate-900 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">Reviews</h2>

                {/* Average Rating */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">
                    ⭐ Average Rating: {String(averageRating)}
                  </h3>
                </div>

                {/* Add Review */}
                <div className="bg-[#1b1b1b] rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-semibold mb-4">Write a Review</h3>

                  <div className="mb-4">
                    <label className="block mb-2">Rating</label>

                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="bg-slate-800 p-3 rounded-xl w-full"
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <option key={star} value={star}>
                          {star} Star
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    rows={5}
                    placeholder="Write your review..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-800 rounded-xl p-4 resize-none"
                  />

                  <button
                    onClick={handleReview}
                    className="mt-4 bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-xl font-semibold"
                  >
                    Submit Review
                  </button>
                </div>

                {/* Review List */}
                {userReviews.length === 0 ? (
                  <div className="bg-[#1b1b1b] rounded-2xl p-8 text-center">
                    <h3 className="text-xl font-semibold text-gray-300">
                      No Reviews Yet
                    </h3>

                    <p className="text-gray-500 mt-2">
                      Be the first to share your thoughts about this anime.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {userReviews.map((review) => (
                      <div
                        key={`${review.username}-${review.createdAt}`}
                        className="bg-[#1b1b1b] rounded-2xl p-5"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg">
                            {review.username}
                          </h3>

                          <span className="text-gray-400 text-sm">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-yellow-400 mt-2">
                          ⭐ {review.rating}/5
                        </p>

                        <p className="text-gray-300 mt-4">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "similar" && (
              <div className="mt-8 bg-slate-900 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">Similar Anime</h2>

                {recommendations.length === 0 ? (
                  <div className="bg-[#1b1b1b] rounded-2xl p-10 text-center">
                    <div className="text-6xl mb-4">🎬</div>

                    <h3 className="text-2xl font-bold">
                      No Similar Anime Found
                    </h3>

                    <p className="text-gray-400 mt-3">
                      We couldn't find any similar anime recommendations for
                      this anime.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recommendations.slice(0, 8).map((item) => (
                      <Link
                        key={item.entry.mal_id}
                        to={`/anime/${item.entry.mal_id}`}
                      >
                        <div className="bg-[#1b1b1b] rounded-2xl overflow-hidden hover:scale-105 transition duration-300">
                          <img
                            src={item.entry.images.jpg.large_image_url}
                            alt={item.entry.title}
                            className="w-full h-72 object-cover"
                          />

                          <div className="p-4">
                            <h3 className="font-semibold line-clamp-2">
                              {item.entry.title}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Episode List */}
            {activeTab === "episodes" && (
              <div className="mt-8 bg-slate-900 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <button className="bg-[#1b1b1b] px-5 py-3 rounded-xl font-semibold hover:bg-[#2a2a2a] transition">
                    Season 1 ▼
                  </button>

                  <span className="text-gray-400">
                    {episodes.length} Episodes
                  </span>
                </div>

                {episodes.map((episode) => (
                  <Link
                    key={episode.id}
                    to={`/db/watch/${anime.id}/${episode.id}`}
                  >
                    <div className="flex items-center gap-5 p-4 rounded-2xl cursor-pointer transition border border-transparent bg-[#1b1b1b] hover:bg-[#2a2a2a]">
                      {/* Episode Number */}
                      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-black text-xl font-bold">
                        {String(episode.episodeNumber).padStart(2, "0")}
                      </div>

                      {/* Episode Info */}
                      <div>
                        <h3 className="font-semibold text-lg">
                          EP {String(episode.episodeNumber).padStart(2, "0")}
                        </h3>

                        <p className="text-gray-400 text-sm">{episode.title}</p>
                      </div>
                    </div>
                  </Link>
                ))}

                <div className="flex justify-center gap-4 mt-8">
                  <button
                    disabled={episodePage === 1}
                    onClick={() => setEpisodePage((prev) => prev - 1)}
                    className="bg-orange-500 px-5 py-2 rounded-xl disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="flex items-center text-gray-400">
                    Page {episodePage}
                  </span>

                  <button
                    onClick={() => setEpisodePage((prev) => prev + 1)}
                    className="bg-orange-500 px-5 py-2 rounded-xl"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default DatabaseAnimeDetails;
