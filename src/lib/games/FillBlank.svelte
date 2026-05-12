<script>
	import Typing from './Typing.svelte';

	/** @type {{ exercise: any, onAnswer?: (result: { correct: boolean, quality: number }) => void }} */
	let { exercise, onAnswer } = $props();

	let preparedExercise = $derived({
		...exercise,
		item: {
			...exercise.item,
			prompt: exercise.item.prompt.includes('____')
				? exercise.item.prompt
				: exercise.item.prompt.replace(/\{blank\}/gi, '____')
		}
	});
</script>

<Typing exercise={preparedExercise} {onAnswer} />
