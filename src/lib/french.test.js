import { expect, test } from 'vitest';
import { removeArticleFr } from '$lib/french.js';

// Simple cases with single articles
test('remove masculine article "le"', () => {
	expect(removeArticleFr('le chat')).toBe('chat');
});

test('remove masculine article "un"', () => {
	expect(removeArticleFr('un chien')).toBe('chien');
});

test('remove feminine article "la"', () => {
	expect(removeArticleFr('la table')).toBe('table');
});

test('remove feminine article "une"', () => {
	expect(removeArticleFr('une baguette')).toBe('baguette');
});

test('remove plural article "les"', () => {
	expect(removeArticleFr('les enfants')).toBe('enfants');
});

test('remove plural article "des"', () => {
	expect(removeArticleFr('des livres')).toBe('livres');
});

// Cases with multi-word articles
test('remove feminine article "de la"', () => {
	expect(removeArticleFr('de la musique')).toBe('musique');
});

// Cases with "l'" contraction
test('remove article "l\'" before a vowel', () => {
	expect(removeArticleFr("l'ami")).toBe('ami');
	expect(removeArticleFr("l'arbre")).toBe('arbre');
});

// Mixed-case input
test('remove article from mixed-case input', () => {
	expect(removeArticleFr('Le Chat')).toBe('Chat');
	expect(removeArticleFr('Un Chien')).toBe('Chien');
	expect(removeArticleFr('La Table')).toBe('Table');
	expect(removeArticleFr('Une Baguette')).toBe('Baguette');
	expect(removeArticleFr("L'Ami")).toBe('Ami');
});

// Cases where no article should be removed
test('no article to remove', () => {
	expect(removeArticleFr('chat')).toBe('chat');
	expect(removeArticleFr('une baguette magique')).toBe('baguette magique'); // Testing case where "un" should not be removed
	expect(removeArticleFr('lemon')).toBe('lemon'); // "lemon" should not match "le"
});

// Cases with punctuation
test('remove article with punctuation directly after', () => {
	expect(removeArticleFr('le chat, mange.')).toBe('chat, mange.');
	expect(removeArticleFr('un chien!')).toBe('chien!');
	expect(removeArticleFr('la table.')).toBe('table.');
	expect(removeArticleFr("une baguette, s'il vous plaît")).toBe("baguette, s'il vous plaît");
});

// Edge cases with hyphenated words
test('remove article with hyphenated word', () => {
	expect(removeArticleFr("l'école-buissonnière")).toBe('école-buissonnière');
	expect(removeArticleFr('la mi-temps')).toBe('mi-temps');
});

// Edge case with compound words
test('do not remove article from compound words', () => {
	expect(removeArticleFr('unité')).toBe('unité'); // "un" should not be removed from "unité"
	expect(removeArticleFr('Les Misérables')).toBe('Misérables'); // Proper noun handling
});

// Edge case with extra spaces
test('remove article with extra spaces', () => {
	expect(removeArticleFr('  le   chat')).toBe('chat');
	expect(removeArticleFr('un    chien')).toBe('chien');
});
