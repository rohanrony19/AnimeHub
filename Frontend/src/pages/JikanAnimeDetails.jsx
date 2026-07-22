import { FaPlay } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import {
  getAnimeById,
  getAnimeEpisodes,
  getAnimeRecommendations,
  getAnimeCharacters,
  getAnimeRelations,
  getAnimeReviews,
} from "../services/anime/jikanService";
import {
  getEpisodesByAnime,
} from "../services/anime/databaseEpisodeService";
import {
  addReview,
  getReviews,
  getAverageRating,
} from "../services/user/reviewService";
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
  getDatabaseAnimeByMalId,
  findOrCreateAnime,
} from "../services/anime/databaseAnimeService";

function JikanAnimeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [anime, setAnime] = useState(null);
  const [databaseAnime, setDatabaseAnime] = useState(null);
const videoRef = useRef(null);
  const [episodes, setEpisodes] = useState([]);
  const [isDatabaseEpisodes, setIsDatabaseEpisodes] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [episodePage, setEpisodePage] = useState(1);
  const [activeTab, setActiveTab] = useState("overview");
  const [recommendations, setRecommendations] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [relations, setRelations] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [jikanReviews, setJikanReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlist, setIsWatchlist] = useState(false);

  useEffect(() => {
    const fetchAnime = async () => {
      let animeData;

try {
    const dbAnime = await getDatabaseAnimeByMalId(Number(id));
    setDatabaseAnime(dbAnime);
} catch (error) {
    console.log("Anime not found in DB");
}

try {
    animeData = await getAnimeById(id);
    setAnime(animeData);
} catch (error) {
    console.error("Anime Error:", error);
    return;
}

      try {
        const recommendationData = await getAnimeRecommendations(id);
        setRecommendations(recommendationData);
      } catch (error) {
        console.log("Recommendations skipped");
      }

      try {
        const characterData = await getAnimeCharacters(id);
        setCharacters(characterData);
      } catch (error) {
        console.log("Characters skipped");
      }

      try {
  const jikanReviewData = await getAnimeReviews(id);
  setJikanReviews(jikanReviewData);
} catch (error) {
  console.log("Jikan Reviews skipped");
}

try {
  const dbAnime = await findOrCreateAnime({
    malId: animeData.mal_id,
    title: animeData.title,
    description: animeData.synopsis,
    genre: animeData.genres?.map((g) => g.name).join(", "),
    releaseYear: animeData.year || 0,
    rating: animeData.score || 0,
    posterUrl: animeData.images?.jpg?.large_image_url,
    status: animeData.status,
    popular: false,
    heroOrder: null,
    bannerUrl: null,
  });

  const reviewData = await getReviews(dbAnime.id);
  setUserReviews(reviewData);

  const avg = await getAverageRating(dbAnime.id);
  setAverageRating(avg);

  const favorites = await getFavorites();

  setIsFavorite(
    favorites.some((fav) => fav.malId === animeData.mal_id)
  );

  const watchlist = await getWatchlist();

  setIsWatchlist(
    watchlist.some((item) => item.malId === animeData.mal_id)
  );
} catch (error) {
  console.log("Database skipped");
}

      try {
        const relationData = await getAnimeRelations(id);
        setRelations(relationData);
      } catch (error) {
        console.log("Relations skipped");
      }
    };

    fetchAnime();
  }, [id]);

  useEffect(() => {
  const fetchEpisodes = async () => {
    try {
      const dbAnime = await getDatabaseAnimeByMalId(Number(id));

      const dbEpisodes = await getEpisodesByAnime(dbAnime.id);

      if (dbEpisodes.length > 0) {
        setEpisodes(dbEpisodes);
        setIsDatabaseEpisodes(true);
        return;
      }
    } catch (error) {
     console.log("Anime not in DB:", error.response?.status);
    }

    try {
      const jikanEpisodes = await getAnimeEpisodes(id, episodePage);

      setEpisodes(jikanEpisodes);
      setIsDatabaseEpisodes(false);
    } catch (error) {
      console.log(error);
    }
  };

  fetchEpisodes();
}, [id, episodePage]);

  const handleReview = async () => {
    try {
      const dbAnime = await findOrCreateAnime({
        malId: anime.mal_id,
        title: anime.title,
        description: anime.synopsis,
        genre: anime.genres?.map((g) => g.name).join(", "),
        releaseYear: anime.year || 0,
        rating: anime.score || 0,
        posterUrl: anime.images?.jpg?.large_image_url,
        status: anime.status,
        popular: false,
        heroOrder: null,
        bannerUrl: null,
      });

      await addReview(dbAnime.id, {
        rating,
        comment,
      });

      const reviewData = await getReviews(dbAnime.id);
      setUserReviews(reviewData);

      const avg = await getAverageRating(dbAnime.id);
      setAverageRating(avg);

      setRating(5);
      setComment("");

      toast.success("Review submitted successfully ⭐");
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to submit review.");
    }
  };

  if (!anime) {
    return (
      <>
        <Navbar />

        <div className="p-8 pt-20">
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
      await removeFavorite(anime.mal_id);

      setIsFavorite(false);
      toast.success("Removed from Favorites ❤️");
      return;
    }

    await addFavorite({
      malId: anime.mal_id,
      title: anime.title,
      description: anime.synopsis,
      genre: anime.genres?.map((g) => g.name).join(", "),
      releaseYear: anime.year || 0,
      rating: anime.score || 0,
      posterUrl: anime.images?.jpg?.large_image_url,
      status: anime.status,
      popular: false,
      heroOrder: null,
      bannerUrl: null,
    });

    setIsFavorite(true);
    toast.success("Added to Favorites ❤️");
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Something went wrong."
    );
  }
};

 const handleWatchlist = async () => {
  try {
    if (isWatchlist) {
      await removeWatchlist(anime.mal_id);

      setIsWatchlist(false);
      toast.success("Removed from Watchlist 📌");
      return;
    }

    await addWatchlist({
      malId: anime.mal_id,
      title: anime.title,
      description: anime.synopsis,
      genre: anime.genres?.map((g) => g.name).join(", "),
      releaseYear: anime.year || 0,
      rating: anime.score || 0,
      posterUrl: anime.images?.jpg?.large_image_url,
      status: anime.status,
      popular: false,
      heroOrder: null,
      bannerUrl: null,
    });

    setIsWatchlist(true);
    toast.success("Added to Watchlist 📌");
  } catch (error) {
    toast.error(
      error.response?.data?.message || "Something went wrong."
    );
  }
};

const handleWatchEpisode = async (episodeNumber) => {
  try {
    const dbAnime = await getDatabaseAnimeByMalId(anime.mal_id);

    const dbEpisodes = await getEpisodesByAnime(dbAnime.id);

    // No uploaded episodes -> use Jikan
    if (dbEpisodes.length === 0) {
      navigate(`/watch/${anime.mal_id}/${episodeNumber}`);
      return;
    }

    // Find the same episode number in DB
    const matchedEpisode = dbEpisodes.find(
      (ep) => ep.episodeNumber === episodeNumber
    );

    // Same episode found -> DB Watch Page
    if (matchedEpisode) {
      navigate(`/db/watch/${dbAnime.id}/${matchedEpisode.id}`);
      return;
    }

    // Episode not uploaded yet -> Jikan
    navigate(`/watch/${anime.mal_id}/${episodeNumber}`);
  } catch (error) {
    // Anime not in DB -> Jikan
    navigate(`/watch/${anime.mal_id}/${episodeNumber}`);
  }
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
              src={anime.images?.jpg?.large_image_url}
              alt={anime.title}
              className="w-60 rounded-3xl shadow-2xl"
            />

            <h1 className="text-3xl font-bold mt-6 text-center">
              {anime.title}
            </h1>

            <p className="text-gray-400 mt-4">{anime.synopsis}</p>

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
                {databaseAnime?.trailerUrl ? (
  <div className="relative">
    <video
      ref={videoRef}
      controls
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      className="w-[90%] mx-auto h-[550px] rounded-3xl bg-black object-cover"
    >
      <source src={databaseAnime.trailerUrl} type="video/mp4" />
    </video>

    {!isPlaying && (
      <div
        onClick={() => videoRef.current?.play()}
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
      >
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
          <FaPlay className="text-black text-3xl ml-1" />
        </div>
      </div>
    )}
  </div>
) : (
  <iframe
    src={anime.trailer?.embed_url}
    className="w-[90%] mx-auto h-[550px] rounded-3xl bg-black object-cover"
    allowFullScreen
  />
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
                <h2 className="text-2xl font-bold mb-4">Synopsis</h2>

                <p className="text-gray-300 leading-8">{anime.synopsis}</p>
              </div>
            )}
            {/* Episodes */}

            {activeTab === "characters" && (
              <div className="mt-8 bg-slate-900 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">Characters</h2>

                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {characters.slice(0, 12).map((item) => (
                    <div
                      key={item.character.mal_id}
                      className="bg-[#1b1b1b] rounded-2xl overflow-hidden"
                    >
                      <img
                        src={item.character.images.jpg.image_url}
                        alt={item.character.name}
                        className="w-full h-72 object-cover"
                      />

                      <div className="p-4">
                        <h3 className="font-semibold">{item.character.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="space-y-5">
                  {userReviews.length === 0 && jikanReviews.length === 0 ? (
                    <div className="bg-[#1b1b1b] rounded-2xl p-8 text-center">
                      <h3 className="text-xl font-semibold text-gray-300">
                        No Reviews Yet
                      </h3>

                      <p className="text-gray-500 mt-2">
                        Be the first to share your thoughts about this anime.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* AnimeHub Reviews */}
                      {userReviews.map((review) => (
                        <div
                          key={`${review.username}-${review.createdAt}`}
                          className="bg-[#1b1b1b] p-6 rounded-2xl"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold">{review.username}</h3>

                            <span className="text-yellow-400">
                              ⭐ {review.rating}/5
                            </span>
                          </div>

                          <p className="text-gray-300 mt-4">{review.comment}</p>
                        </div>
                      ))}

                      {/* Jikan Reviews */}
                      {jikanReviews.slice(0, 3).map((review) => (
                        <div
                          key={review.mal_id}
                          className="bg-[#1b1b1b] p-6 rounded-2xl"
                        >
                          <h3 className="font-bold">{review.user.username}</h3>

                          <p className="text-gray-400 mt-4">
                            {review.review.slice(0, 300)}...
                          </p>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "similar" && (
              <div className="mt-8 bg-slate-900 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6">Similar Anime</h2>

                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recommendations.slice(0, 8).map((item) => (
                    <Link
                      key={item.entry.mal_id}
                      to={`/jikan/${item.entry.mal_id}`}
                    >
                      <div className="bg-[#1b1b1b] rounded-2xl overflow-hidden hover:scale-105 transition">
                        <img
                          src={item.entry.images.jpg.large_image_url}
                          alt={item.entry.title}
                          className="w-full h-72 object-cover"
                        />

                        <div className="p-4">
                          <h3 className="font-semibold">{item.entry.title}</h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
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
                    {anime?.episodes} Episodes
                  </span>
                </div>
                        {episodes.map((episode) => (
                          <div
          key={isDatabaseEpisodes ? episode.id : episode.mal_id}
          onClick={() =>
  handleWatchEpisode(
    isDatabaseEpisodes
      ? episode.episodeNumber
      : episode.mal_id
  )
}
          className="cursor-pointer"
        >
                    <div className="flex items-center gap-5 p-4 rounded-2xl cursor-pointer transition border border-transparent bg-[#1b1b1b] hover:bg-[#2a2a2a]">
                      {/* Episode Number */}
                      <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-black text-xl font-bold">
                        {String(
  isDatabaseEpisodes
    ? episode.episodeNumber
    : episode.mal_id
).padStart(2, "0")}
                      </div>

                      {/* Episode Info */}
                      <div>
                        <h3 className="font-semibold text-lg">
                          EP {String(
  isDatabaseEpisodes
    ? episode.episodeNumber
    : episode.mal_id
).padStart(2, "0")}
                        </h3>

                        <p className="text-gray-400 text-sm">{episode.title}</p>
                      </div>
                    </div>
                  </div>
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

export default JikanAnimeDetails;
