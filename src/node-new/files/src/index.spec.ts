import { main } from './index'

describe('index', () => {
  describe('main', () => {
    it('works', () => {
      expect(main()).toBe('hello from <%= name %>')
    })
  })
})
