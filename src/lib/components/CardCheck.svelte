<script lang="ts">
	export let checked: boolean = false;
	export let disabled: boolean = false;

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	$: {
		if (checked) {
			dispatch('enable');
		} else {
			dispatch('disable');
		}
	}
</script>

<button class="card" class:checked class:disabled on:click={() => (checked = !checked)} {disabled}>
	<slot />

	{#if checked}
		<div class="checkmark" />
	{/if}
</button>

<style>
	.card {
		border: 2px solid var(--border-color-default);
		background-color: var(--secondary-background-color);
		border-radius: 8px;
		display: flex;
		padding: 0;
		overflow: hidden;
		justify-content: flex-start;

		position: relative;
		flex-direction: column;
		align-items: flex-start;
	}

	.checked {
		background-color: var(--button-color-background-primary-alpha);
		color: var(--button-color-background-primary);
		border-color: var(--button-color-background-primary);
	}

	.disabled {
		cursor: not-allowed;
		filter: saturate(0) brightness(0.8);
	}

	.checkmark {
		display: inline-block;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid var(--border-color-background-primary);
		background-color: var(--button-color-background-primary);

		position: absolute;
		right: 0.5em;
		bottom: 0.5em;
	}

	.checkmark::before {
		content: '';
		display: block;

		transform: rotate(45deg);
		height: 10px;
		width: 5px;
		margin-left: 33%;
		margin-top: 16%;
		border-bottom: 2px solid var(--border-color-default);
		border-right: 2px solid var(--border-color-default);
		border-color: #fff;
	}
</style>
