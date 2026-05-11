<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SearchableCombobox from './SearchableCombobox.svelte';

	const { Story } = defineMeta({
		title: 'SearchableCombobox',
		component: SearchableCombobox,
		args: {
			total: 5,
			current: 3,
			selectedItems: [],
			fetchItems: async () => {
				return [
					{ id: 1, name: 'Item 1', description: 'The first item' },
					{ id: 2, name: 'Item 2', description: 'The second item' },
					{ id: 3, name: 'Item 3', description: 'The third item' },
					{ id: 4, name: 'Item 4', description: 'The fourth item' },
					{ id: 5, name: 'Item 5', description: 'The fifth item' }
				];
			}
		}
	});
</script>

<Story name="Default" />
