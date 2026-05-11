<script>
	import Matching from '$lib/components/Matching.svelte';
	let { data } = $props();
	let {
		list: { vocabulary }
	} = $derived(data);

	/** @type {{ en: string, fr: string }[]} */
	let words = $derived(
		vocabulary.map(({ word, translation }) => ({
			en: word,
			fr: translation
		}))
	);
</script>

<div class="mx-auto max-w-[600px]">
	<Matching sourceWords={words} />
</div>
