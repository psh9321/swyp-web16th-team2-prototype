export type Place = { id: number; name: string; area: string; category: string; crowd: '여유' | '보통' | '약간 붐빔' | '붐빔'; lat: number; lng: number; time: number; votes: number; image: string; description: string }
export const places: Place[] = [
  { id: 1, name: '여의도 한강공원', area: '영등포구 여의동로 330', category: '공원', crowd: '여유', lat: 37.5284, lng: 126.9328, time: 18, votes: 3, image: 'https://images.unsplash.com/photo-1546874177-9e664107314e?w=700&auto=format&fit=crop&q=80', description: '탁 트인 한강을 보며, 가볍게 모이기 좋은 곳. 잔디밭에서 피크닉은 어때요?' },
  { id: 2, name: '더현대 서울', area: '영등포구 여의대로 108', category: '쇼핑', crowd: '붐빔', lat: 37.5259, lng: 126.9284, time: 22, votes: 2, image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=700&auto=format&fit=crop&q=80', description: '쇼핑부터 맛집까지 한곳에. 실내에서 편하게 만날 수 있어요.' },
  { id: 3, name: '선유도공원', area: '영등포구 선유로 343', category: '공원', crowd: '여유', lat: 37.5431, lng: 126.9001, time: 28, votes: 1, image: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=700&auto=format&fit=crop&q=80', description: '초록과 한강이 만나는 조용한 산책길. 도란도란 이야기 나누기 좋아요.' },
  { id: 4, name: 'IFC 몰', area: '영등포구 국제금융로 10', category: '쇼핑', crowd: '보통', lat: 37.5252, lng: 126.9256, time: 20, votes: 0, image: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=700&auto=format&fit=crop&q=80', description: '영화와 식사를 함께 즐길 수 있는 실내 모임 장소예요.' },
  { id: 5, name: '문래 창작촌', area: '영등포구 도림로 128가길', category: '카페', crowd: '약간 붐빔', lat: 37.5146, lng: 126.897, time: 32, votes: 0, image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=700&auto=format&fit=crop&q=80', description: '골목마다 개성 있는 카페와 작은 작업실을 만날 수 있어요.' },
]
export const demoMembers = [
  { name: '지민', emoji: '🐻', color: '#e8ddff', lat: 37.5355, lng: 126.9202, status: '합정역 근처' },
  { name: '수빈', emoji: '🐰', color: '#fce0e8', lat: 37.5193, lng: 126.938, status: '여의나루역 근처' },
  { name: '현우', emoji: '🐱', color: '#fff0cc', lat: 37.5214, lng: 126.906, status: '당산역 근처' },
]
export const crowdColor = { '여유': '#23a77c', '보통': '#e7b542', '약간 붐빔': '#ee964e', '붐빔': '#e56c6c' }
