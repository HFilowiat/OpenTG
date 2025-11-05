<script>
	export let checked = false;
	export let disabled = false;

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

<label class="switch" class:disabled>
	<input type="checkbox" bind:checked {disabled} />
	<span class="slider round" />
</label>

<style>
	.switch {
		position: relative;
		display: inline-block;
		width: 32px;
		height: 16px;
	}

	.switch input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: var(--switch-background);
		transition: 0.4s;
	}

	.switch.disabled .slider {
		background-color: var(--switch-background-disabled);
		cursor: not-allowed;
	}

	.slider:before {
		position: absolute;
		content: '';
		height: 16px;
		width: 16px;
		left: 0px;
		bottom: 0px;
		background-color: var(--switch-circle-background);
		transition: 0.4s;
	}

	.switch.disabled .slider::before {
		background-color: var(--switch-circle-background-disabled);
	}

	input:checked + .slider::before {
		background-color: var(--switch-circle-on);
	}

	input:checked + .slider:before {
		transform: translateX(16px);
	}

	.slider.round {
		border-radius: 34px;
	}

	.slider.round:before {
		border-radius: 50%;
	}
</style>
