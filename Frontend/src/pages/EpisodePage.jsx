import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { watchEpisode } from "../services/anime/databaseEpisodeService";
import { saveContinueWatching }
from "../services/user/continueWatchingService";

function EpisodePage() {

  const { id } = useParams();

  const [videoUrl, setVideoUrl] = useState("");

  
  useEffect(() => {
    fetchVideo();
  }, []);

  const fetchVideo = async () => {
    try {
      const data = await watchEpisode(id);
      setVideoUrl(data);
      await saveContinueWatching(id);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6">

      <h1 className="text-3xl font-bold mb-5">
        Episode {id}
      </h1>
<p>{videoUrl}</p>
      {videoUrl && (
        
        <video
          controls
          className="w-full rounded-xl"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

    </div>
  );
}

export default EpisodePage;