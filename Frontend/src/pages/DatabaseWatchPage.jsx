import { useEffect, useState, useRef } from "react";
import { FaPlay } from "react-icons/fa";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getDatabaseAnimeById } from "../services/anime/databaseAnimeService";
import {
  getEpisodeById,
  getEpisodesByAnime,
  getEpisodesBySeason,
  getWatchProgress,
  saveWatchProgress,
  watchEpisode,
} from "../services/anime/databaseEpisodeService";
import { ChevronDown } from "lucide-react";
import SkeletonWatch from "../components/loading/SkeletonWatch";
import { toast } from "react-toastify";

function DatabaseWatchPage() {
  const { animeId, episodeId } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [episode, setEpisode] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const videoRef = useRef(null);
  const episodeListRef = useRef(null);
  const lastSavedProgressRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);

useEffect(() => {
  window.scrollTo(0, 0);
}, [animeId, episodeId]);

  useEffect(() => {
  let cancelled = false;

  const fetchData = async () => {
    try {
      const animeData = await getDatabaseAnimeById(animeId);

      if (cancelled) return;
      setAnime(animeData);

      const episodesData = await getEpisodesByAnime(animeId);

      if (cancelled) return;
      setEpisodes(episodesData);

      const seasons = [
        ...new Set(episodesData.map((ep) => ep.seasonNumber)),
      ].sort((a, b) => a - b);

      setAvailableSeasons(seasons);

      if (seasons.length > 0) {
        setSelectedSeason(seasons[0]);
      }

      if (episodesData.length === 0) {
        setEpisode(null);
        setVideoUrl("");
        return;
      }

      const selectedId = Number(episodeId) || episodesData[0].id;

      // Remove the old video immediately
      setVideoUrl("");
      setEpisode(null);
      setIsPlaying(false);
      lastSavedProgressRef.current = 0;

      const [currentEpisode, url] = await Promise.all([
        getEpisodeById(selectedId),
        watchEpisode(selectedId),
      ]);

      if (cancelled) return;

      setEpisode(currentEpisode);
      setVideoUrl(url);

    } catch (error) {
      if (!cancelled) {
        toast.error("Failed to load episode.");
      }
    }
  };

  fetchData();

  return () => {
    cancelled = true;
  };
}, [animeId, episodeId]);

  useEffect(() => {
    const loadSeasonEpisodes = async () => {
      try {
        const data = await getEpisodesBySeason(animeId, selectedSeason);

        setEpisodes(data);
      } catch (error) {
        toast.error("Failed to load season episode.");
      }
    };

    if (selectedSeason) {
      loadSeasonEpisodes();
    }
  }, [animeId, selectedSeason]);

  useEffect(() => {
  const selectedEpisode = document.getElementById(
    `episode-${episodeId}`
  );
  const container = episodeListRef.current;

  if (!selectedEpisode || !container) return;

  requestAnimationFrame(() => {
    const containerTop = container.getBoundingClientRect().top;
    const episodeTop = selectedEpisode.getBoundingClientRect().top;

    container.scrollTo({
      top:
        container.scrollTop +
        episodeTop -
        containerTop -
        20,
      behavior: "auto",
    });
  });
}, [episodeId, episodes, episode]);

  const currentIndex = episodes.findIndex((ep) => ep.id === Number(episodeId));

  const previousEpisode = currentIndex > 0 ? episodes[currentIndex - 1] : null;

  const nextEpisode =
    currentIndex < episodes.length - 1 ? episodes[currentIndex + 1] : null;

  if (!anime || !episode) {
    return <SkeletonWatch />;
  }

  return (
    <>
      <div className="min-h-screen bg-[#0B1020]">
        <div className="max-w-[1800px] mx-auto px-8 pt-6 pb-8">
          <button
  onClick={() => navigate(-1)}
  className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium mb-6"
>
  ← Back
</button>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-7 items-start">
            {/* LEFT SIDE */}

            <div className="space-y-3">
              <div className="aspect-video rounded-[28px] overflow-hidden border border-slate-800 bg-black">
                {episodes.length > 0 && videoUrl ? (
                  <div className="relative w-full h-full">
                    <video
                      key={episodeId}
                      ref={videoRef}
                      controls
                      autoPlay
                      poster={episode?.thumbnailUrl}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full aspect-video object-contain bg-black max-h-[700px]"
                      onLoadedMetadata={async (e) => {
  try {
    const currentEpisodeId = Number(episodeId);

    const savedTime = await getWatchProgress(currentEpisodeId);

    if (
      Number(episodeId) === currentEpisodeId &&
      savedTime > 0 &&
      savedTime < e.target.duration - 5
    ) {
      e.target.currentTime = savedTime;
    }
  } catch (error) {
    // console.log(error);
  }
}}
onTimeUpdate={async (e) => {
  const current = Math.floor(e.target.currentTime);

  if (
    current >= 5 &&
    current - lastSavedProgressRef.current >= 5
  ) {
    lastSavedProgressRef.current = current;

    try {
      await saveWatchProgress(episodeId, current);
    } catch (error) {
      lastSavedProgressRef.current = 0;
    }
  }
}}
                    >
                      <source src={videoUrl} type="video/mp4" />
                    </video>
                    {!isPlaying && (
                      <div
                        onClick={() => videoRef.current?.play()}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20"
                      >
                        <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition">
                          <FaPlay className="text-black text-3xl ml-1" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center bg-black">
                    <h2 className="text-2xl text-gray-400">
                      No episodes uploaded yet
                    </h2>
                  </div>
                )}
              </div>

              <div className="px-1">
                <h1 className="text-4xl font-bold">{anime?.title}</h1>

                <div className="flex flex-wrap items-center gap-4 mt-5 text-gray-400">
                  <span className="flex items-center gap-1 text-yellow-400">
                    ⭐ {anime?.rating ?? "N/A"}
                  </span>

                  <span>•</span>
                  <span className="px-3 py-1 rounded-lg bg-slate-800 text-white">
                    TV
                  </span>
                  <span>•</span>

                  <span>{anime?.releaseYear ?? "-"}</span>

                  <span>•</span>

                  <span> {episodes.length} Episodes</span>
                </div>

                <div className="mt-6 text-violet-400 text-lg font-semibold">
                  {" • "}
                  Season {episode?.seasonNumber}
                  {" • "}
                  Episode {episode?.episodeNumber}
                </div>

                <h2 className="text-2xl font-bold mt-3">{episode?.title}</h2>

                <div className="flex justify-between mt-10">
                  {previousEpisode ? (
                    <Link
                      replace
  to={`/db/watch/${animeId}/${previousEpisode.id}`}
                      className="px-8 py-4 rounded-2xl border border-slate-700 hover:bg-slate-800 transition"
                    >
                      ← Previous Episode
                    </Link>
                  ) : (
                    <div />
                  )}

                  {nextEpisode && (
                    <Link
                      replace
  to={`/db/watch/${animeId}/${nextEpisode.id}`}
                      className="px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-700 transition"
                    >
                      Next Episode →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}

            <div className="sticky top-4 h-[calc(100vh-32px)] rounded-[28px] border border-slate-800 bg-[#121212] flex flex-col overflow-hidden">
              {/* Header */}

              <div className="px-6 py-6 border-b border-slate-800 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">Episodes</h2>

                  <span className="text-gray-400">
                    {episodes.length} Episodes
                  </span>
                </div>

                <div className="relative mt-5">
      <select
        value={selectedSeason}
        onChange={(e) => setSelectedSeason(Number(e.target.value))}
        className="w-full appearance-none bg-[#1F2638] border border-slate-700 rounded-xl px-4 py-3 pr-12"
      >
        {availableSeasons.map((season) => (
          <option
            key={season}
            value={season}
          >
            Season {season}
          </option>
        ))}
      </select>
      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2"
        aria-hidden="true"
      />
    </div>
              </div>

              {/* Scrollable Episodes */}

              <div
  ref={episodeListRef}
  className="flex-1 overflow-y-auto px-5 py-5"
>
                <div className="grid grid-cols-2 gap-3">
                  {episodes.map((ep) => (
                    <Link
  key={ep.id}
  id={`episode-${ep.id}`}
  replace
  to={`/db/watch/${animeId}/${ep.id}`}
>
                      <div
                        className={`rounded-2xl border p-3 h-[160px] overflow-hidden flex flex-col justify-between transition-all duration-300
            ${
              ep.id === Number(episodeId)
                ? "border-violet-500 bg-violet-600/10 shadow-lg shadow-violet-500/20"
                : "border-slate-700 bg-[#171717] hover:border-violet-500 hover:bg-[#1d1d1d]"
            }`}
                      >
                        {/* Top */}

                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-bold leading-none">
                              {String(ep.episodeNumber).padStart(2, "0")}
                            </h3>

                            {ep.id === Number(episodeId) && (
                              <span className="inline-block mt-3 bg-violet-600 text-white text-xs px-3 py-1 rounded-full">
                                Playing
                              </span>
                            )}
                          </div>

                          <button
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition
                ${
                  ep.id === Number(episodeId)
                    ? "bg-violet-600"
                    : "bg-slate-700 hover:bg-violet-600"
                }`}
                          >
                            ▶
                          </button>
                        </div>

                        {/* Bottom */}

                        <div>
                          <h4 className="font-semibold text-base leading-5 mt-2 line-clamp-2">
                            {ep.title}
                          </h4>

                          <p className="text-xs text-gray-400 mt-1">
                            {ep.duration} min
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DatabaseWatchPage;
