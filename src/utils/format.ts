import { format } from 'date-fns';

export const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatDate = (date: string | Date) => {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd/MM/yyyy');
  } catch (e) {
    return '';
  }
};
