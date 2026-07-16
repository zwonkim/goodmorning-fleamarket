export type Coupon = {
  id: string;
  emoji: string;
  badge: string;
  title: string;
  description: string;
};

export const COUPONS: Coupon[] = [
  {
    id: 'misc-10-off',
    emoji: '👒',
    badge: '중복 사용 불가',
    title: '잡화 10% 할인 쿠폰',
    description: '잡화 상품 구매 시 10% 할인돼요. 다른 쿠폰과 중복 사용은 안 돼요.',
  },
  {
    id: 'clothes-500-off',
    emoji: '👕',
    badge: '중복 사용 가능',
    title: '의류 500원 할인 쿠폰',
    description: '의류 상품 구매 시 500원 할인돼요. 다른 쿠폰과 중복 사용 가능해요.',
  },
  {
    id: 'doyoung-aegyo',
    emoji: '🥰',
    badge: '현장 사용',
    title: '김도영 애교 쿠폰',
    description: '판매자에게 도영이의 애교로 네고를 문의할 수 있어요.',
  },
  {
    id: 'minjin-hohtong',
    emoji: '😤',
    badge: '현장 사용',
    title: '김민진 호통 쿠폰',
    description: '구매자가 과한 네고를 요구할 때 민진이 대신 호통쳐드려요.',
  },
];
