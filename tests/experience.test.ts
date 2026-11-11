import test from 'node:test'
import assert from 'node:assert/strict'
import { matchesTraits, coursesFor, seedReports, totalCourseMinutes } from '../src/experience.ts'
import { places } from '../src/data.ts'

test('theme and mood must both match, with optional filters', () => {
  assert.equal(matchesTraits(1, '혼자', ''), false)
  assert.equal(matchesTraits(1, '아이와', '야외'), true)
  assert.equal(matchesTraits(2, '아이와', '실내'), false)
  assert.equal(matchesTraits(3, '', '조용한'), true)
  assert.equal(matchesTraits(3, '친구와', '활기찬'), false)
  assert.equal(places.filter(p => matchesTraits(p.id, '', '')).length, places.length)
})
test('course budget includes time at the meeting point, walks, waits and visits', () => {
  const courses = coursesFor(places[0])
  assert.deepEqual(courses.map(totalCourseMinutes), [140, 169, 198])
  assert.equal(courses[0].stops.reduce((n, s) => n + s.wait, 0), 5)
  assert.equal(courses[0].stops.reduce((n, s) => n + s.walk, 0), 10)
})
test('every course starts at its selected meeting place and has distinct stable IDs', () => {
  const ids = new Set<string>()
  for (const p of places) for (const c of coursesFor(p)) {
    assert.equal(ids.has(c.id), false); ids.add(c.id)
    assert.equal(c.stops[0].name, p.name)
    assert.equal(c.stops[0].lat, p.lat)
    assert.equal(c.stops[0].lng, p.lng)
    for (const s of c.stops) assert.ok(s.stay >= 0 && s.walk >= 0 && s.wait >= 0)
  }
  assert.equal(ids.size, 15)
})
test('seed field reports identify samples and reference valid places', () => {
  for (const r of seedReports()) {
    assert.equal(r.demo, true)
    assert.equal(r.created, 0)
    assert.ok(places.some(p => p.id === r.placeId))
    assert.ok(r.wait === null || r.wait >= 0)
  }
})
