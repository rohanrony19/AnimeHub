import api from "../api";

export const uploadProfileImage = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/users/upload-profile",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const getCurrentUser = async () => {

  const response = await api.get("/users/me");

  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await api.put("/users/profile", profileData);

  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.post("/users/change-password", data);
  return response.data;
};