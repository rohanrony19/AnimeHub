import api from "../api";

export const getAllUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};