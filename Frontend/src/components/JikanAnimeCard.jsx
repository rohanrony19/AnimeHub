import { Link } from "react-router-dom";

function JikanAnimeCard({
  anime,
  profile = false,
  showGenre = true,
  showRemove = false,
  onRemove,
}) {
  if (!anime?.mal_id && !anime?.id) {
    return (
      <div className="bg-slate-900 rounded-3xl p-6 text-center">
        <h3 className="text-xl font-semibold">Anime data is unavailable.</h3>
      </div>
    );
  }
  return (
    <Link to={`/jikan/${anime.mal_id}`}>
      <div
        className={`group ${
          profile ? "w-[250px]" : "w-[220px]"
        } flex-shrink-0 cursor-pointer rounded-3xl overflow-hidden flex flex-col transition-all duration-300 shadow-xl hover:-translate-y-2 ${
          localStorage.getItem("theme") === "purple"
            ? "bg-violet-700 shadow-violet-900/30 hover:shadow-[0_20px_40px_rgba(109,40,217,0.45)]"
            : "bg-slate-800 shadow-black/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
        }`}
      >
        <div className="relative overflow-hidden">
          <img
            src={anime.images?.jpg?.large_image_url || anime.posterUrl}
            alt={anime.title}
            className={`w-full ${
              profile ? "h-[330px]" : "h-[260px]"
            } object-cover transition-transform duration-500 group-hover:scale-110`}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
        </div>

        <div className="p-3 flex flex-col flex-1">
          <h2 className="text-xl font-bold h-[50px] overflow-hidden">
            {anime.title}
          </h2>

          {showGenre && (
            <p
              className={`mt-auto ${
                localStorage.getItem("theme") === "purple"
                  ? "text-violet-100"
                  : "text-gray-400"
              }`}
            >
              {anime.genres?.[0]?.name || anime.genre}
            </p>
          )}
        </div>
      </div>
      {showRemove && (
        <div className="p-4 pt-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              onRemove(anime);
            }}
            className="w-full bg-red-500 hover:bg-red-600 rounded-xl py-3 font-semibold transition"
          >
            Remove
          </button>
        </div>
      )}
    </Link>
  );
}

export default JikanAnimeCard;
