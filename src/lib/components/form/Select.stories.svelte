<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Select from './Select.svelte';

	const { Story } = defineMeta({
		title: 'Select',
		component: Select,
		args: {
			options: [
				{ value: 'noun', label: 'Noun' },
				{ value: 'verb', label: 'Verb' },
				{ value: 'adjective', label: 'Adjective' },
				{ value: 'adverb', label: 'Adverb' },
				{ value: 'pronoun', label: 'Pronoun' },
				{ value: 'determiner', label: 'Determiner' },
				{ value: 'preposition', label: 'Preposition' },
				{ value: 'conjunction', label: 'Conjunction' },
				{ value: 'interjection', label: 'Interjection' }
			]
		}
	});
</script>

<Story name="Default" />
