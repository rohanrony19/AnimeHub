import { useNavigate } from "react-router-dom";

function ProfileAnimeCard({
  image,
  title,
  subtitle,
  extra,
  watchLink,
  onWatch,
  watchText = "Watch",
  removeText = "Remove",
  onRemove,
  progress = null,
  watchedText = null,
}) {
  const navigate = useNavigate();
  return (
    <div className="flex bg-[#1A2035] rounded-3xl overflow-hidden border border-slate-700 hover:border-violet-500 transition">

      <img
        src={image}
        alt={title}
        className="w-24 h-36 object-cover"
      />

      <div className="flex-1 p-4 flex flex-col">

        <h2 className="text-lg font-bold line-clamp-1">
          {title}
        </h2>

        <p className="text-violet-400 text-sm mt-1">
          {subtitle}
        </p>

        <p className="text-gray-400 text-sm mt-1">
          {extra}
        </p>

        {progress !== null && (
  <div className="mt-3">
    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
      <div
        className="h-full bg-violet-500 rounded-full transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>

    {watchedText && (
      <p className="text-xs text-gray-400 mt-2">
        {watchedText}
      </p>
    )}
  </div>
)}

        <div className="mt-auto flex gap-3">

          <button
  onClick={onWatch}
  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 transition"
>
  ▶ {watchText}
</button>

          <button
            onClick={onRemove}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 transition"
          >
            {removeText}
          </button>

        </div>

      </div>

    </div>
  );
}

export default ProfileAnimeCard;