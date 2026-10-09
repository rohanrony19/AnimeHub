import { useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnimeCard from "../components/JikanAnimeCard";
import HeroBanner from "../components/HeroBanner";
import Footer from "../components/Footer";
import HeroAnimeCard from "../components/DatabaseAnimeCard";
import { getTopAnime } from "../services/anime/jikanService";
import { getPopularAnime } from "../services/anime/popularAnimeService";
import { getDatabaseAnimeByGenre } from "../services/anime/databaseAnimeService";
import SkeletonCard from "../components/loading/SkeletonCard";
import { getContinueWatching } from "../services/user/continueWatchingService";

function Home() {
  // const [selectedGenre, setSelectedGenre] = useState("");
  const [topAnime, setTopAnime] = useState([]);

  const [actionDb, setActionDb] = useState([]);
  const [romanceDb, setRomanceDb] = useState([]);
  const [comedyDb, setComedyDb] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);
  const [continueLoading, setContinueLoading] = useState(true);

  const [popularLoading, setPopularLoading] = useState(true);
  const [topLoading, setTopLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(true);
  const [romanceLoading, setRomanceLoading] = useState(true);
  const [comedyLoading, setComedyLoading] = useState(true);
  const [isPurpleTheme] = useState(localStorage.getItem("theme") === "purple");

  const loadHome = async () => {
    await Promise.all([
      loadTopAnime(),
      loadPopularAnime(),
      loadContinueWatching(),
      loadDatabaseGenre("ACTION", setActionDb, setActionLoading),
      loadDatabaseGenre("ROMANCE", setRomanceDb, setRomanceLoading),
      loadDatabaseGenre("COMEDY", setComedyDb, setComedyLoading),
    ]);
  };

  useEffect(() => {
    loadHome();
  }, []);

  useLayoutEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    const shouldRestore =
      performance.getEntriesByType("navigation")[0]?.type === "reload" ||
      sessionStorage.getItem("restoreHomeScroll") === "true";
    const savedPosition = Number(
      sessionStorage.getItem("homeScrollPosition") || 0,
    );

    window.history.scrollRestoration = "manual";
    window.scrollTo(
      0,
      shouldRestore && Number.isFinite(savedPosition) ? savedPosition : 0,
    );

    sessionStorage.removeItem("restoreHomeScroll");
    sessionStorage.removeItem("homeScrollPosition");

    const saveScrollPosition = () => {
      sessionStorage.setItem(
        "homeScrollPosition",
        String(Math.round(window.scrollY)),
      );
    };

    window.addEventListener("scroll", saveScrollPosition, { passive: true });

    return () => {
      window.removeEventListener("scroll", saveScrollPosition);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  const loadTopAnime = async () => {
    setTopLoading(true);
    try {
      const data = await getTopAnime();
      setTopAnime(data);
      return data;
    } catch (error) {
      return [];
    } finally {
      setTopLoading(false);
    }
  };

  const loadPopularAnime = async () => {
    setPopularLoading(true);
    try {
      const data = await getPopularAnime(0, 15);

      setPopularAnime(data.content);

      return data.content;
    } catch (error) {
      setPopularAnime([]);
      return [];
    } finally {
      setPopularLoading(false);
    }
  };

  const loadContinueWatching = async () => {
    setContinueLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setContinueWatching([]);
        return [];
      }

      const data = await getContinueWatching();

      setContinueWatching(data);

      return data;
    } catch (error) {
      setContinueWatching([]);
      return [];
    } finally {
      setContinueLoading(false);
    }
  };

  const loadDatabaseGenre = async (genre, setter, setLoading) => {
    setLoading(true);

    try {
      const data = await getDatabaseAnimeByGenre(genre, 0, 15);

      setter(data.content);
      return data.content;
    } catch (error) {
      setter([]);
      return [];
    } finally {
      setLoading(false);
    }
  };
  const LoadingRow = () => (
    <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="w-[220px] flex-shrink-0">
          <SkeletonCard />
        </div>
      ))}
    </div>
  );

  const ContinueLoadingRow = () => (
    <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
      {[...Array(3)].map((_, index) => (
        <div
          key={index}
          className="w-[360px] flex-shrink-0 rounded-2xl overflow-hidden bg-slate-900 animate-pulse"
        >
          <div className="w-full aspect-video bg-slate-800"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isPurpleTheme ? "bg-[#1B1230] text-white" : "bg-[#0B1120] text-white"
      }`}
    >
      <Navbar />
      <HeroBanner />

      {/* Continue Watching */}
      {localStorage.getItem("token") && (
        <div className="max-w-[1700px] mx-auto px-5 lg:px-10 mt-12">
          <div
            className={`rounded-3xl border p-8 transition-all duration-300 hover:shadow-[0_0_35px_rgba(139,92,246,0.15)] ${
              isPurpleTheme
                ? "bg-[#24163A] border-violet-700"
                : "bg-[#151C2F] border-slate-800"
            }`}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1.5 h-10 rounded-full bg-violet-500"></div>

              <div>
                <h2 className="text-3xl font-bold">Continue Watching</h2>

                <p className="text-gray-400 text-sm">
                  Pick up where you left off
                </p>
              </div>
            </div>

            <div className="min-h-[219px]">
              {continueLoading ? (
                <ContinueLoadingRow />
              ) : (
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                  {continueWatching.map((item) => {
                    const progress =
                      item.duration > 0
                        ? Math.min(
                            (item.watchedTimeInSeconds / item.duration) * 100,
                            100,
                          )
                        : 0;

                    const remainingMinutes = Math.max(
                      0,
                      Math.ceil(
                        (item.duration - item.watchedTimeInSeconds) / 60,
                      ),
                    );

                    return (
                      <Link
                        key={item.animeId}
                        to={`/db/watch/${item.animeId}/${item.episodeId}`}
                        onClick={() => {
                          sessionStorage.setItem(
                            "homeScrollPosition",
                            String(window.scrollY),
                          );

                          sessionStorage.setItem("restoreHomeScroll", "true");
                        }}
                        className="w-[320px] flex-shrink-0 group"
                      >
                        <div className="overflow-hidden rounded-xl">
                          <div className="overflow-hidden rounded-xl bg-slate-900">
                            <div className="relative">
                              <img
                                src={item.thumbnailUrl || item.posterUrl}
                                alt={item.animeTitle}
                                className="w-full aspect-video object-cover"
                              />
                            </div>

                            <div className="h-1.5 bg-gray-700">
                              <div
                                className="h-full bg-violet-500"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="pt-3">
                            <h3 className="font-semibold text-base text-white truncate">
                              {item.animeTitle}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-gray-400 leading-6">
                              <span>
                                S{item.seasonNumber}:E{item.episodeNumber}
                              </span>

                              <span>•</span>

                              <span>{remainingMinutes}m left</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Popular Anime */}
      <div className="max-w-[1700px] mx-auto px-5 lg:px-10 mt-12">
        <div
          className={`rounded-3xl border p-8 transition-all duration-300 hover:shadow-[0_0_35px_rgba(139,92,246,0.15)] ${
            isPurpleTheme
              ? "bg-[#24163A] border-violet-700"
              : "bg-[#151C2F] border-slate-800"
          }`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 rounded-full bg-violet-500"></div>

              <div>
                <h2 className="text-3xl font-bold">Popular Anime</h2>

                <p className="text-gray-400 text-sm">
                  Most watched anime on AnimeHub
                </p>
              </div>
            </div>

            <Link
              to="/genre/popular"
              onClick={() => {
                sessionStorage.setItem(
                  "homeScrollPosition",
                  String(window.scrollY),
                );
                sessionStorage.setItem("restoreHomeScroll", "true");
              }}
              className="text-violet-400 hover:text-violet-300 font-semibold transition"
            >
              See More →
            </Link>
          </div>

          <div className="min-h-[390px]">
            {popularLoading ? (
              <LoadingRow />
            ) : (
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                {popularAnime.map((anime) => (
                  <HeroAnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Anime */}
      <div className="max-w-[1700px] mx-auto px-5 lg:px-10 mt-12">
        <div
          className={`rounded-3xl border p-8 transition-all duration-300
        ${
          isPurpleTheme
            ? "bg-[#24163A] border-violet-700"
            : "bg-[#151C2F] border-slate-800"
        }`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 rounded-full bg-violet-500"></div>

              <div>
                <h2 className="text-3xl font-bold">Top Anime</h2>

                <p className="text-gray-400 text-sm">Top anime from Jikan</p>
              </div>
            </div>

            <Link
              to="/genre/top-anime"
              onClick={() => {
                sessionStorage.setItem(
                  "homeScrollPosition",
                  String(window.scrollY),
                );
                sessionStorage.setItem("restoreHomeScroll", "true");
              }}
              className="text-violet-400 hover:text-violet-300 font-semibold transition"
            >
              See More →
            </Link>
          </div>

          <div className="min-h-[390px]">
            {topLoading ? (
              <LoadingRow />
            ) : (
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                {topAnime.map((anime) => (
                  <AnimeCard key={anime.mal_id} anime={anime} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Action Anime */}
      <div className="max-w-[1700px] mx-auto px-5 lg:px-10 mt-12">
        <div
          className={`rounded-3xl border p-8 transition-all duration-300
        ${
          isPurpleTheme
            ? "bg-[#24163A] border-violet-700"
            : "bg-[#151C2F] border-slate-800"
        }`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 rounded-full bg-violet-500"></div>

              <div>
                <h2 className="text-3xl font-bold">Action Anime</h2>

                <p className="text-gray-400 text-sm">
                  Most watched anime on AnimeHub
                </p>
              </div>
            </div>

            <Link
              to="/genre/action"
              onClick={() => {
                sessionStorage.setItem(
                  "homeScrollPosition",
                  String(window.scrollY),
                );
                sessionStorage.setItem("restoreHomeScroll", "true");
              }}
              className="text-violet-400 hover:text-violet-300 font-semibold transition"
            >
              See More →
            </Link>
          </div>

          <div className="min-h-[390px]">
            {actionLoading ? (
              <LoadingRow />
            ) : (
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                {actionDb.map((anime) => (
                  <HeroAnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Romance Anime */}
      <div className="max-w-[1700px] mx-auto px-5 lg:px-10 mt-12">
        <div
          className={`rounded-3xl border p-8 transition-all duration-300
        ${
          isPurpleTheme
            ? "bg-[#24163A] border-violet-700"
            : "bg-[#151C2F] border-slate-800"
        }`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 rounded-full bg-violet-500"></div>

              <div>
                <h2 className="text-3xl font-bold">Romance Anime</h2>

                <p className="text-gray-400 text-sm">
                  Most watched anime on AnimeHub
                </p>
              </div>
            </div>

            <Link
              to="/genre/romance"
              onClick={() => {
                sessionStorage.setItem(
                  "homeScrollPosition",
                  String(window.scrollY),
                );
                sessionStorage.setItem("restoreHomeScroll", "true");
              }}
              className="text-violet-400 hover:text-violet-300 font-semibold transition"
            >
              See More →
            </Link>
          </div>

          <div className="min-h-[390px]">
            {romanceLoading ? (
              <LoadingRow />
            ) : (
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                {romanceDb.map((anime) => (
                  <HeroAnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comedy Anime */}
      <div className="max-w-[1700px] mx-auto px-5 lg:px-10 mt-12">
        <div
          className={`rounded-3xl border p-8 transition-all duration-300
        ${
          isPurpleTheme
            ? "bg-[#24163A] border-violet-700"
            : "bg-[#151C2F] border-slate-800"
        }`}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 rounded-full bg-violet-500"></div>

              <div>
                <h2 className="text-3xl font-bold">Comedy Anime</h2>

                <p className="text-gray-400 text-sm">
                  Most watched anime on AnimeHub
                </p>
              </div>
            </div>

            <Link
              to="/genre/comedy"
              onClick={() => {
                sessionStorage.setItem(
                  "homeScrollPosition",
                  String(window.scrollY),
                );
                sessionStorage.setItem("restoreHomeScroll", "true");
              }}
              className="text-violet-400 hover:text-violet-300 font-semibold transition"
            >
              See More →
            </Link>
          </div>

          <div className="min-h-[390px]">
            {comedyLoading ? (
              <LoadingRow />
            ) : (
              <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
                {comedyDb.map((anime) => (
                  <HeroAnimeCard key={anime.id} anime={anime} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}

export default Home;
