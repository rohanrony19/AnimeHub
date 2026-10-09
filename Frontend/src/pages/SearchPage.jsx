import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimeCard from "../components/JikanAnimeCard";
import DatabaseAnimeCard from "../components/DatabaseAnimeCard";

import { searchAnimeList } from "../services/anime/jikanService";
import { searchDatabaseAnime } from "../services/anime/searchService";

function SearchPage() {
  const { keyword } = useParams();

  const [animeList, setAnimeList] = useState([]);
const [databaseAnime, setDatabaseAnime] = useState([]);
const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnime();
  }, [keyword]);

  const fetchAnime = async () => {
  setLoading(true);

  try {
    const dbAnime = await searchDatabaseAnime(keyword);

    setDatabaseAnime(dbAnime);
    setLoading(false);

    const externalAnime = await searchAnimeList(keyword);

    const filteredExternal = externalAnime.filter(
      (anime) =>
        !dbAnime.some(
          (db) =>
            db.malId &&
            db.malId === anime.mal_id
        )
    );

    setAnimeList(filteredExternal);
  } catch (error) {
    console.error("Search failed:", error);
    setLoading(false);
  }
};

  return (
    <>
      <Navbar />

      <div className="px-10 pt-32">
        <h1 className="text-4xl font-bold mb-8">
          Search Results for "{keyword}"
        </h1>

        <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-8">
          <>
          {loading && (
  <div className="col-span-full text-center text-gray-400 py-10">
    Searching anime...
  </div>
)}
  {databaseAnime.map((anime) => (
    <DatabaseAnimeCard
      key={anime.id}
      anime={anime}
    />
  ))}

  {animeList.map((anime) => (
    <AnimeCard
      key={anime.mal_id}
      anime={anime}
    />
  ))}
</>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default SearchPage;