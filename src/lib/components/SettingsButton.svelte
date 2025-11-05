<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import settingsIcon from '$lib/assets/icons/icon_settings.svg';

	function openSettings() {
		goto(`${base}/settings`);
	}
</script>

<button on:click={() => openSettings()} title={'Settings'}>
	<img src={settingsIcon} alt="Settings" />
</button>

<style>
	button {
		cursor: pointer;
		touch-action: manipulation;

		outline-offset: 5px;
		border-radius: 50%;
		background: none;
		border: none;
		aspect-ratio: 1;
	}

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

	button {
		color: var(--_text);
		border-radius: 0.5rem;

		padding-block: 0.75ch;
		padding-inline: 1.75ch;

		cursor: pointer;
		box-shadow: inset 0 0 0 var(--_highlight-size) var(--_highlight);

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
</style>
