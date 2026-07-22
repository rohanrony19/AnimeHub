import { useEffect, useState } from "react";
import { getAllHeroBanners } from "../services/home/heroBannerService";
import { useNavigate } from "react-router-dom";
import { getDatabaseAnimeByMalId } from "../services/anime/databaseAnimeService";
import { getEpisodesByAnime } from "../services/anime/databaseEpisodeService";
import SkeletonHero from "../components/loading/SkeletonHero";

function HeroBanner() {
  const [animeList, setAnimeList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const anime = animeList[currentIndex];

  const navigate = useNavigate();

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % animeList.length);
  };

  const previousSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? animeList.length - 1 : prev - 1));
  };
  useEffect(() => {
    fetchHeroBanners();
  }, []);

  useEffect(() => {
    if (animeList.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % animeList.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [animeList]);

  const fetchHeroBanners = async () => {
    try {
      const data = await getAllHeroBanners();

      setAnimeList(data);
    } catch (error) {
      toast.error("Failed to load hero banners.");
    }
  };

  if (animeList.length === 0) {
    return <SkeletonHero />;
  }

  const handleWatchNow = async () => {
    // Hero banner has no MAL ID
    if (!anime.malId) {
      toast.error("Streaming is not available for this anime.");
      return;
    }

    try {
      const dbAnime = await getDatabaseAnimeByMalId(anime.malId);

      const episodes = await getEpisodesByAnime(dbAnime.id);

      if (episodes.length > 0) {
        navigate(`/db/watch/${dbAnime.id}/${episodes[0].id}`);
      } else {
        navigate(`/watch/${anime.malId}/1`);
      }
    } catch (error) {
      navigate(`/watch/${anime.malId}/1`);
    }
  };
  const handleMoreInfo = async () => {
    try {
      const dbAnime = await getDatabaseAnimeByMalId(anime.malId);

      navigate(`/anime/${dbAnime.id}`);
    } catch (error) {
      navigate(`/jikan/${anime.malId}`);
    }
  };
  return (
    <div className="relative h-screen">
      <button
        onClick={previousSlide}
        className="
    absolute
    left-3
    top-1/2
    -translate-y-1/2
    z-20
    bg-black/40
    w-12
    h-12
    rounded-full
    text-2xl
    text-white
    "
      >
        ❮
      </button>
      {/* Background */}
      <img
        src={anime.bannerUrl}
        alt={anime.title}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>

      {/* Text */}
      <div
        key={currentIndex}
        className="
absolute
left-20
bottom-28
z-10
text-white
max-w-[700px]
"
      >
        <h1 className="text-5xl font-black mb-5">{anime.title}</h1>

        <div className="flex gap-8 mb-8 text-xl items-center">
          <span className="text-yellow-300">⭐ {anime.rating}</span>

          <span>{anime.releaseYear}</span>

          <span>{anime.genre}</span>
        </div>

        <p className="text-lg text-gray-300 leading-8 mb-8">
          {anime.description}
        </p>

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleWatchNow}
            className="bg-white text-black px-8 py-4 rounded-xl font-bold"
          >
            ▶ Watch Now
          </button>

          <button
            onClick={handleMoreInfo}
            className="bg-white/20 backdrop-blur-md px-8 py-4 rounded-xl font-bold"
          >
            More Info
          </button>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {animeList.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={
              currentIndex === index
                ? "w-10 h-3 rounded-full bg-green-400 transition-all duration-300"
                : "w-3 h-3 rounded-full bg-white/40 transition-all duration-300"
            }
          />
        ))}
      </div>
      <button
        onClick={nextSlide}
        className="
    absolute
    right-3
    top-1/2
    -translate-y-1/2
    z-20
    bg-black/40
    w-12
    h-12
    rounded-full
    text-2xl
    text-white
    "
      >
        ❯
      </button>
    </div>
  );
}

export default HeroBanner;
