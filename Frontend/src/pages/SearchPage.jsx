import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AnimeCard from "../components/JikanAnimeCard";
import DatabaseAnimeCard from "../components/DatabaseAnimeCard";

import { searchAnime } from "../services/anime/jikanService";
import { searchDatabaseAnime } from "../services/anime/searchService";

function SearchPage() {
  const { keyword } = useParams();

  const [animeList, setAnimeList] = useState([]);
const [databaseAnime, setDatabaseAnime] = useState([]);

  useEffect(() => {
    fetchAnime();
  }, [keyword]);

  const fetchAnime = async () => {
  try {
    const [dbAnime, jikanAnime] = await Promise.all([
      searchDatabaseAnime(keyword),
      searchAnime(keyword),
    ]);

    setDatabaseAnime(dbAnime);

    const filteredJikan = jikanAnime.filter(
      (anime) =>
        !dbAnime.some(
          (db) =>
            db.malId &&
            db.malId === anime.mal_id
        )
    );

    setAnimeList(filteredJikan);

  } catch (error) {
    console.log(error);
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