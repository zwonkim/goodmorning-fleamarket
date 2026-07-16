export type ProductCondition = 'new' | 'lightly_used' | 'used';
export type ProductStatus = 'for_sale' | 'reserved' | 'sold';

export const CONDITION_LABELS: Record<ProductCondition, string> = {
  new: '새 상품',
  lightly_used: '사용감 적음',
  used: '사용감 있음',
};

export const STATUS_LABELS: Record<ProductStatus, string> = {
  for_sale: '판매중',
  reserved: '예약중',
  sold: '거래완료',
};

export const STATUS_BADGE_CLASSES: Partial<Record<ProductStatus, string>> = {
  reserved: 'bg-sunny/25 text-[#8a6d1f]',
  sold: 'bg-text-secondary/15 text-text-secondary',
};

export const STATUS_ORDER: ProductStatus[] = ['for_sale', 'reserved', 'sold'];

export const STATUS_CHANGE_LABELS: Record<ProductStatus, string> = {
  for_sale: '판매중으로 변경',
  reserved: '예약중으로 변경',
  sold: '거래완료로 변경',
};

export type Product = {
  id: string;
  user_id: string;
  title: string;
  price: number;
  status: ProductStatus;
  condition: ProductCondition;
  description: string;
  created_at: string;
};

export type ProductImage = {
  id: string;
  product_id: string;
  storage_path: string;
  sort_order: number;
};
