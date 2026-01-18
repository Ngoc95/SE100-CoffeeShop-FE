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
