import axiosClient from './axiosClient';

export const login = (username: string, password: string) => {
  return axiosClient.post('/auth/login', {
    username,
    password,
  });
};
export const refreshToken = () => {
  return axiosClient.post('/auth/refresh-token');
};

// Update current user's profile (e.g., username)
export const updateProfile = (payload: { username?: string; fullName?: string; phone?: string }) => {
  return axiosClient.patch('/auth/me', payload);
};

// Change password for current user
export const changePassword = (payload: { currentPassword: string; newPassword: string }) => {
  return axiosClient.post('/auth/change-password', payload);
};
