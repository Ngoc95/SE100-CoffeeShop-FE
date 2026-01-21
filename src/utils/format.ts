export const formatCurrency = (amount: number | undefined | null) => {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatDate = (date: string | Date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
};
