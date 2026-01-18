// src/api/toppingApi.ts
import axiosClient from './axiosClient';

export const getToppings = () => {
  return axiosClient.get('/inventory-items', {
    params: {
      itemTypeId: 'TOPPING',
      saleStatus: 'ACTIVE',
    },
  });
};
