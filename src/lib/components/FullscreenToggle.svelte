<script lang="ts">
	import { Fullscreen } from '$lib/ts/namespaces/Fullscreen';
	import { onMount } from 'svelte';

	$: isFullscreen = document.fullscreenElement !== null;

	onMount(async () => {
		isFullscreen = await Fullscreen.isFullscreen();
	});

	async function toggleFullscreen() {
		await Fullscreen.toggleFullscreen();
		isFullscreen = await Fullscreen.isFullscreen();
	}

	if (import.meta.env.VITE_PLATFORM === 'WEB') {
		document.documentElement.onfullscreenchange = () => {
			isFullscreen = document.fullscreenElement !== null;
		};
	}
</script>

{#if Fullscreen.isFullscreenSupported()}
	<button on:click={() => toggleFullscreen()} title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			{#if isFullscreen}
				<path
					d="M4 8H8V4M16 4V8H20M20 16H16V20M8 20V16H4"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="square" />
			{:else}
				<path
					d="M4 8V4H8M16 4H20V8M20 16V20H16M8 20H4V16"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="square" />
			{/if}
		</svg>
	</button>
{/if}

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
