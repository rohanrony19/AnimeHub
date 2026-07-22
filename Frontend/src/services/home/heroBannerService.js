import api from "../api";

export const getAllHeroBanners = async () => {
  const response = await api.get("/herobanners");
  return response.data;
};

export const addHeroBanner = async (banner) => {
  const response = await api.post("/herobanners", banner);
  return response.data;
};

export const updateHeroBanner = async (id, banner) => {
  const response = await api.put(`/herobanners/${id}`, banner);
  return response.data;
};

export const deleteHeroBanner = async (id) => {
  await api.delete(`/herobanners/${id}`);
};