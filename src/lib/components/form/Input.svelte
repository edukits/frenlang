<script>
	let { type, name, value = $bindable(null), placeholder = null, required = false } = $props();
</script>

<input {type} {name} {required} bind:value {placeholder} class="w-full" />
