import { useEffect, useRef, useState } from 'react'
import { crowdColor, demoMembers, places } from './data'
import type { Place } from './data'
import type { Course } from './experience'
// Kakao's browser SDK is loaded at runtime; types below keep the integration local.
type Point = { getLat: () => number; getLng: () => number }
type MapInstance = { setCenter: (p: Point) => void; setLevel: (n: number) => void; getLevel: () => number; setBounds: (bounds: object) => void; relayout: () => void }
type Overlay = { setMap: (m: MapInstance | null) => void }
type SDK = { Polyline: new (options: object) => Overlay; LatLngBounds: new () => { extend: (p: Point) => void }; load: (cb: () => void) => void; LatLng: new (lat: number, lng: number) => Point; Map: new (el: HTMLElement, options: object) => MapInstance; CustomOverlay: new (options: object) => Overlay; Circle: new (options: object) => Overlay; event: { addListener: (m: MapInstance, event: string, cb: (e: { latLng: Point }) => void) => void; removeListener: (m: MapInstance, event: string, cb: (e: { latLng: Point }) => void) => void } }
declare global { interface Window { kakao?: { maps: SDK } } }
let sdkPromise: Promise<SDK> | undefined
function loadMap() {
  if (sdkPromise) return sdkPromise
  sdkPromise = new Promise<SDK>((resolve, reject) => {
    if (window.kakao?.maps) { window.kakao.maps.load(() => resolve(window.kakao!.maps)); return }
    const key = import.meta.env.VITE_KAKAO_API_KEY
    if (!key) { reject(new Error('지도 키 설정이 필요합니다')); return }
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`
    script.onload = () => window.kakao?.maps ? window.kakao.maps.load(() => resolve(window.kakao!.maps)) : reject(new Error('지도 인증을 확인해 주세요'))
    script.onerror = () => reject(new Error('카카오맵을 불러오지 못했어요'))
    document.head.appendChild(script)
  })
  return sdkPromise
}
export default function MapView({ selected, onSelect, crowd, members, sharing, myLocation, moving, onMove, zoom, route }: { route: Course | null; selected: number; onSelect: (id: number) => void; crowd: boolean; members: boolean; sharing: boolean; myLocation: { lat: number; lng: number }; moving: boolean; onMove: (lat: number, lng: number) => void; zoom: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const map = useRef<MapInstance | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    loadMap().then(sdk => {
      if (!active || !ref.current) return
      map.current = new sdk.Map(ref.current, { center: new sdk.LatLng(37.5305, 126.922), level: 6 })
      setReady(true)
    }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!ready || !map.current || !window.kakao) return
    const sdk = window.kakao.maps
    const overlays: Overlay[] = []
    const add = (lat: number, lng: number, html: HTMLElement, yAnchor = 1) => {
      overlays.push(new sdk.CustomOverlay({ map: map.current, position: new sdk.LatLng(lat, lng), content: html, yAnchor, zIndex: 5 }))
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
    if (sharing) {
      const el = document.createElement('div'); el.className = 'member-pin mine'; el.innerHTML = '<span>🙂</span><b>나</b>'; add(myLocation.lat, myLocation.lng, el)
    }
    return () => overlays.forEach(o => o.setMap(null))
  }, [ready, crowd, members, sharing, myLocation, selected, onSelect])
  useEffect(() => {
    if (!ready || !map.current || !window.kakao) return
    const p = places.find(p => p.id === selected)!
    map.current.setCenter(new window.kakao.maps.LatLng(p.lat + .003, p.lng))
  }, [selected, ready])
  useEffect(() => { if (ready) map.current?.setLevel(zoom) }, [zoom, ready])
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
    const line = new sdk.Polyline({ map: map.current, path, strokeWeight: 4, strokeColor: '#ed7946', strokeOpacity: .9, strokeStyle: 'shortdash' })
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
  return <><div className="kakao-map" ref={ref} />{!ready && <div className="map-fallback"><div className="river"/><div className="island"/><span className="district d1">마포구</span><span className="district d2">영등포구</span><span className="district d3">용산구</span><span className="river-name">한 강</span>{places.map((p, i) => <button key={p.id} style={{ left: `${[56, 48, 24, 42, 15][i]}%`, top: `${[50, 63, 28, 73, 80][i]}%` }} className={`place-pin fallback-pin ${selected === p.id ? 'active' : ''}`} onClick={() => onSelect(p.id)}><i style={{ background: crowdColor[p.crowd] }}/>{p.name}</button>)}{route && <div className="fallback-course"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="30,40 50,52 70,58" fill="none" stroke="#e58b50" strokeWidth=".6" strokeDasharray="1.3 1"/></svg>{route.stops.map((stop, i) => <div key={stop.name} className="route-stop-pin" style={{ position: 'absolute', left: `${[30, 50, 70][i]}%`, top: `${[40, 52, 58][i]}%`, transform: 'translate(-50%, -100%)' }}><b>{i + 1}</b><span>{stop.name}</span></div>)}</div>}<div className="map-error">{error || '카카오맵을 불러오고 있어요…'}{error && <small>카카오 개발자 콘솔에서 JavaScript 키와 현재 도메인 등록을 확인해 주세요.<br/>현재 보이는 화면은 데모 지도입니다.</small>}</div></div>}</>
}
