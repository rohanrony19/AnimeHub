import { Link } from "react-router-dom";

function DatabaseAnimeCard({ anime }) {
  return (
    <Link to={`/anime/${anime.id}`}>
      <div
        className={`group w-[220px] flex-shrink-0 cursor-pointer rounded-3xl overflow-hidden flex flex-col transition-all duration-300 shadow-xl hover:-translate-y-2 ${
          localStorage.getItem("theme") === "purple"
            ? "bg-violet-700 shadow-violet-900/30 hover:shadow-[0_20px_40px_rgba(109,40,217,0.45)]"
            : "bg-slate-800 shadow-black/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
        }`}
      >
        <div className="relative overflow-hidden">
  <img
    src={anime.posterUrl}
    alt={anime.title}
    className="w-full h-[260px] object-cover transition-transform duration-500 group-hover:scale-110"
  />

  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
</div>

        <div className="p-3">
          <h2 className="text-lg font-bold line-clamp-2 min-h-[56px]">
            {anime.title}
          </h2>

          <p
            className={`mt-2 text-sm line-clamp-1 ${
              localStorage.getItem("theme") === "purple"
                ? "text-violet-100"
                : "text-gray-400"
            }`}
          >
            {anime.genre}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default DatabaseAnimeCard;