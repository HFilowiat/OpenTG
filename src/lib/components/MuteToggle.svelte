<script lang="ts">
	import { AudioMixer } from '$lib/ts/namespaces/AudioMixer';
	import { isSoundAllowed } from '$lib/ts/stores/Stores';
	import { onMount } from 'svelte';

	$: isSoundEnabled = <boolean>JSON.parse(localStorage.getItem('sound')) || false;

	onMount(async () => {
		isSoundEnabled = JSON.parse(localStorage.getItem('sound')) || false;
	});

	async function toggleSound() {
		isSoundEnabled = !isSoundEnabled;
		localStorage.setItem('sound', JSON.stringify(isSoundEnabled));
		AudioMixer.setSoundEnabled(isSoundEnabled);
	}
</script>

<button
	on:click={() => toggleSound()}
	title={!$isSoundAllowed
		? 'Sound not allowed'
		: isSoundEnabled
			? 'Enabled Sound'
			: 'Disabled Sound'}>
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		{#if !$isSoundAllowed}
			<path
				fill="currentColor"
				d="M15.4 16 14 14.6l2.6-2.6L14 9.4 15.4 8l2.6 2.6L20.6 8 22 9.4 19.4 12l2.6 2.6-1.4 1.4-2.6-2.6-2.6 2.6ZM3 15V9h4l5-5v16l-5-5H3Z" />
		{:else if isSoundEnabled}
			<path
				fill="currentColor"
				d="M14 20.725v-2.05c1.5-.433 2.708-1.267 3.625-2.5.917-1.233 1.375-2.633 1.375-4.2 0-1.567-.458-2.967-1.375-4.2S15.5 5.708 14 5.275v-2.05c2.067.467 3.75 1.512 5.05 3.137C20.35 7.987 21 9.858 21 11.976c0 2.117-.65 3.988-1.95 5.612-1.3 1.625-2.983 2.671-5.05 3.138ZM3 15V9h4l5-5v16l-5-5H3Zm11 1V7.95a4.151 4.151 0 0 1 1.838 1.65A4.57 4.57 0 0 1 16.5 12c0 .85-.22 1.637-.662 2.363A4.174 4.174 0 0 1 14 16Z" />
		{:else}
			<path
				fill="currentColor"
				d="m19.8 22.6-3.025-3.025a8.306 8.306 0 0 1-1.325.688 9.48 9.48 0 0 1-1.45.462v-2.05c.233-.083.463-.167.688-.25a4.04 4.04 0 0 0 .637-.3L12 14.8V20l-5-5H3V9h3.2L1.4 4.2l1.4-1.4 18.4 18.4-1.4 1.4Zm-.2-5.8-1.45-1.45a6.796 6.796 0 0 0 .638-1.625c.141-.567.212-1.15.212-1.75 0-1.567-.458-2.967-1.375-4.2S15.5 5.708 14 5.275v-2.05c2.067.467 3.75 1.512 5.05 3.137C20.35 7.987 21 9.858 21 11.976c0 .883-.12 1.733-.363 2.55A8.803 8.803 0 0 1 19.6 16.8Zm-3.35-3.35L14 11.2V7.95a4.151 4.151 0 0 1 1.838 1.65A4.57 4.57 0 0 1 16.5 12a4.33 4.33 0 0 1-.25 1.45ZM12 9.2 9.4 6.6 12 4v5.2Z" />
		{/if}
	</svg>
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
