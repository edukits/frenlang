/**
 * Map of word type strings to values.
 * @type {Object<string, string>}
 */
export const wordTypes = {
	noun: 'Noun',
	verb: 'Verb',
	adjective: 'Adjective',
	adverb: 'Adverb',
	pronoun: 'Pronoun',
	determiner: 'Determiner',
	preposition: 'Preposition',
	conjunction: 'Conjunction',
	interjection: 'Interjection'
};

/**
 * Masculine articles.
 * @type {Array<string>}
 */
export const masculineArticles = ['le', 'un', 'du'];

/**
 * Feminine articles.
 * @type {Array<string>}
 */
export const feminineArticles = ['la', 'une', 'de la'];

/**
 * Plural articles.
 * @type {Array<string>}
 */
export const pluralArticles = ['les', 'des'];

/**
 * Combined and sorted list of articles by length (longest first).
 * @type {Array<string>}
 */
const allArticles = [...masculineArticles, ...feminineArticles, ...pluralArticles].sort(
	(a, b) => b.length - a.length
); // Sort by length, longest first

/**
 * Remove any articles from the word (French).
 * @param {string} str
 * @returns {string}
 */
export function removeArticleFr(str) {
	const strClean = str.trim();
	const loweredStr = strClean.toLowerCase() + ' ';

	for (const article of allArticles) {
		const articleWithSpace = article + ' ';
		if (loweredStr.startsWith(articleWithSpace)) {
			return strClean.substring(article.length).trim();
		}
	}

	// "l'" as a special case for words starting with a vowel or silent 'h'.
	if (loweredStr.startsWith("l'")) {
		return strClean.substring(2).trim();
	}

	return strClean.replace(/\s+/, ' '); // Remove any extra whitespace
}
