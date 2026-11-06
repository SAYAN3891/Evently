import { describe, expect, it } from 'vitest'
import { categories, events } from './events'

describe('event catalog', () => {
  it('uses unique event identifiers and photography', () => {
    expect(new Set(events.map((event) => event.id)).size).toBe(events.length)
    expect(new Set(events.map((event) => event.image)).size).toBe(events.length)
  })

  it('provides complete event details and valid dates', () => {
    for (const event of events) {
      expect(event.title).toBeTruthy()
      expect(event.category).toBeTruthy()
      expect(event.description).toBeTruthy()
      expect(event.venue).toBeTruthy()
      expect(event.organizer).toBeTruthy()
      expect(Number.isNaN(new Date(event.date).getTime())).toBe(false)
    }
  })

  it('offers a filter category for every event', () => {
    const categoryNames = new Set(categories.map((category) => category.name))
    for (const event of events) {
      expect(categoryNames.has(event.category)).toBe(true)
    }
  })
})
