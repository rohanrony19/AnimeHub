import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getWatchlist,
  removeWatchlist,
} from "../services/user/watchlistService";
import toast from "react-hot-toast";

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const data = await getWatchlist();
      setWatchlist(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemove = async (animeId) => {
    try {
      await removeWatchlist(animeId);
      fetchWatchlist();
    } catch (error) {
      console.log(error);
      toast.error("Failed to remove watchlist");
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Watchlist 📌</h1>
        {watchlist.length === 0 ? (
          <div className="bg-slate-900 rounded-3xl p-16 text-center">
            <div className="text-7xl mb-6">📌</div>

            <h2 className="text-3xl font-bold">Watchlist is Empty</h2>

            <p className="text-gray-400 mt-4">
              Add anime to your watchlist so you never forget what to watch
              next.
            </p>
          </div>
        ) : (
          watchlist.map((anime) => (
            <div
              key={anime.animeId}
              className="bg-slate-800 p-4 rounded-lg mb-4 flex justify-between"
            >
              <span>{anime.title}</span>

              <button
                onClick={() => handleRemove(anime.animeId)}
                className="bg-red-500 px-3 py-1 rounded"
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

export default Watchlist;
