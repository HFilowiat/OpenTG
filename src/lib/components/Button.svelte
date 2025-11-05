<script lang="ts">
	export let disabled: boolean = false;
	export let variant: 'secondary' | 'primary' | 'normal' | 'danger' | 'warning' = 'normal';
	export let grow: boolean = false;
</script>

<button on:click class={variant} class:grow {disabled}>
	<slot></slot>
</button>

<style>
	:where(button) {
		--_highlight-light: hsla(0, 0%, 83%, 0.25);
		--_highlight-dark: rgba(219, 219, 219, 0.25);
		--_highlight: var(--_highlight-dark);

		--_text-dark: #fff;
		--_text-light: #000;
		--_text: var(--_text-dark);

		--_highlight-size: 0rem;

		--_bg-dark: var(--secondary-background-color);
		--_bg-light: rgb(255, 255, 255);
		--_bg: var(--_bg-dark);

		--_transition-motion-reduce: ;
		--_transition-motion-ok: box-shadow 145ms ease, outline-offset 145ms ease;
		--_transition: var(--_transition-motion-reduce);

		--_border-dark: #35393d;
		--_border-light: hsl(0, 0%, 91%);
		--_border: var(--_border-dark);

		--_outline-dark: #fff;
		--_outline-light: #000;
		--_outline: var(--_outline-dark);
	}

	@media (prefers-reduced-motion: no-preference) {
		:where(button) {
			--_transition: var(--_transition-motion-ok);
		}
	}

	.grow {
		flex: 1;
		width: 100%;
	}

	.danger {
		--_border-light: hsl(0 100% 83%);
		--_highlight-light: hsl(0 100% 89% / 20%);
		--_text-light: rgb(0, 0, 0);
		--_bg-light: var(--_highlight-light);

		--_border-dark: hsl(0 100% 83%);
		--_highlight-dark: hsl(0 100% 89% / 20%);
		--_text-dark: hsl(0 100% 83%);
		--_bg-dark: var(--_highlight-dark);
	}

	.primary {
		--_border-light: hsl(215, 80%, 63%);
		--_highlight-light: hsla(215, 80%, 63%, 0.249);
		--_text-light: rgb(0, 0, 0);
		--_bg-light: var(--_highlight-light);

		--_border-dark: hsl(215, 80%, 63%);
		--_highlight-dark: hsla(215, 80%, 63%, 0.249);
		--_text-dark: rgb(255, 255, 255);
		--_bg-dark: var(--_highlight-dark);
	}

	.warning {
		--_border-light: hsl(37, 90%, 58%);
		--_highlight-light: hsla(37, 90%, 58%, 0.22);
		--_text-light: rgb(0, 0, 0);
		--_bg-light: var(--_highlight-light);

		--_border-dark: hsl(37, 90%, 58%);
		--_highlight-dark: hsla(37, 90%, 58%, 0.22);
		--_text-dark: rgb(255, 255, 255);
		--_bg-dark: var(--_highlight-dark);
	}

	@media (pointer: fine) {
		button {
			min-height: 2.5rem !important;
			padding: 0.5rem 1rem !important;
			font-size: 1rem !important;
		}
	}

	@media (pointer: coarse) {
		button {
			min-height: 2.75rem !important;
			padding: 0.5rem 1rem !important;
			font-size: 1rem !important;
		}
	}

	button {
		min-height: 2rem;
		border: 2px solid var(--_border);
		background-color: var(--_bg);
		color: var(--_text);
		border-radius: 0.5rem;

		padding-block: 0.75ch;
		padding-inline: 1.75ch;

		cursor: pointer;
		box-shadow: 0 0 0 var(--_highlight-size) var(--_highlight);

		display: inline-flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		gap: 1ch;

		transition: var(--_transition);
		line-height: 1.5;

		touch-action: manipulation;
	}

	:where(button):where(:not(:active)):focus-visible {
		outline: 2px solid var(--_outline);
		outline-offset: 5px;
	}

	:where(button):where(:not(:active):not([disabled])):hover {
		--_highlight-size: 0.25rem;
	}

	button:disabled {
		--_border-light: hsl(0, 0%, 91%);
		--_text-light: #a1a1a1;
		--_bg-light: transparent;

		--_border-dark: var(--secondary-background-color-1);
		--_text-dark: #a1a1a1;
		--_bg-dark: var(--secondary-background-color-1);

		cursor: not-allowed;
	}
</style>
