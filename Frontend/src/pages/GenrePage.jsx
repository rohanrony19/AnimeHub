import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import AnimeCard from "../components/JikanAnimeCard";
import Footer from "../components/Footer";
import { getJikanAnimeByGenre } from "../services/anime/jikanService";
import { getDatabaseAnimeByGenre } from "../services/anime/databaseAnimeService";
import DatabaseAnimeCard from "../components/DatabaseAnimeCard";

function GenrePage() {
  const { genreId, genreName } = useParams();

  const [animeList, setAnimeList] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isPurpleTheme] = useState(localStorage.getItem("theme") === "purple");

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAnime();
  }, [genreId, page]);

  const fetchAnime = async () => {
    try {
      const data = await getJikanAnimeByGenre(Number(genreId), page);

const uniqueAnime = data.filter(
  (anime, index, self) =>
    index === self.findIndex((a) => a.mal_id === anime.mal_id)
);

if (uniqueAnime.length > 0) {
  setAnimeList(uniqueAnime);

  // Jikan has many pages, so keep your current pagination
  setTotalPages(5);

  return;
}
    } catch (error) {
      console.log("Jikan failed. Loading database anime...");
    }

    try {
      const dbAnime = await getDatabaseAnimeByGenre(
  genreName.toUpperCase(),
  page - 1,
  20
);

setAnimeList(dbAnime.content);
setTotalPages(dbAnime.totalPages);
    } catch (error) {
      console.log(error);
      setAnimeList([]);
    }
  };
  return (
    <>
      <div
        className={`min-h-screen transition-colors duration-500 ${
          isPurpleTheme ? "bg-[#1B1230] text-white" : "bg-[#0B1120] text-white"
        }`}
      >
        <Navbar />

        <div className="max-w-[1700px] mx-auto px-5 lg:px-10 pt-32">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-2 h-14 rounded-full bg-violet-500"></div>

            <div>
              <h1 className="text-4xl font-black">
                {genreName}
                <span className="text-violet-500 text-3xl"> Anime</span>
              </h1>

              <p className="text-gray-400 mt-1">Popular anime in this genre</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {animeList.map((anime) =>
              anime.mal_id ? (
                <AnimeCard key={anime.mal_id} anime={anime} />
              ) : (
                <DatabaseAnimeCard key={anime.id} anime={anime} />
              ),
            )}
          </div>
        </div>
        <div className="flex justify-center items-center gap-3 mt-12 mb-8">
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
            disabled={page === totalPages}
onClick={() => setPage(page + 1)}
            className={`w-12 h-12 rounded-xl disabled:opacity-40 ${
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

export default GenrePage;
