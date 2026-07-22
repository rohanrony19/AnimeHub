import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getFavorites, removeFavorite } from "../services/user/favoriteService";
import toast from "react-hot-toast";

function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemove = async (animeId) => {
    try {
      await removeFavorite(animeId);

      fetchFavorites();
    } catch (error) {
      console.log(error);

      toast.error("Failed to remove favorite");
    }
  };
  return (
    <>
      <Navbar />

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Favorites ❤️</h1>

        {favorites.length === 0 ? (
          <div className="bg-slate-900 rounded-3xl p-16 text-center">
            <div className="text-7xl mb-6">❤️</div>

            <h2 className="text-3xl font-bold">No Favorites Yet</h2>

            <p className="text-gray-400 mt-4">
              Save your favorite anime to access them quickly anytime.
            </p>
          </div>
        ) : (
          favorites.map((anime) => (
            <div
              key={anime.animeId}
              className="bg-slate-800 p-4 rounded-lg mb-4 flex justify-between items-center"
            >
              <span>{anime.title}</span>

              <button
                onClick={() => handleRemove(anime.animeId)}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default Favorites;
