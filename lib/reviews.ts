export type Review = {
  id: string;
  title: string;
  content: string;
  images: string[];
  buyerNickname: string;
  sellerNickname: string;
  createdAt: string;
};

export const REVIEWS: Review[] = [
  {
    id: 'geoje-2026-07',
    title: '야르! 거제 야호✌️ 감옥에서~ 누가 돌아왔게~',
    content:
      '실내온도를 18도로 맞춰놨는데도 땀이 삐질삐질 날 정도로 따뜻한 옷이네요. 투웨이라 배부를 땐 지퍼를 올릴 수 있어 좋습니다.',
    images: [
      '/assets/reviews/IMG_4109.JPG',
      '/assets/reviews/IMG_4117.JPG',
      '/assets/reviews/IMG_4119.JPG',
    ],
    buyerNickname: '우람소',
    sellerNickname: '내티5bucks',
    createdAt: '2026-07-17',
  },
];

export function getReview(reviewId: string): Review | null {
  return REVIEWS.find((review) => review.id === reviewId) ?? null;
}
