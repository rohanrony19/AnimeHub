import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DatabaseAnimeCard from "../components/DatabaseAnimeCard";
import { getDatabaseAnimeByGenre } from "../services/anime/databaseAnimeService";

function PopularPage() {
  const [animeList, setAnimeList] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPurpleTheme] = useState(
  localStorage.getItem("theme") === "purple"
);

  useEffect(() => {
  window.scrollTo(0, 0);
  fetchPopularAnime();
}, [page]);

  const fetchPopularAnime = async () => {
    try {
      const data = await getDatabaseAnimeByGenre(
  "POPULAR",
  page - 1,
  20
);

setAnimeList(data.content);
setTotalPages(data.totalPages);
    } catch (error) {
      console.log(error);
      setAnimeList([]);
    }
  };

  return (
    <>
    <div
  className={`min-h-screen transition-colors duration-500 ${
    isPurpleTheme
      ? "bg-[#1B1230] text-white"
      : "bg-[#0B1120] text-white"
  }`}
>
      <Navbar />

      <div className="px-10 pt-32">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-2 h-14 rounded-full bg-violet-500"></div>

          <div>
            <h1 className="text-4xl font-black">
              Popular
              <span className="text-violet-500 text-3xl"> Anime</span>
            </h1>

            <p className="text-gray-400 mt-1">
              Browse all popular anime from AnimeHub
            </p>
          </div>
        </div>

        {animeList.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-xl">
            No popular anime available.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {animeList.map((anime) => (
              <DatabaseAnimeCard
                key={anime.id}
                anime={anime}
              />
            ))}
          </div>
        )}
      </div>
        <div className="flex justify-center items-center gap-3 mt-12">

  <button
    disabled={page === 1}
    onClick={() => setPage(page - 1)}
    className={`w-12 h-12 rounded-xl disabled:opacity-40 ${
      isPurpleTheme
        ? "bg-[#24163A] hover:bg-[#30204d]"
        : "bg-slate-800 hover:bg-slate-700"
    }`}
  >
    ←
  </button>

  {Array.from(
  { length: totalPages },
  (_, index) => (
    <button
      key={index}
      onClick={() => setPage(index + 1)}
      className={`w-12 h-12 rounded-xl ${
        page === index + 1
          ? "bg-violet-600"
          : isPurpleTheme
          ? "bg-[#24163A] hover:bg-[#30204d]"
          : "bg-slate-800 hover:bg-slate-700"
      }`}
    >
      {index + 1}
    </button>
  )
)}

  <button
    onClick={() => setPage(page + 1)}
disabled={page === totalPages}
    className={`w-12 h-12 rounded-xl ${
      isPurpleTheme
        ? "bg-[#24163A] hover:bg-[#30204d]"
        : "bg-slate-800 hover:bg-slate-700"
    }`}
  >
    →
  </button>

</div>
      <div className="mt-20">
          <Footer />
        </div>
      </div>
    </>
  );
}

export default PopularPage;