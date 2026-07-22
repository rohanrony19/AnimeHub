import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import AnimeCard from "../components/JikanAnimeCard";
import HeroBanner from "../components/HeroBanner";
import Footer from "../components/Footer";
import HeroAnimeCard from "../components/DatabaseAnimeCard";
import { getTopAnime } from "../services/anime/jikanService";
import { getPopularAnime } from "../services/anime/popularAnimeService";
import { getDatabaseAnimeByGenre } from "../services/anime/databaseAnimeService";
import SkeletonCard from "../components/loading/SkeletonCard";

function Home() {
  // const [selectedGenre, setSelectedGenre] = useState("");
  const [topAnime, setTopAnime] = useState([]);
  const [actionDb, setActionDb] = useState([]);
  const [romanceDb, setRomanceDb] = useState([]);
  const [comedyDb, setComedyDb] = useState([]);
  const [popularAnime, setPopularAnime] = useState([]);
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
      loadDatabaseGenre("ACTION", setActionDb, setActionLoading),
      loadDatabaseGenre("ROMANCE", setRomanceDb, setRomanceLoading),
      loadDatabaseGenre("COMEDY", setComedyDb, setComedyLoading),
    ]);
  };

  useEffect(() => {
    loadHome();
  }, []);

  const loadTopAnime = async () => {
    setTopLoading(true);
    try {
      const data = await getTopAnime();
      setTopAnime(data);
      return data;
    } catch (error) {
      console.log(error);
      return [];
    } finally {
      setTopLoading(false);
    }
  };

  const loadPopularAnime = async () => {
    setPopularLoading(true);
    try {
      const data = await getPopularAnime(0, 20);

      setPopularAnime(data.content);

      return data.content;
    } catch (error) {
      console.log(error);

      setPopularAnime([]);
      return [];
    } finally {
      setPopularLoading(false);
    }
  };

const loadDatabaseGenre = async (genre, setter, setLoading) => {
  setLoading(true);

  try {
    const data = await getDatabaseAnimeByGenre(genre, 0, 20);

    setter(data.content);
    return data.content;
  } catch (error) {
    console.log(error);
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

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isPurpleTheme ? "bg-[#1B1230] text-white" : "bg-[#0B1120] text-white"
      }`}
    >
      <Navbar />
      <HeroBanner />

      {/* Popular Anime */}
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
              <h2 className="text-3xl font-bold">Popular Anime</h2>

              <p className="text-gray-400 text-sm">
                Most watched anime on AnimeHub
              </p>
            </div>
          </div>

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
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 rounded-full bg-violet-500"></div>

            <div>
              <h2 className="text-3xl font-bold">Top Anime</h2>

              <p className="text-gray-400 text-sm">
                Most watched anime on AnimeHub
              </p>
            </div>
          </div>

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
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 rounded-full bg-violet-500"></div>

            <div>
              <h2 className="text-3xl font-bold">Action Anime</h2>

              <p className="text-gray-400 text-sm">
                Most watched anime on AnimeHub
              </p>
            </div>
          </div>

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
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 rounded-full bg-violet-500"></div>

            <div>
              <h2 className="text-3xl font-bold">Romance Anime</h2>

              <p className="text-gray-400 text-sm">
                Most watched anime on AnimeHub
              </p>
            </div>
          </div>

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
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1.5 h-10 rounded-full bg-violet-500"></div>

            <div>
              <h2 className="text-3xl font-bold">Comedy Anime</h2>

              <p className="text-gray-400 text-sm">
                Most watched anime on AnimeHub
              </p>
            </div>
          </div>

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
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}

export default Home;
