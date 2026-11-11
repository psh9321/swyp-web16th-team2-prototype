import { useEffect, useRef, useState } from 'react'
import { crowdColor, demoMembers, places } from './data'
import type { Place } from './data'
import type { Course } from './experience'
import seoulBoundary from './map-data/seoul-boundary.json'
// Kakao's browser SDK is loaded at runtime; types below keep the integration local.
type Point = { getLat: () => number; getLng: () => number }
type MapInstance = { setCenter: (p: Point) => void; setLevel: (n: number) => void; getLevel: () => number; getBounds: () => { getSouthWest: () => Point; getNorthEast: () => Point }; setBounds: (bounds: object) => void; relayout: () => void }
type Overlay = { setMap: (m: MapInstance | null) => void }
type SDK = { Polygon: new (options: object) => Overlay; Polyline: new (options: object) => Overlay; LatLngBounds: new () => { extend: (p: Point) => void }; load: (cb: () => void) => void; LatLng: new (lat: number, lng: number) => Point; Map: new (el: HTMLElement, options: object) => MapInstance; CustomOverlay: new (options: object) => Overlay; Circle: new (options: object) => Overlay; event: { addListener: (m: MapInstance, event: string, cb: (e: { latLng: Point }) => void) => void; removeListener: (m: MapInstance, event: string, cb: (e: { latLng: Point }) => void) => void } }
declare global { interface Window { kakao?: { maps: SDK } } }
let sdkPromise: Promise<SDK> | undefined
function loadMap() {
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise<SDK>((resolve, reject) => {
    const key = import.meta.env.VITE_KAKAO_MAP_JAVASCRIPT_KEY
    if (!key) { reject(new Error('카카오맵 JavaScript 키가 필요해요')); return }
    let script: HTMLScriptElement | undefined
    const timer = window.setTimeout(() => fail('카카오맵 연결 시간이 초과됐어요'), 15000)
    function fail(message: string) {
      window.clearTimeout(timer)
      script?.remove()
      reject(new Error(message))
    }
    function initialize() {
      const sdk = window.kakao?.maps
      if (!sdk) { fail('카카오맵 인증에 실패했어요'); return }
      sdk.load(() => { window.clearTimeout(timer); resolve(sdk) })
    }
    if (window.kakao?.maps) { initialize(); return }
    script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`
    script.async = true
    script.onload = initialize
    script.onerror = () => fail('카카오맵을 연결할 수 없어요. JavaScript 키와 등록 도메인을 확인해 주세요.')
    document.head.appendChild(script)
  }).catch(error => { sdkPromise = undefined; throw error })
  return sdkPromise
}
export default function MapView({ selected, onSelect, crowd, members, myLocation, locationFocus, locating, onLocate, moving, onMove, zoom, route }: { route: Course | null; selected: number; onSelect: (id: number) => void; crowd: boolean; members: boolean; myLocation: { lat: number; lng: number } | null; locationFocus: number; locating: boolean; onLocate: () => void; moving: boolean; onMove: (lat: number, lng: number) => void; zoom: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const map = useRef<MapInstance | null>(null)
  const previousSelection = useRef(selected)
  const [allowFallback, setAllowFallback] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (map.current || (!myLocation && !allowFallback)) return
    let active = true
    setError('')
    loadMap().then(sdk => {
      if (!active || !ref.current) return
      const center = myLocation ?? { lat: 37.5305, lng: 126.922 }
      map.current = new sdk.Map(ref.current, { center: new sdk.LatLng(center.lat, center.lng), level: zoom })
      setReady(true)
    }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  }, [attempt, myLocation, allowFallback, zoom])
  useEffect(() => {
    if (!ready || !map.current || !window.kakao) return
    const sdk = window.kakao.maps
    const current = map.current
    const hole = seoulBoundary.map(([lng, lat]) => new sdk.LatLng(lat, lng))
    let mask: Overlay | undefined
    const drawMask = () => {
      const bounds = current.getBounds()
      const sw = bounds.getSouthWest(), ne = bounds.getNorthEast()
      // Keep the outside ring around both the viewport and the whole Seoul hole.
      const south = Math.max(-85, Math.min(37.4, sw.getLat()) - 1)
      const north = Math.min(85, Math.max(37.8, ne.getLat()) + 1)
      const west = Math.max(-179, Math.min(126.7, sw.getLng()) - 1)
      const east = Math.min(179, Math.max(127.2, ne.getLng()) + 1)
      const outer = [[south, west], [north, west], [north, east], [south, east]].map(([lat, lng]) => new sdk.LatLng(lat, lng))
      const previous = mask
      mask = new sdk.Polygon({ map: current, path: [outer, hole], strokeWeight: 0, strokeOpacity: 0, fillColor: '#000000', fillOpacity: 0.5, zIndex: 2 })
      previous?.setMap(null)
    }
    const boundaryOutline = new sdk.Polyline({ map: current, path: hole, strokeWeight: 6, strokeColor: '#b8b8b1', strokeOpacity: 0.85, strokeStyle: 'solid', zIndex: 3 })
    const boundaryLine = new sdk.Polyline({ map: current, path: hole, strokeWeight: 3, strokeColor: '#ffffff', strokeOpacity: 0.95, strokeStyle: 'solid', zIndex: 4 })
    drawMask()
    sdk.event.addListener(current, 'bounds_changed', drawMask)
    return () => { sdk.event.removeListener(current, 'bounds_changed', drawMask); mask?.setMap(null); boundaryOutline.setMap(null); boundaryLine.setMap(null) }
  }, [ready])
  useEffect(() => {
    if (!ready || !map.current || !window.kakao) return
    const sdk = window.kakao.maps
    const overlays: Overlay[] = []
    const add = (lat: number, lng: number, html: HTMLElement, yAnchor = 1, zIndex = 5) => {
      overlays.push(new sdk.CustomOverlay({ map: map.current, position: new sdk.LatLng(lat, lng), content: html, yAnchor, zIndex }))
    }
    places.forEach((p: Place) => {
      if (crowd) overlays.push(new sdk.Circle({ map: map.current, center: new sdk.LatLng(p.lat, p.lng), radius: p.id === 1 ? 480 : 330, strokeWeight: 1, strokeColor: crowdColor[p.crowd], strokeOpacity: .25, fillColor: crowdColor[p.crowd], fillOpacity: .13 }))
      const button = document.createElement('button')
      button.className = `place-pin ${selected === p.id ? 'active' : ''}`
      button.innerHTML = `<i style="background:${crowdColor[p.crowd]}"></i>${p.name}${selected === p.id ? '<span>추천</span>' : ''}`
      button.onclick = () => onSelect(p.id)
      add(p.lat, p.lng, button)
    })
    if (members) demoMembers.forEach(m => {
      const el = document.createElement('div'); el.className = 'member-pin'; el.innerHTML = `<span style="background:${m.color}">${m.emoji}</span><b>${m.name}</b>`; add(m.lat, m.lng, el)
    })
    if (myLocation) {
      const el = document.createElement('div'); el.className = 'member-pin mine'; el.setAttribute('aria-label', '내 위치: 나'); el.innerHTML = '<span class="my-position-dot"></span><b>나</b>'; add(myLocation.lat, myLocation.lng, el, 1, 15)
    }
    return () => overlays.forEach(o => o.setMap(null))
  }, [ready, crowd, members, myLocation, locationFocus, selected, onSelect])
  useEffect(() => {
    if (!ready || !map.current || !window.kakao) return
    if (previousSelection.current === selected) return
    previousSelection.current = selected
    const p = places.find(p => p.id === selected)!
    map.current.setCenter(new window.kakao.maps.LatLng(p.lat + .003, p.lng))
  }, [selected, ready])
  useEffect(() => { if (ready) map.current?.setLevel(zoom) }, [zoom, ready])
  useEffect(() => {
    if (!ready || !map.current || !window.kakao || !myLocation || !locationFocus) return
    map.current.setCenter(new window.kakao.maps.LatLng(myLocation.lat, myLocation.lng))
  }, [ready, locationFocus, myLocation])
  useEffect(() => {
    if (!ready || !map.current || !window.kakao || !moving) return
    const sdk = window.kakao.maps, current = map.current
    const listener = (e: { latLng: Point }) => onMove(e.latLng.getLat(), e.latLng.getLng())
    sdk.event.addListener(current, 'click', listener)
    return () => sdk.event.removeListener(current, 'click', listener)
  }, [moving, ready, onMove])
  useEffect(() => {
    if (!ready || !map.current || !window.kakao || !route) return
    const sdk = window.kakao.maps
    const path = route.stops.map(s => new sdk.LatLng(s.lat, s.lng))
    const line = new sdk.Polyline({ map: map.current, path, strokeWeight: 4, strokeColor: '#333333', strokeOpacity: .9, strokeStyle: 'shortdash' })
    const bounds = new sdk.LatLngBounds()
    path.forEach(p => bounds.extend(p))
    map.current.setBounds(bounds)
    const stops = route.stops.map((s, i) => {
      const el = document.createElement('div')
      el.className = 'route-stop-pin'
      const number = document.createElement('b'); number.textContent = String(i + 1)
      const label = document.createElement('span'); label.textContent = s.name
      el.append(number, label)
      return new sdk.CustomOverlay({ map: map.current, position: path[i], content: el, yAnchor: 1.8, zIndex: 8 })
    })
    return () => { line.setMap(null); stops.forEach(s => s.setMap(null)) }
  }, [ready, route])
  useEffect(() => {
    if (!ready || !ref.current) return
    const resize = new ResizeObserver(() => map.current?.relayout()); resize.observe(ref.current)
    return () => resize.disconnect()
  }, [ready])
  return <><div className="kakao-map" ref={ref} aria-label="카카오 지도" />{!ready && <div className="map-connection" role={error ? 'alert' : 'status'}>
    <div className="kakao-connection-logo">K<span>map</span></div>
    <h3>{!myLocation && !allowFallback ? (locating ? '내 위치를 확인하고 있어요' : '현재 위치를 확인할 수 없어요') : error || '카카오맵을 연결하고 있어요'}</h3>
    {!myLocation && !allowFallback ? <><p>{locating ? '위치 권한을 허용하면 내 위치를 중심으로 지도가 열려요.' : '브라우저의 위치 권한을 허용한 뒤 다시 시도해 주세요.'}</p>{!locating && <><button onClick={onLocate}>내 위치 다시 확인</button><button onClick={() => setAllowFallback(true)}>추천 지역 지도 보기</button></>}</> : error ? <><p>카카오 지도 JavaScript SDK로 실제 지도를 표시합니다.<br/>아래 설정을 확인한 뒤 다시 연결해 주세요.</p><ol><li>카카오 개발자 콘솔에서 <b>JavaScript 키</b>를 확인하세요.</li><li><code>.env</code>에 <code>VITE_KAKAO_MAP_JAVASCRIPT_KEY</code>를 설정하세요.</li><li>해당 키의 JavaScript SDK 도메인에<br/><code>{location.origin}</code>을 등록하세요.</li><li>환경 변수 변경 후 개발 서버를 다시 시작하세요.</li></ol><button onClick={() => setAttempt(n => n + 1)}>카카오맵 다시 연결</button><a href="https://apis.map.kakao.com/web/guide/" target="_blank" rel="noreferrer">공식 설정 가이드 ↗</a></> : <p>지도와 장소 핀을 준비하고 있어요.</p>}
  </div>}</>
}
