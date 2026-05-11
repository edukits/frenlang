<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProgressDots from './ProgressDots.svelte';

	const { Story } = defineMeta({
		title: 'ProgressDots',
		component: ProgressDots,
		args: {
			total: 5,
			current: 3
		}
	});
</script>

<Story name="Default" />
