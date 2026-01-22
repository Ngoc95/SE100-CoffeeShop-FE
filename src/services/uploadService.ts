import axiosClient from '../api/axiosClient';

export const uploadService = {
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data; // { message, metaData: { url, publicId, ... } }
  },

  deleteImage: async (publicId: string) => {
    const response = await axiosClient.delete('/upload/image', {
      data: { publicId },
    });
    return response.data;
  },
};
