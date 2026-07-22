import api from "../api";

export const watchEpisode = async (id) => {
  const response = await api.get(`/episodes/${id}/watch`);
  return response.data;
};

export const getEpisodesByAnime = async (animeId) => {
  const response = await api.get(`/episodes/anime/${animeId}`);
  return response.data;
};

export const getEpisodesBySeason = async (animeId, season) => {
  const response = await api.get(
    `/episodes/anime/${animeId}/season/${season}`
  );
  return response.data;
};

export const getEpisodeById = async (id) => {
  const response = await api.get(`/episodes/${id}`);
  return response.data;
};

export const saveWatchProgress = async (
  episodeId,
  watchedTimeInSeconds
) => {
  await api.post(
    `/episodes/${episodeId}/progress`,
    null,
    {
      params: {
        watchedTimeInSeconds,
      },
    }
  );
};

export const getWatchProgress = async (episodeId) => {
  const response = await api.get(
    `/episodes/${episodeId}/progress`
  );

  return response.data;
};