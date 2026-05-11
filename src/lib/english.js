/**
 * English articles.
 */
export const articles = ['a', 'an', 'the'];

/**
 * Remove any articles from the word (English).
 * @param {string} str
 * @returns {string}
 */
export function removeArticleEn(str) {
	const words = str.split(' ');
	const firstWord = words[0].toLowerCase();

	if (articles.includes(firstWord)) {
		words.shift();
	}

	return words.join(' ');
}
