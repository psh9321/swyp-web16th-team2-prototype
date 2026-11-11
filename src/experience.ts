import type { Place } from './data'
export const themes = ['친구와', '데이트', '아이와', '기념일']
export const moods = ['야외', '실내', '조용한', '활기찬']
export const placeTraits: Record<number, { themes: string[]; moods: string[] }> = {
  1: { themes: ['친구와', '데이트', '아이와'], moods: ['야외', '활기찬'] },
  2: { themes: ['친구와', '데이트', '기념일'], moods: ['실내', '활기찬'] },
  3: { themes: ['데이트', '아이와', '친구와'], moods: ['야외', '조용한'] },
  4: { themes: ['친구와', '아이와', '기념일'], moods: ['실내', '활기찬'] },
  5: { themes: ['친구와', '데이트', '기념일'], moods: ['야외', '실내', '활기찬'] },
}
export function matchesTraits(id: number, theme: string, mood: string) {
  const traits = placeTraits[id]
  return (!theme || traits.themes.includes(theme)) && (!mood || traits.moods.includes(mood))
}
export type RouteStop = { name: string; kind: string; lat: number; lng: number; stay: number; walk: number; wait: number; note: string }
export type Course = { id: string; title: string; subtitle: string; emoji: string; stops: RouteStop[] }
export function coursesFor(p: Place): Course[] {
  const stop = (name: string, kind: string, latOffset: number, lngOffset: number, stay: number, walk: number, wait: number, note: string): RouteStop => ({ name, kind, lat: p.lat + latOffset, lng: p.lng + lngOffset, stay, walk, wait, note })
  const start = stop(p.name, '만남', 0, 0, 30, 0, 0, '선택한 모임 장소에서 시작')
  return [
    { id: `${p.id}-relax`, title: '웨이팅 줄이고, 대화는 길게', subtitle: '친구와 · 조용한 · 산책 + 식사 + 카페', emoji: '🌿', stops: [start, stop('골목 키친', '식사', -.0018, .002, 50, 6, 5, '대기 짧은 식당 예시'), stop('느린 오후', '카페', -.0025, .003, 45, 4, 0, '대화하기 좋은 카페 예시')] },
    { id: `${p.id}-play`, title: '먹고, 구경하고, 취향 발견', subtitle: '데이트 · 활기찬 · 팝업 + 식사', emoji: '🎈', stops: [start, stop('위켄드 팝업', '팝업', .0013, -.002, 40, 5, 20, '입장 대기가 있는 팝업 예시'), stop('테이블 오렌지', '식사', .0022, -.003, 55, 4, 15, '팝업 근처 식당 예시')] },
    { id: `${p.id}-indoor`, title: '날씨 걱정 없는 실내 코스', subtitle: '아이와 · 실내 · 식사 + 문화생활', emoji: '☂️', stops: [start, stop('모두의 식탁', '식사', -.001, -.0015, 50, 5, 10, '가족과 방문하기 좋은 식당 예시'), stop('작은 시네마', '영화', -.0018, -.002, 100, 3, 0, '식사 후 영화 관람 예시')] },
  ]
}
export type FieldReport = { id: string; placeId: number; author: string; emoji: string; tag: string; text: string; wait: number | null; created: number; demo: boolean }
export function seedReports(): FieldReport[] {
  return [
    { id: 'seed-1', placeId: 1, author: '지민', emoji: '🐻', tag: '분위기', text: '강변은 바람이 좀 있지만 잔디 쪽은 이야기 나누기 좋아요. 돗자리 챙겨오면 좋겠어요!', wait: null, created: 0, demo: true },
    { id: 'seed-2', placeId: 2, author: '수빈', emoji: '🐰', tag: '웨이팅', text: '주변 거리는 보통인데 실내 팝업 줄은 길어요. 식사 먼저 하고 들르는 코스도 좋겠어요.', wait: 35, created: 0, demo: true },
    { id: 'seed-3', placeId: 3, author: '현우', emoji: '🐱', tag: '분위기', text: '산책하기 좋은 분위기예요. 그늘 있는 벤치에서 먼저 만나면 찾기 편할 것 같아요.', wait: null, created: 0, demo: true },
    { id: 'seed-4', placeId: 4, author: '지민', emoji: '🐻', tag: '웨이팅', text: '식당마다 대기 차이가 있어요. 카페에서 모여서 식사 장소를 같이 정해봐요.', wait: 15, created: 0, demo: true },
    { id: 'seed-5', placeId: 5, author: '현우', emoji: '🐱', tag: '방문 팁', text: '골목에 작은 카페가 많아요. 큰길에서 만나서 같이 걸어 들어오는 걸 추천해요.', wait: null, created: 0, demo: true },
  ]
}
export function totalCourseMinutes(c: Course) { return c.stops.reduce((sum, s) => sum + s.stay + s.walk + s.wait, 0) }
