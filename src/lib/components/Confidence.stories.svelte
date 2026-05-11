<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Confidence from './Confidence.svelte';

	const { Story } = defineMeta({
		title: 'Confidence',
		component: Confidence
	});
</script>

<Story name="Default" />
