import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { getContinueWatching } from "../services/user/continueWatchingService";

function ContinueWatching() {
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const data = await getContinueWatching();

      setProgress(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Continue Watching ⏯</h1>

        {progress.length === 0 ? (
          <div className="bg-slate-900 rounded-3xl p-16 text-center">
            <div className="text-7xl mb-6">▶️</div>

            <h2 className="text-3xl font-bold">Nothing to Continue</h2>

            <p className="text-gray-400 mt-4">
              Start watching an anime and your progress will automatically
              appear here.
            </p>
          </div>
        ) : (
          progress.map((item) => (
            <div
              key={item.episodeId}
              className="bg-slate-800 p-4 rounded-xl mb-4"
            >
              <h2 className="text-xl font-bold">{item.episodeTitle}</h2>

              <p className="text-gray-400 mt-2">
                Watched: {item.watchedTimeInSeconds} seconds
              </p>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default ContinueWatching;
