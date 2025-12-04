export interface Category {
  id: string;
  name: string;
  count: number;
}

export const categories: Category[] = [
  { id: 'all', name: 'Tất cả', count: 45 },
  { id: 'coffee', name: 'Cà phê', count: 8 },
  { id: 'milk-tea', name: 'Trà sữa', count: 7 },
  { id: 'pastries', name: 'Bánh ngọt', count: 6 },
  { id: 'bottled-beverages', name: 'Đồ uống đóng chai', count: 15 },
  { id: 'brewing-ingredients', name: 'Nguyên liệu pha chế', count: 12 },
  { id: 'dairy', name: 'Sữa & Kem', count: 6 },
  { id: 'syrup', name: 'Siro & Đường', count: 12 },
  { id: 'tea', name: 'Trà', count: 7 },
  { id: 'fruit', name: 'Trái cây', count: 8 },
  { id: 'packaging', name: 'Bao bì', count: 4 },
];
