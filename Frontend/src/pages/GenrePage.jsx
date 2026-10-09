import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import JikanAnimeCard from "../components/JikanAnimeCard";
import DatabaseAnimeCard from "../components/DatabaseAnimeCard";
import SkeletonCard from "../components/loading/SkeletonCard";

import { getDatabaseAnimeByGenre } from "../services/anime/databaseAnimeService";
import {
  getJikanTopAnimePage,
} from "../services/anime/jikanService";
import { getPopularAnime } from "../services/anime/popularAnimeService";

const SKELETON_COUNT = 10;
const PAGE_SIZE = 25;

function GenrePage() {
  const { genreName } = useParams();

  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPurpleTheme] = useState(
    localStorage.getItem("theme") === "purple",
  );

  const isTopPage = genreName === "top-anime";
  const isPopularPage = genreName === "popular";


  useEffect(() => {
    setPage(1);
    setTotalPages(1);
    setHasNextPage(false);
  }, [genreName]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAnime();
  }, [genreName, page]);

  const fetchAnime = async () => {
    setLoading(true);
    setError("");

    try {
      // ---------------- TOP ----------------
if (isTopPage) {
  const result = await getJikanTopAnimePage(page);
  const data = result.data ?? [];

  if (data.length === 0 && page > 1) {
    setTotalPages(Math.max(1, page - 1));
    setHasNextPage(false);
    setPage((currentPage) => Math.max(1, currentPage - 1));
    return;
  }

  setAnimeList(
    data.map((anime) => ({
      type: "jikan",
      anime,
    })),
  );  

  const availablePages = Math.min(
  5,
  Number(result.pagination?.last_visible_page) || 1,
);

setTotalPages(availablePages);
setHasNextPage(page < availablePages);

  return;
}

      // ---------------- POPULAR ----------------
      if (isPopularPage) {
        const result = await getPopularAnime(
          page - 1,
          PAGE_SIZE,
        );

        const data = result.content ?? [];
        const availablePages =
          Number(result.totalPages) || 1;

        // Prevent navigating to a page beyond the actual DB pages.
        if (page > availablePages) {
          setTotalPages(availablePages);
          setHasNextPage(false);
          setPage(availablePages);
          return;
        }

        setAnimeList(
          data.map((anime) => ({
            type: "database",
            anime,
          })),
        );

        setTotalPages(availablePages);
        setHasNextPage(page < availablePages);

        return;
      }

      // ---------------- GENRE ----------------

const result = await getDatabaseAnimeByGenre(
  genreName.toUpperCase(),
  page - 1,
  PAGE_SIZE,
);

const data = result.content ?? [];
const availablePages = Number(result.totalPages) || 1;

if (page > availablePages) {
  setTotalPages(availablePages);
  setHasNextPage(false);
  setPage(availablePages);
  return;
}

setAnimeList(
  data.map((anime) => ({
    type: "database",
    anime,
  })),
);

setTotalPages(availablePages);
setHasNextPage(page < availablePages);
      
    } catch (error) {
      setAnimeList([]);
      setTotalPages(1);
      setHasNextPage(false);
      setError("Unable to load anime right now.");
    } finally {
      setLoading(false);
    }
  };

const getPageNumbers = () =>
  Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => index + 1,
  );

  const pageTitle = isTopPage
    ? "Top Anime"
    : isPopularPage
      ? "Popular Anime"
      : `${genreName.charAt(0).toUpperCase()}${genreName.slice(1)} Anime`;

  const pageSubtitle = isTopPage
    ? "Top anime from Jikan"
    : isPopularPage
      ? "Popular anime on AnimeHub"
      : "Popular anime in this genre";

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isPurpleTheme
          ? "bg-[#1B1230] text-white"
          : "bg-[#0B1120] text-white"
      }`}
    >
      <Navbar />

      <div className="max-w-[1700px] mx-auto px-5 lg:px-10 pt-32">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-2 h-14 rounded-full bg-violet-500"></div>

          <div>
            <h1 className="text-4xl font-black">
              {pageTitle}
            </h1>

            <p className="text-gray-400 mt-1">
              {pageSubtitle}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {Array.from({ length: SKELETON_COUNT }).map(
              (_, index) => (
                <SkeletonCard key={index} />
              ),
            )}
          </div>
        ) : error ? (
          <div className="text-center text-gray-400 py-20 text-xl">
            {error}
          </div>
        ) : animeList.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-xl">
            No anime available.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {animeList.map((item) =>
              item.type === "database" ? (
                <DatabaseAnimeCard
                  key={`db-${item.anime.id}`}
                  anime={item.anime}
                />
              ) : (
                <JikanAnimeCard
                  key={`jikan-${item.anime.mal_id}`}
                  anime={item.anime}
                />
              ),
            )}
          </div>
        )}

        {!loading && animeList.length > 0 && (
          <div className="flex justify-center items-center gap-3 mt-12 mb-8 flex-wrap">
            <button
              disabled={page === 1}
              onClick={() =>
                setPage((currentPage) => currentPage - 1)
              }
              className={`w-12 h-12 rounded-xl disabled:opacity-40 ${
                isPurpleTheme
                  ? "bg-[#24163A] hover:bg-[#30204d]"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              ←
            </button>

            {getPageNumbers().map((pageNumber) => (
  <button
    key={pageNumber}
    onClick={() => setPage(pageNumber)}
    className={`w-12 h-12 rounded-xl ${
      page === pageNumber
        ? "bg-violet-600"
        : isPurpleTheme
          ? "bg-[#24163A] hover:bg-[#30204d]"
          : "bg-slate-800 hover:bg-slate-700"
    }`}
  >
    {pageNumber}
  </button>
))}

            <button
              disabled={!hasNextPage}
              onClick={() =>
                setPage((currentPage) => currentPage + 1)
              }
              className={`w-12 h-12 rounded-xl disabled:opacity-40 ${
                isPurpleTheme
                  ? "bg-[#24163A] hover:bg-[#30204d]"
                  : "bg-slate-800 hover:bg-slate-700"
              }`}
            >
              →
            </button>
          </div>
        )}
      </div>

      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}

export default GenrePage;
