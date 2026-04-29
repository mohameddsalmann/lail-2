/**
 * Note Category System
 *
 * Groups fragrance notes into families/categories for broader affinity matching.
 * Used when direct note matching is weak but the user and perfume share
 * the same note families (e.g., both are "tropical" or "sweet gourmand").
 */

export const NOTE_CATEGORIES: Record<string, string[]> = {
  FRESH_CITRUS: ["bergamot", "lemon", "citron", "grapefruit", "orange", "neroli", "lime", "mandarin", "yuzu"],
  TROPICAL: ["mango", "pineapple", "coconut", "litchi", "tropical fruits", "apricot", "passionfruit", "papaya", "guava"],
  SWEET_GOURMAND: ["vanilla", "vanilla caviar", "caramel", "marshmallow", "sugar", "honey", "whipped cream", "cacao", "chocolate", "praline", "toffee"],
  GREEN: ["mint", "green notes", "green apple", "fig", "oakmoss", "geranium", "basil", "tea", "chinese tea", "matcha"],
  WARM_SPICY: ["ginger", "pepper", "incense", "juniper berries", "brandy", "rum", "white rum", "cinnamon", "cardamom", "saffron", "nutmeg", "clove"],
  MUSKY_AMBER: ["musk", "amber", "ambroxan", "tonka beans", "wood notes", "woods", "sandalwood", "cedarwood", "vetiver", "patchouli", "oud"],
  FLORAL: ["lavender", "orange blossom", "turkish rose", "rose", "iris", "jasmine", "peony", "lily", "gardenia", "tuberose", "neroli"],
  AQUATIC: ["marine notes", "water notes", "beach notes", "sea salt", "oceanic", "rain", "aquatic"],
  FRUITY: ["berries", "strawberries", "black currant", "pear", "apple", "peach", "raspberry", "cherry", "plum"],
};

export type NoteCategory = keyof typeof NOTE_CATEGORIES;

/**
 * Determine which category a single note belongs to.
 * Uses substring matching for robustness (e.g., "bourbon vanilla" contains "vanilla").
 */
export function getNoteCategory(note: string): NoteCategory | null {
  const normalized = note.toLowerCase().trim();
  for (const [category, notes] of Object.entries(NOTE_CATEGORIES)) {
    if (notes.some(n => normalized.includes(n) || n.includes(normalized))) {
      return category as NoteCategory;
    }
  }
  return null;
}

/**
 * Get all note categories represented in a list of user-selected notes.
 */
export function getUserCategories(userNotes: string[]): Set<NoteCategory> {
  const categories = new Set<NoteCategory>();
  for (const note of userNotes) {
    const cat = getNoteCategory(note);
    if (cat) categories.add(cat);
  }
  return categories;
}

/**
 * Get all note categories represented in a perfume's note list.
 */
export function getPerfumeCategories(perfumeNotes: string[]): Set<NoteCategory> {
  const categories = new Set<NoteCategory>();
  for (const note of perfumeNotes) {
    const cat = getNoteCategory(note);
    if (cat) categories.add(cat);
  }
  return categories;
}

/**
 * Compute the intersection of two sets.
 */
export function setIntersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  const result = new Set<T>();
  for (const item of a) {
    if (b.has(item)) result.add(item);
  }
  return result;
}

/**
 * Human-readable names for note categories (for match reasons).
 */
export const CATEGORY_DISPLAY_NAMES: Record<NoteCategory, string> = {
  FRESH_CITRUS: "fresh citrus",
  TROPICAL: "tropical",
  SWEET_GOURMAND: "sweet & gourmand",
  GREEN: "fresh green",
  WARM_SPICY: "warm & spicy",
  MUSKY_AMBER: "musky & woody",
  FLORAL: "floral",
  AQUATIC: "aquatic & fresh",
  FRUITY: "fruity",
};
