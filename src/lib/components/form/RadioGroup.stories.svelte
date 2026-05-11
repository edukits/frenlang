<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RadioGroup from './RadioGroup.svelte';

	const { Story } = defineMeta({
		title: 'RadioGroup',
		component: RadioGroup,
		args: {
			options: [
				{ value: 'option1', label: 'Option one' },
				{ value: 'option2', label: 'Option two' },
				{ value: 'option3', label: 'Option three' }
			]
		}
	});
</script>

<Story name="Default" />
