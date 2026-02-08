/**
 * Tests unitaires pour createSlug()
 *
 * Pour exécuter ces tests, installer vitest:
 * pnpm add -D vitest
 *
 * Puis ajouter dans package.json:
 * "scripts": {
 *   "test": "vitest"
 * }
 */

import { describe, it, expect } from 'vitest'
import { createSlug } from './strings'

describe('createSlug', () => {
  describe('basic text', () => {
    it('should convert to lowercase and replace spaces with hyphens', () => {
      expect(createSlug('Hello World')).toBe('hello-world')
    })

    it('should trim whitespace', () => {
      expect(createSlug('  test  ')).toBe('test')
    })
  })

  describe('French accented characters', () => {
    it('should remove accents from vowels', () => {
      expect(createSlug('École primaire')).toBe('ecole-primaire')
      expect(createSlug('Élève français')).toBe('eleve-francais')
      expect(createSlug('Théâtre')).toBe('theatre')
      expect(createSlug('Être')).toBe('etre')
    })

    it('should handle various accent types', () => {
      expect(createSlug('àâäéèêëïîôùûüÿ')).toBe('aaaeeeeiioouuuy')
    })
  })

  describe('special French characters', () => {
    it('should convert œ to oe', () => {
      expect(createSlug('Œuvre')).toBe('oeuvre')
      expect(createSlug('cœur')).toBe('coeur')
    })

    it('should convert æ to ae', () => {
      expect(createSlug('Cæsar')).toBe('caesar')
    })

    it('should convert ç to c', () => {
      expect(createSlug('Garçon')).toBe('garcon')
      expect(createSlug('Français')).toBe('francais')
    })
  })

  describe('punctuation and special characters', () => {
    it('should handle apostrophes', () => {
      expect(createSlug("L'enfant")).toBe('lenfant')
      expect(createSlug("aujourd'hui")).toBe('aujourdhui')
    })

    it('should handle hyphens correctly', () => {
      expect(createSlug('Jean-Paul')).toBe('jean-paul')
      expect(createSlug('Marie-Thérèse')).toBe('marie-therese')
    })

    it('should remove numbers preceded by #', () => {
      expect(createSlug('Test #1')).toBe('test-1')
    })

    it('should handle underscores', () => {
      expect(createSlug('test_case')).toBe('test-case')
    })

    it('should handle various quote types', () => {
      expect(createSlug('test "quote"')).toBe('test-quote')
      expect(createSlug("test 'quote'")).toBe('test-quote')
      expect(createSlug('test `quote`')).toBe('test-quote')
    })
  })

  describe('firstname + name for persons', () => {
    it('should concatenate firstname and name with hyphen', () => {
      expect(createSlug('Dupont', 'Marie')).toBe('marie-dupont')
    })

    it('should handle accented first and last names', () => {
      expect(createSlug('Müller', 'François')).toBe('francois-muller')
    })

    it('should handle special characters in both names', () => {
      expect(createSlug("O'Connor", 'Seán')).toBe('sean-oconnor')
    })
  })

  describe('hyphen handling', () => {
    it('should collapse multiple hyphens', () => {
      expect(createSlug('Test -- Multiple')).toBe('test-multiple')
      expect(createSlug('Test---Multiple')).toBe('test-multiple')
    })

    it('should remove leading hyphens', () => {
      expect(createSlug('-Test')).toBe('test')
      expect(createSlug('--Test')).toBe('test')
    })

    it('should remove trailing hyphens', () => {
      expect(createSlug('Test-')).toBe('test')
      expect(createSlug('Test--')).toBe('test')
    })

    it('should remove leading and trailing hyphens', () => {
      expect(createSlug('-Test-')).toBe('test')
    })
  })

  describe('edge cases', () => {
    it('should return "untitled" for empty string', () => {
      expect(createSlug('')).toBe('untitled')
    })

    it('should return "untitled" for whitespace only', () => {
      expect(createSlug('   ')).toBe('untitled')
    })

    it('should return "untitled" for special characters only', () => {
      expect(createSlug('!!!!')).toBe('untitled')
      expect(createSlug('###')).toBe('untitled')
      expect(createSlug('@@@')).toBe('untitled')
    })

    it('should handle single character names', () => {
      expect(createSlug('A')).toBe('a')
      expect(createSlug('X')).toBe('x')
    })

    it('should handle very long names', () => {
      const longName = 'A'.repeat(100)
      const slug = createSlug(longName)
      expect(slug).toBe('a'.repeat(100))
      expect(slug.length).toBe(100)
    })

    it('should handle mixed scripts', () => {
      expect(createSlug('Test 日本')).toBe('test')
      expect(createSlug('😀 Test')).toBe('test')
    })
  })

  describe('only valid characters', () => {
    it('should only contain lowercase letters, numbers, and hyphens', () => {
      const testCases = [
        'École Française',
        "L'enfant #1",
        'Test@Example.com',
        'Marie-Thérèse & Paul',
      ]

      testCases.forEach(testCase => {
        const slug = createSlug(testCase)
        expect(slug).toMatch(/^[a-z0-9-]+$/)
      })
    })
  })

  describe('idempotence', () => {
    it('should be idempotent - applying createSlug twice should give same result', () => {
      const name = 'École Française'
      const slug1 = createSlug(name)
      const slug2 = createSlug(slug1)
      expect(slug1).toBe(slug2)
    })

    it('should be idempotent with firstname', () => {
      const slug1 = createSlug('Müller', 'François')
      const slug2 = createSlug(slug1)
      expect(slug1).toBe(slug2)
    })
  })

  describe('consistency', () => {
    it('should produce consistent results for same input', () => {
      const name = 'École primaire'
      const slug1 = createSlug(name)
      const slug2 = createSlug(name)
      const slug3 = createSlug(name)
      expect(slug1).toBe(slug2)
      expect(slug2).toBe(slug3)
    })
  })
})
