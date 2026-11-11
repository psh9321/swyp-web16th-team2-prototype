import { useCallback, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import MapView from './Map'
import { crowdColor, demoMembers, places } from './data'
import type { Place } from './data'
import { CoursePanel, FieldPanel, ThemeFilters } from './ExperiencePanel'
import { matchesTraits, placeTraits, seedReports } from './experience'
import type { Course, FieldReport } from './experience'
import './App.css'

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15M15 6v15"/></>,
    people: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/><path d="M16 3a4 4 0 0 1 0 8"/></>,
    pin: <><path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>, close: <path d="m6 6 12 12M6 18 18 6"/>, arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>, down: <path d="m7 10 5 5 5-5"/>, check: <path d="m5 12 4 4L19 6"/>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>, share: <><path d="M12 16V3m-5 5 5-5 5 5M5 14v6h14v-6"/></>,
    target: <><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></>,
    vote: <><path d="m9 3 8 3-4 9-8-3ZM4 14l-2 7h20l-3-7M9 18h6"/></>, clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    settings: <><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3"/><circle cx="15" cy="17" r="3"/></>, info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v1"/></>, leaf: <><path d="M20 3C9 2 3 7 5 15c8 5 16-1 15-12ZM4 21 16 9"/></>,
    link: <><path d="m10 13 4-4m-6 7-2 2a4 4 0 0 1-6-6l4-4m10 0 2-2a4 4 0 0 1 6 6l-4 4" transform="translate(1 0)"/></>, home: <><path d="m3 10 9-7 9 7v11H3ZM9 21v-8h6v8"/></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.pin}</svg>
}
function read<T,>(key: string, fallback: T): T { try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback } catch { return fallback } }
const initialRoom = new URLSearchParams(location.search).get('space') || 'weekend-crew'
function App() {
  const [room, setRoom] = useState(initialRoom)
  const [roomName, setRoomName] = useState(() => read(`space:${initialRoom}:name`, initialRoom === 'weekend-crew' ? '주말엔 우리끼리' : '초대받은 스페이스'))
  const [profile, setProfile] = useState(() => read('moit-profile', { name: '나', emoji: '🙂' }))
  const [modal, setModal] = useState<'profile' | 'create' | 'invite' | 'add' | 'help' | null>(initialRoom !== 'weekend-crew' && !read('moit-profile', null) ? 'profile' : null)
  const [nameInput, setNameInput] = useState(profile.name === '나' ? '' : profile.name)
  const [emoji, setEmoji] = useState(profile.emoji)
  const [newRoomName, setNewRoomName] = useState('')
  const [selected, setSelected] = useState(1)
  const [crowd, setCrowd] = useState(true)
  const [members, setMembers] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [moving, setMoving] = useState(false)
  const [myLocation, setMyLocation] = useState({ lat: 37.532, lng: 126.932 })
  const [zoom, setZoom] = useState(6)
  const [category, setCategory] = useState('전체')
  const [theme, setTheme] = useState('')
  const [mood, setMood] = useState('')
  const [route, setRoute] = useState<Course | null>(null)
  const [savedCourse, setSavedCourse] = useState<Course | null>(() => read(`space:${initialRoom}:course`, null))
  const [reports, setReports] = useState<FieldReport[]>(() => read(`space:${initialRoom}:reports`, []))
  const [query, setQuery] = useState('')
  const [quiet, setQuiet] = useState(false)
  const [tab, setTab] = useState('추천 장소')
  const [votes, setVotes] = useState<number[]>(() => read(`space:${initialRoom}:votes`, []))
  const [candidates, setCandidates] = useState<number[]>(() => read(`space:${initialRoom}:candidates`, [1, 2, 3]))
  const [confirmed, setConfirmed] = useState<number | null>(() => read(`space:${initialRoom}:confirmed`, null))
  const [toast, setToast] = useState('')
  const [mobilePanel, setMobilePanel] = useState(false)
  useEffect(() => {
    if (!modal) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setModal(null) }
    document.addEventListener('keydown', close)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', close); document.body.style.overflow = previous }
  }, [modal])
  const demo = room === 'weekend-crew'
  const place = places.find(p => p.id === selected)!
  const select = useCallback((id: number) => { setSelected(id); setRoute(null) }, [])
  const move = useCallback((lat: number, lng: number) => { setMyLocation({ lat, lng }); setMoving(false); setToast('선택한 위치로 내 핀을 옮겼어요') }, [])
  useEffect(() => { localStorage.setItem(`space:${room}:votes`, JSON.stringify(votes)); localStorage.setItem(`space:${room}:candidates`, JSON.stringify(candidates)); localStorage.setItem(`space:${room}:confirmed`, JSON.stringify(confirmed)); localStorage.setItem(`space:${room}:name`, JSON.stringify(roomName)) }, [room, votes, candidates, confirmed, roomName])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer) }, [toast])
  useEffect(() => { localStorage.setItem(`space:${room}:course`, JSON.stringify(savedCourse)); localStorage.setItem(`space:${room}:reports`, JSON.stringify(reports)) }, [room, savedCourse, reports])
  const vote = (id: number) => setVotes(v => v.includes(id) ? v.filter(i => i !== id) : [...v, id])
  const count = (p: Place) => (demo ? p.votes : 0) + (votes.includes(p.id) ? 1 : 0)
  const list = places.filter(p => (!query || `${p.name}${p.area}${p.category}`.includes(query)) && (category === '전체' || p.category === category) && (!quiet || p.crowd === '여유') && matchesTraits(p.id, theme, mood))
  const requestLocation = () => {
    if (sharing) { setSharing(false); setMoving(false); setToast('위치 공유를 중지했어요'); return }
    if (!navigator.geolocation) { setToast('이 브라우저는 위치 기능을 지원하지 않아요'); return }
    setToast('위치 권한을 허용하면 내 핀이 표시돼요')
    navigator.geolocation.getCurrentPosition(p => { setMyLocation({ lat: p.coords.latitude, lng: p.coords.longitude }); setSharing(true); setToast('이 스페이스에서 위치 공유를 켰어요') }, () => setToast('위치를 가져오지 못했어요. 브라우저의 위치 권한을 확인해 주세요.'), { timeout: 10000 })
  }
  const inviteLink = `${location.origin}${location.pathname}?space=${room}`
  const copy = async () => { try { await navigator.clipboard.writeText(inviteLink); setToast('초대 링크를 복사했어요') } catch { setToast('복사하지 못했어요. 아래 링크를 직접 복사해 주세요.') } }
  const add = (id: number) => { if (candidates.includes(id)) { setToast('이미 후보지에 있어요'); return } setCandidates(c => [...c, id]); setToast('투표 후보지에 추가했어요') }
  return <div className="app-shell">
    <nav className="rail" aria-label="주 메뉴"><a className="brand" href={location.pathname} aria-label="모잇 홈">m<span>•</span></a><div className="rail-top"><button className="rail-button active" onClick={() => { setTab('추천 장소'); setMobilePanel(false) }} aria-label="지도"><Icon name="map"/><span>지도</span></button><button className="rail-button" onClick={() => setModal('create')} aria-label="스페이스 만들기"><Icon name="plus"/><span>스페이스</span></button></div><button className="rail-button help" onClick={() => setModal('help')} aria-label="이용 안내"><Icon name="info"/></button><button className="profile-dot" onClick={() => setModal('profile')} aria-label="프로필 수정">{profile.emoji}</button></nav>
    <div className="workspace">
      <header className="topbar"><div className="breadcrumb">내 스페이스 <span>/</span> <b>{roomName}</b><span className="demo-tag">PROTOTYPE</span></div><div className="top-actions"><span className="private-label"><Icon name="people" size={15}/> 우리끼리만 보는 공간</span><button className="button invite" onClick={() => setModal('invite')}><Icon name="link" size={16}/> 초대 링크 <span className="desktop-only">공유</span></button><button className="top-avatar" onClick={() => setModal('profile')}>{profile.emoji}</button></div></header>
      <div className="workspace-body">
        <aside className={`space-panel ${mobilePanel ? 'mobile-open' : ''}`}>
          <div className="space-heading"><div className="space-symbol">✳</div><span className="eyebrow">OUR LITTLE SPACE</span><h1>{roomName}</h1><p>어디서 만날지, 함께 정해요.</p><span className="space-date"><Icon name="people" size={14}/> {demo ? '4' : '1'}명 참여 중 <i/> {demo ? '데모 스페이스' : '새 스페이스'}</span></div>
          <section className="member-section"><div className="section-heading"><h2>함께하는 멤버 <span>{demo ? 4 : 1}</span></h2><button className="text-button" onClick={() => setModal('invite')}><Icon name="plus" size={15}/> 초대</button></div><div className="member-row"><span className="avatar" style={{ background: '#e6eee8' }}>{profile.emoji}</span><div><b>{profile.name} <span className="me-tag">나</span></b><small>{sharing ? '위치 공유 중' : '위치 공유 꺼짐'}</small></div><span className={`online-dot ${sharing ? 'green' : ''}`}/></div>{demo && demoMembers.map(m => <div className="member-row" key={m.name}><span className="avatar" style={{ background: m.color }}>{m.emoji}</span><div><b>{m.name}</b><small>{m.status}</small></div><span className="online-dot green"/></div>)}<button className="add-member" onClick={() => setModal('invite')}><Icon name="plus" size={17}/> 친구와 함께하기</button></section>
          <section className="location-card"><div className="location-heading"><span><Icon name="target" size={17}/> 내 위치 공유</span><button role="switch" aria-checked={sharing} aria-label="내 위치 공유" className={`switch ${sharing ? 'on' : ''}`} onClick={requestLocation}><i/></button></div><p>동의한 위치만 이 스페이스에 표시돼요.</p>{sharing && <button className="text-button" onClick={() => { setMoving(!moving); setToast('지도에서 원하는 위치를 클릭해 주세요') }}><Icon name="pin" size={14}/> 지도에서 내 핀 조정</button>}</section>
          {savedCourse && <section className="saved-course"><span>우리의 다음 코스</span><b>{savedCourse.emoji} {savedCourse.title}</b><p>{savedCourse.stops.map(s => s.name).join(' → ')}</p><div><button onClick={() => { setSelected(Number(savedCourse.id.split('-')[0])); setRoute(savedCourse); setTab('코스'); setMobilePanel(false) }}>지도에서 보기 ↗</button><button onClick={() => { if (route?.id === savedCourse.id) setRoute(null); setSavedCourse(null) }}>빼기</button></div></section>}<div className="space-note"><span>✧</span><p>가까운 곳도 좋지만,<br/><b>함께하기 좋은 곳은 더 좋으니까.</b></p></div><div className="panel-footer"><Icon name="info" size={14}/><span>멤버 위치·혼잡도·추천은 데모 데이터입니다.</span></div>
        </aside>
        <main className="main-content"><section className="explore-heading"><div><div className="eyebrow orange">LESS PLANNING, MORE MEETING</div><h2>우리, 지금 <span>어디서 만날까?</span></h2><p>우리 취향에 맞는 만남부터, 그다음 코스까지 함께 정해요.</p></div><div className="data-status"><span/> 혼잡도 데모 데이터 <small>실시간 연동 준비 중</small></div></section>
          <div className="map-workspace"><section className="map-section" aria-label="장소 및 멤버 지도"><div className="map-toolbar"><div className="search-box"><Icon name="search" size={18}/><input aria-label="장소 검색" placeholder="어디에서 만날까요?" value={query} onChange={e => { setQuery(e.target.value); setTab('추천 장소') }}/>{query && <button aria-label="검색 지우기" onClick={() => setQuery('')}><Icon name="close" size={15}/></button>}</div><button className={`layer-button ${crowd ? 'selected' : ''}`} onClick={() => setCrowd(!crowd)} aria-pressed={crowd}><span className="layer-dot"/> 혼잡도</button><button className={`layer-button ${members ? 'selected' : ''}`} onClick={() => setMembers(!members)} aria-pressed={members}><Icon name="people" size={16}/> 멤버 위치</button></div>
            <MapView selected={selected} onSelect={select} crowd={crowd} members={members && demo} sharing={sharing} myLocation={myLocation} moving={moving} onMove={move} zoom={zoom} route={route}/>
            {route && <div className="route-map-caption"><b>{route.emoji} {route.title}</b><span>가상 코스 · 직선 동선</span><button onClick={() => setRoute(null)} aria-label="코스 동선 닫기">×</button></div>}<div className="map-top-note"><span className="pulse-dot"/> {demo ? '멤버 3명의 데모 위치를 보고 있어요' : '위치를 공유하고 모임을 시작해 보세요'}</div>
            {moving && <div className="moving-banner">지도를 클릭해 내 위치를 옮겨주세요 <button onClick={() => setMoving(false)}>취소</button></div>}
            <div className="map-controls"><button aria-label="지도 확대" onClick={() => setZoom(z => Math.max(1, z - 1))}><Icon name="plus"/></button><button aria-label="지도 축소" onClick={() => setZoom(z => Math.min(12, z + 1))}>−</button></div>
            <div className="map-legend"><b>혼잡도</b>{Object.entries(crowdColor).map(([label, color]) => <span key={label}><i style={{ background: color }}/>{label}</span>)}</div>
            <article className="selected-place"><div className="place-photo" style={{ backgroundImage: `url(${place.image})` }}><span>{place.category === '공원' ? '🌳' : place.category === '카페' ? '☕' : '🛍️'}</span></div><div className="selected-info"><span className="recommend-label"><Icon name="leaf" size={12}/> {place.crowd === '여유' ? '지금 만나기 좋은 곳' : '함께 둘러보기 좋은 곳'}</span><h3>{place.name}<span className="crowd-badge" style={{ color: crowdColor[place.crowd], background: `${crowdColor[place.crowd]}14` }}>{place.crowd}</span></h3><p>{place.area} <span>· {place.category}</span></p><div className="travel-info"><Icon name="clock" size={13}/> 멤버 평균 {place.time}분 <span>예상 · 데모</span></div></div><button className={`candidate-add ${candidates.includes(selected) ? 'added' : ''}`} onClick={() => candidates.includes(selected) ? setTab('후보지 투표') : add(selected)}><Icon name={candidates.includes(selected) ? 'check' : 'plus'} size={16}/><span>{candidates.includes(selected) ? '후보지에 담김' : '후보지 담기'}</span></button></article>
          </section>
          <aside className="places-panel"><div className="place-tabs">{['추천 장소', '현장 소식', '코스', '후보지 투표'].map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}{t === '후보지 투표' && <span>{candidates.length}</span>}</button>)}</div>
            {tab === '현장 소식' ? <FieldPanel selected={selected} onSelect={select} profile={profile} reports={[...reports, ...seedReports()]} onPost={report => { setReports(r => [report, ...r]); setToast('현장 소식을 이 브라우저에 저장했어요') }}/> : tab === '코스' ? <CoursePanel place={place} route={route} saved={savedCourse?.id ?? null} onRoute={setRoute} onSave={course => { setSavedCourse(course); setRoute(course); setToast('스페이스에 코스를 담았어요. 멤버와의 동기화는 데모예요.') }}/> : tab === '추천 장소' ? <><div className="recommend-intro"><h3>오늘은 어떤 만남인가요? <span>✧</span></h3><p>테마와 분위기까지, 우리에게 맞는 장소.</p></div><div className="category-chips">{['전체', '공원', '카페', '쇼핑'].map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div><ThemeFilters theme={theme} mood={mood} onTheme={setTheme} onMood={setMood}/><div className="list-filter"><span>추천 장소 <b>{list.length}</b></span><button className={quiet ? 'quiet-on' : ''} onClick={() => setQuiet(!quiet)}><span className={`checkbox ${quiet ? 'checked' : ''}`}>{quiet && '✓'}</span> 여유로운 곳만</button></div><div className="place-list">{list.map((p, i) => <button className={`place-card ${selected === p.id ? 'active' : ''}`} onClick={() => select(p.id)} key={p.id}><div className="place-card-image" style={{ backgroundImage: `url(${p.image})` }}>{i === 0 && <span>BEST PICK</span>}<b>{p.category === '공원' ? '🌿' : p.category === '카페' ? '☕' : '🛍️'}</b></div><div className="place-card-body"><div className="card-title"><h4>{p.name}</h4><span style={{ color: crowdColor[p.crowd] }}><i style={{ background: crowdColor[p.crowd] }}/>{p.crowd}</span></div><p>{p.category} <span>· {p.area.split(' ')[0]}</span></p><div className="trait-tags">{[...placeTraits[p.id].themes.slice(0, 2), ...placeTraits[p.id].moods.slice(0, 1)].map(t => <span key={t}>#{t}</span>)}</div><div className="card-meta"><span><Icon name="clock" size={12}/> 평균 {p.time}분</span><span><Icon name="vote" size={13}/>{count(p)}명 관심</span></div></div></button>)}{!list.length && <div className="empty-state"><Icon name="search" size={30}/><b>조건에 맞는 장소가 없어요</b><p>검색어나 필터를 바꿔보세요.</p><button className="text-button" onClick={() => { setQuery(''); setQuiet(false); setCategory('전체'); setTheme(''); setMood('') }}>필터 초기화</button></div>}</div><div className="recommend-foot"><button onClick={() => setTab('현장 소식')}>현장 소식 확인 ↗</button><button onClick={() => setTab('코스')}>만난 다음 코스 보기 →</button></div></> : <><div className="recommend-intro"><h3>마음에 드는 곳에 한 표!</h3><p>여러 장소에 투표할 수 있어요.</p></div><div className="vote-list">{candidates.map(id => { const p = places.find(p => p.id === id)!; const total = count(p); return <article className={`vote-card ${votes.includes(id) ? 'voted' : ''}`} key={id}><div className="vote-card-heading"><button onClick={() => select(id)}>{p.name}</button><span className="crowd-badge" style={{ color: crowdColor[p.crowd] }}>{p.crowd}</span></div><small>{p.category} · 평균 {p.time}분</small><div className="vote-track"><i style={{ width: `${Math.min(100, total / (demo ? 4 : 1) * 100)}%` }}/></div><div className="vote-bottom"><span>{total}명 투표</span><button onClick={() => vote(id)} className={votes.includes(id) ? 'voted-button' : ''}><Icon name={votes.includes(id) ? 'check' : 'plus'} size={14}/>{votes.includes(id) ? '투표 완료' : '투표하기'}</button></div></article> })}<button className="add-member" onClick={() => setModal('add')}><Icon name="plus" size={16}/> 후보지 추가하기</button></div><div className="vote-summary">{confirmed ? <><span>🎉 만날 곳이 정해졌어요!</span><b>{places.find(p => p.id === confirmed)?.name}</b><button className="text-button" onClick={() => setConfirmed(null)}>다시 정하기</button></> : <><p>투표 결과를 보고 만날 곳을 정해요.</p><button className="button primary" disabled={!candidates.length} onClick={() => { const winner = [...candidates].sort((a, b) => count(places.find(p => p.id === b)!) - count(places.find(p => p.id === a)!))[0]; setConfirmed(winner); setToast('가장 많은 표를 받은 장소로 확정했어요. 동률이면 먼저 등록한 장소를 선택해요.') }}>최다 득표 장소로 확정<Icon name="arrow" size={16}/></button></>}</div></>}
          </aside></div>
          <div className="bottom-note"><span><span className="mini-brand">moit</span> 함께 모이는 가장 가벼운 방법</span><button onClick={() => setModal('help')}>모잇이 처음이라면 <Icon name="arrow" size={13}/></button></div>
        </main>
      </div>
      <nav className="mobile-nav"><button onClick={() => setMobilePanel(!mobilePanel)}><Icon name="people" size={18}/> 스페이스</button><button onClick={() => { setMobilePanel(false); setTab('추천 장소') }}><Icon name="map" size={18}/> 지도·추천</button><button onClick={() => { setMobilePanel(false); setTab('후보지 투표') }}><Icon name="vote" size={18}/> 투표</button></nav>
    </div>
    {toast && <div className="toast" role="status"><Icon name="check" size={17}/>{toast}</div>}
    {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={e => e.stopPropagation()}><button className="modal-close" aria-label="닫기" onClick={() => setModal(null)}><Icon name="close"/></button>
      {modal === 'profile' && <form onSubmit={e => { e.preventDefault(); const next = { name: nameInput.trim(), emoji }; if (!next.name) return; setProfile(next); localStorage.setItem('moit-profile', JSON.stringify(next)); setModal(null); setToast('프로필을 저장했어요. 반가워요!') }}><span className="modal-illustration">{emoji}</span><h2 id="modal-title">어떤 모습으로 만날까요?</h2><p>가입 없이, 이름과 아바타만 있으면 충분해요.</p><div className="emoji-picker">{['🙂', '🐻', '🐰', '🐱', '🦊', '🐼'].map(em => <button type="button" key={em} className={emoji === em ? 'active' : ''} onClick={() => setEmoji(em)}>{em}</button>)}</div><label>이름<input autoFocus value={nameInput} onChange={e => setNameInput(e.target.value)} maxLength={12} placeholder="친구들이 부를 이름" required/></label><button className="button primary full">프로필 저장하고 시작하기<Icon name="arrow" size={17}/></button></form>}
      {modal === 'create' && <form onSubmit={e => { e.preventDefault(); if (!newRoomName.trim()) return; const id = crypto.randomUUID().slice(0, 8); const title = newRoomName.trim(); localStorage.setItem(`space:${id}:name`, JSON.stringify(title)); setRoom(id); setRoomName(title); setVotes([]); setCandidates([]); setConfirmed(null); setSavedCourse(null); setReports([]); setRoute(null); setSharing(false); history.pushState({}, '', `?space=${id}`); setModal('invite') }}><span className="modal-illustration">✳</span><h2 id="modal-title">우리만의 스페이스 만들기</h2><p>이름을 정하고, 함께 만날 친구들을 초대하세요.</p><label>스페이스 이름<input autoFocus placeholder="예: 1110 보드게임 모이는 날" value={newRoomName} maxLength={30} required onChange={e => setNewRoomName(e.target.value)}/></label><button className="button primary full">스페이스 만들기<Icon name="arrow" size={17}/></button></form>}
      {modal === 'invite' && <><span className="modal-illustration">💌</span><h2 id="modal-title">좋은 만남은 초대부터</h2><p>이 링크로 가입 없이 스페이스에 들어올 수 있어요.</p><div className="invite-room"><span>✳</span><div><b>{roomName}</b><small>우리끼리 장소를 정하는 공간</small></div></div><label>초대 링크<input readOnly value={inviteLink} onFocus={e => e.target.select()}/></label><button className="button primary full" onClick={copy}><Icon name="link" size={17}/> 초대 링크 복사</button><div className="modal-notice">로컬 프로토타입으로, 다른 기기의 멤버·위치·투표는 동기화되지 않아요.</div></>}
      {modal === 'add' && <><h2 id="modal-title">모임 후보지 추가</h2><p>함께 가고 싶은 장소를 골라주세요.</p><div className="add-place-list">{places.map(p => <button disabled={candidates.includes(p.id)} key={p.id} onClick={() => { add(p.id); setModal(null) }}><span><b>{p.name}</b><small>{p.category} · {p.crowd}</small></span><Icon name={candidates.includes(p.id) ? 'check' : 'plus'}/></button>)}</div></>}
      {modal === 'help' && <><span className="modal-illustration">👋</span><h2 id="modal-title">우리, 모잇에서 만나요</h2><p>모일 곳을 정하는 순간을 조금 더 가볍게.</p><ol className="help-steps"><li><b>스페이스 만들고 링크 공유</b><span>회원가입 없이 이름과 아바타로 참여해요.</span></li><li><b>위치 공유는 동의한 뒤에</b><span>공유를 켜거나 끄고, 지도에서 내 핀을 조정해요.</span></li><li><b>여유로운 곳을 함께 찾아요</b><span>혼잡도와 추천 장소를 보고 후보지를 담아요.</span></li><li><b>현장 소식과 다음 코스도 함께</b><span>방문 팁을 남기고 식사·카페·팝업까지 이어지는 코스를 담아요.</span></li><li><b>투표하고, 이제 만나요</b><span>마음에 드는 곳에 투표하고 장소를 확정해요.</span></li></ol><div className="modal-notice">카카오맵 기반 프로토타입입니다. 혼잡도·멤버·이동 시간은 더미 데이터이며, 변경 내용은 현재 브라우저에만 저장됩니다. 서울 실시간 도시데이터 및 실시간 위치 서버는 연결되지 않았습니다.</div><button className="button primary full" onClick={() => setModal(null)}>좋아요, 시작할게요</button></>}
    </section></div>}
  </div>
}
export default App
