import api from "../api";

export const getReviews = async (animeId) => {
  const response = await api.get(`/reviews/${animeId}`);
  return response.data;
};

export const addReview = async (animeId, review) => {
  const response = await api.post(`/reviews/${animeId}`, review);
  return response.data;
};

export const getAverageRating = async (animeId) => {
  const response = await api.get(`/reviews/${animeId}/average-rating`);
  return response.data;
};