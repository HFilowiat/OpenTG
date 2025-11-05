<script lang="ts">
	export let checked = true;
	export let disabled = true;
</script>

<input type="checkbox" />
<input type="checkbox" {checked} />
<input type="checkbox" disabled />
<input type="checkbox" {checked} {disabled} />

<style>
	:where(input) {
		--_highlight-dark: hsl(210 10% 5% / 25%);
		--_highlight: var(--_highlight-dark);
		--_text: #222;

		--_highlight-size: 0rem;
		--_bg-dark: rgb(199, 201, 203);
		--_bg: var(--_bg-dark);

		--_transition-motion-reduce: ;
		--_transition-motion-ok: box-shadow 145ms ease, outline-offset 145ms ease;
		--_transition: var(--_transition-motion-reduce);

		--_border-dark: var(--_bg-dark);
		--_border: var(--_border-dark);
	}

	@media (prefers-reduced-motion: no-preference) {
		:where(input) {
			--_transition: var(--_transition-motion-ok);
		}
	}

	input[type='checkbox'] {
		position: relative;
		cursor: pointer;
		font-size: larger;

		width: 1.2em;
		height: 1.2em;
		appearance: none;
		margin: 0;
		border: 2px solid var(--_border);
		border-radius: 5px;

		box-shadow: 0 0 0 var(--_highlight-size) var(--_highlight);
		transition: var(--_transition);

		touch-action: manipulation;
	}

	input:where(:not([disabled])):checked {
		background-color: #4af;
		border-color: #4af;
	}

	input[type='checkbox']:checked::before {
		content: '';
		display: block;
		width: 0.2em;
		height: 0.5em;
		border: solid #fff;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
		position: absolute;
		top: 0.125em;
		left: 0.375em;
	}

	:where(input):where(:not(:active)):focus-visible {
		outline: 2px solid #fff;
		outline-offset: 5px;
	}

	:where(input):where(:not(:active):not([disabled])):hover {
		--_highlight-size: 0.5rem;
	}

	input:disabled {
		background-color: var(--_bg-dark);
		cursor: not-allowed;
	}
</style>
