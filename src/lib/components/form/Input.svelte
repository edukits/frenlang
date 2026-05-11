<script>
	let { type, name, value = $bindable(null), placeholder = null, required = false } = $props();
</script>

<input
	{type}
	{name}
	{required}
	bind:value
	{placeholder}
	class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-sky-500 focus:ring-3 focus:ring-sky-500/20 focus:outline-hidden"
/>
