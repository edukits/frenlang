<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Flashcard from './Flashcard.svelte';

	const { Story } = defineMeta({
		title: 'Flashcard',
		component: Flashcard
	});
</script>

<Story name="Default" args={{}}>
	{#snippet template(args)}
		<Flashcard {...args} confidence={args.confidence}>
			{#snippet front()}
				<div>I'm tired.</div>
			{/snippet}
			{#snippet back()}
				<div>Je suis fatigue.</div>
			{/snippet}
		</Flashcard>
	{/snippet}
</Story>
