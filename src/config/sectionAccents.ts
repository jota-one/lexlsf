/**
 * Colour code of the public sections: the lexicon is blue — the colour of the
 * Deaf — Culture is pink and the tools are yellow. All three come from the logo
 * palette.
 *
 * The classes are spelled out rather than built from the section name so
 * Tailwind can find them in the source.
 */
export const SECTION_ACCENTS = {
  lexique: {
    cardHover: 'hover:bg-primary hover:text-primary-content',
  },
  culture: {
    cardHover: 'hover:bg-secondary hover:text-secondary-content',
  },
  outils: {
    cardHover: 'hover:bg-logo-yellow hover:text-neutral',
  },
} as const

export type TSection = keyof typeof SECTION_ACCENTS
