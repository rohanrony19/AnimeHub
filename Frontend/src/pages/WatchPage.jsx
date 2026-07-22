import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaPlay } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { getAnimeById, getAnimeEpisodes } from "../services/anime/jikanService";
import { Link, useNavigate } from "react-router-dom";
import SkeletonWatch from "../components/loading/SkeletonWatch";

function WatchPage() {
  const { animeId, episodeId } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [anime, setAnime] = useState(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const animeData = await getAnimeById(animeId);
        setAnime(animeData);
        console.log("Trailer:", animeData.trailer);

        const episodeData = await getAnimeEpisodes(animeId);
        console.log("Episode API Response:", episodeData);
        setEpisodes(episodeData);

        const currentEpisode = episodeData.find(
          (ep) => ep.mal_id === Number(episodeId),
        );

        setEpisode(currentEpisode);

        localStorage.setItem(
          "continueWatching",
          JSON.stringify({
            animeId,
            episodeId,
            title: currentEpisode.title,
          }),
        );
      } catch (error) {
        console.log(error);
      }
    };

    fetchEpisode();
  }, [animeId, episodeId]);

  if (!anime || !episode) {
  return <SkeletonWatch />;
}

  return (
    <>
      {/* <Navbar /> */}

      <div className="min-h-screen bg-[#0B1020]">
        <div className="max-w-[1800px] mx-auto px-8 pt-6 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium mb-6"
          >
            ← Back
          </button>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-7 items-start">
            {/* LEFT */}

            <div className="space-y-3">
              <div className="aspect-video rounded-[28px] overflow-hidden border border-slate-800 bg-black">
                {anime?.trailer?.embed_url ? (
                  <div className="relative w-full h-full">
                    <iframe
                      ref={videoRef}
                      src={anime.trailer.embed_url}
                      title={anime.title}
                      className={`w-full aspect-video object-contain bg-black max-h-[700px] ${
                        isPlaying
                          ? "pointer-events-auto"
                          : "pointer-events-none"
                      }`}
                      allowFullScreen
                    />

                    {!isPlaying && (
                      <div
                        onClick={() => setIsPlaying(true)}
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
                    <h1 className="text-2xl text-gray-400">
                      Trailer Not Available
                    </h1>
                  </div>
                )}
              </div>

              <div className="px-1">
                <h1 className="text-4xl font-bold">{anime?.title}</h1>

                <div className="flex flex-wrap items-center gap-4 mt-5 text-gray-400">
                  <span className="flex items-center gap-1 text-yellow-400">
                    ⭐ {anime?.score ?? "N/A"}
                  </span>

                  <span>•</span>

                  <span className="px-3 py-1 rounded-lg bg-slate-800 text-white">
                    {anime?.type}
                  </span>

                  <span>•</span>

                  <span>{anime?.year ?? "-"}</span>

                  <span>•</span>

                  <span>{anime?.episodes ?? "-"} Episodes</span>
                </div>

                <div className="mt-6 text-violet-400 text-lg font-semibold">
                  • Episode {episode?.mal_id}
                </div>

                <h2 className="text-2xl font-bold mt-3">{episode?.title}</h2>

                <div className="flex justify-between mt-10">
                  {Number(episodeId) > 1 ? (
                    <Link
                      to={`/watch/${animeId}/${Number(episodeId) - 1}`}
                      className="px-8 py-4 rounded-2xl border border-slate-700 hover:bg-slate-800 transition"
                    >
                      ← Previous Episode
                    </Link>
                  ) : (
                    <div />
                  )}

                  {Number(episodeId) < episodes.length && (
                    <Link
                      to={`/watch/${animeId}/${Number(episodeId) + 1}`}
                      className="px-8 py-4 rounded-2xl bg-violet-600 hover:bg-violet-700 transition"
                    >
                      Next Episode →
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT */}

            <div className="sticky top-4 h-[calc(100vh-32px)] rounded-[28px] border border-slate-800 bg-[#121212] flex flex-col overflow-hidden">
              {/* Header */}

              <div className="px-6 py-6 border-b border-slate-800 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">Episodes</h2>

                  <span className="text-gray-400">
                    {episodes.length} Episodes
                  </span>
                </div>
              </div>

              {/* Episode Grid */}

              <div className="flex-1 overflow-y-auto px-5 py-5">
                <div className="grid grid-cols-2 gap-3">
                  {episodes.map((ep) => (
                    <Link key={ep.mal_id} to={`/watch/${animeId}/${ep.mal_id}`}>
                      <div
                        className={`rounded-2xl border p-3 h-[125px] flex flex-col justify-between transition-all duration-300
                      ${
                        Number(episodeId) === ep.mal_id
                          ? "border-violet-500 bg-violet-600/10 shadow-lg shadow-violet-500/20"
                          : "border-slate-700 bg-[#171717] hover:border-violet-500 hover:bg-[#1d1d1d]"
                      }`}
                      >
                        {/* Top */}

                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-bold leading-none">
                              {String(ep.mal_id).padStart(2, "0")}
                            </h3>

                            {Number(episodeId) === ep.mal_id && (
                              <span className="inline-block mt-2 bg-violet-600 text-white text-xs px-3 py-1 rounded-full">
                                Playing
                              </span>
                            )}
                          </div>

                          <button
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition
                          ${
                            Number(episodeId) === ep.mal_id
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
                            Episode {ep.mal_id}
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

export default WatchPage;
