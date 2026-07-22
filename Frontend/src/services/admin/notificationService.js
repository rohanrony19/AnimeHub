import api from "../api";

export const createNotification = async (notification) => {
  const response = await api.post("/notifications", notification);
  return response.data;
};

export const getMyNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};

export const sendNotification = async (notification) => {
  const response = await api.post("/notifications", notification);

  return response.data;
};

export const getAllNotifications = async () => {
  const response = await api.get("/notifications/all");
  return response.data;
};