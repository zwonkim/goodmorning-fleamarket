export type ProductCondition = 'new' | 'lightly_used' | 'used';

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: '새 상품',
  lightly_used: '사용감 적음',
  used: '사용감 있음',
};

export type Product = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  condition: ProductCondition;
  description: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  sort_order: number;
};
