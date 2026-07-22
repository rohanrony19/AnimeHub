import api from "../api";

export const getPopularAnime = async (
  page = 0,
  size = 20
) => {
  const response = await api.get("/anime/genre", {
    params: {
      genre: "POPULAR",
      page,
      size,
    },
  });

  return response.data;
};