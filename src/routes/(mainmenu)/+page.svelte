<script lang="ts">
	import { language, selectedLanguage } from '$lib/ts/stores/Stores';

	import FullscreenToggle from '$lib/components/FullscreenToggle.svelte';
	import Button from '$lib/components/Button.svelte';

	import MuteToggle from '$lib/components/MuteToggle.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';

	import backgroundWide from '$lib/assets/images/image_background_wide.jpg';

	import { version } from '$app/environment';
	import { goto } from '$app/navigation';
	import { saves } from '$lib/ts/stores/Stores';

	import { base } from '$app/paths';
	import SettingsButton from '$lib/components/SettingsButton.svelte';

	$: sortedSaves = $saves
		.filter((save) => save.cash >= 0)
		.sort((a, b) => b.lastSaved.getTime() - a.lastSaved.getTime());
	$: isContinueButtonEnabled = sortedSaves.length > 0;
	$: latestSave = sortedSaves[0];

	$: dateTimeformatter = new Intl.DateTimeFormat($selectedLanguage, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});

	function continueGame() {
		if (isContinueButtonEnabled && latestSave) {
			goto(`${base}/${latestSave.id}/`);
		}
	}
</script>

<div class="container">
	<picture class="background-image">
		<img src={backgroundWide} alt="" />
	</picture>

	<div class="child1">
		{#await import("$lib/assets/images/image_logo_game.svg?raw") then value}
			{@html value.default}
		{/await}
	</div>

	<div class="child2">
		{#if latestSave}
			<Button on:click={continueGame} disabled={!isContinueButtonEnabled}
				>{$language.CONTINUE}</Button>
		{/if}
		<Button on:click={() => goto(`${base}/newgame`)}>{$language.NEW}</Button>
		<Button on:click={() => goto(`${base}/loadgame`)}>{$language.LOAD}</Button>

		<Button on:click={() => goto(`${base}/mods`)}>{$language.MODS}</Button>

	</div>

	<footer>
		<div on:click={() => goto(`${base}/credits`)} style="display: flex;flex-direction: column;">
			<span>OpenTG v{version}</span>
			<div><b>{$language.CREDITS}</b></div>
		</div>

		<div
			style="gap: 0.5rem; display: flex;flex-direction: flex-direction: row-reverse; align-items: center;">
			<SettingsButton />
			<MuteToggle />
			<FullscreenToggle />
			<LanguageSelector />
		</div>
	</footer>

</div>

<style>
	.background-image img {
		position: absolute;
		width: 100%;
		inset: 0px;
		z-index: -1;
		object-fit: cover;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		height: 100%;
		border-radius: 5px;
	}

	.container {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
		gap: 1rem;
		flex-grow: 1;
		justify-content: center;
		align-items: center;
		position: relative;
		padding: 1rem;
	}

	.child1 {
		width: 100%;
		flex-grow: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.child2 {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 130px));
		gap: 1rem;
		flex-grow: 1;
		align-items: center;
		align-content: center;
		justify-content: center;
	}

	.child2 > * {
		flex: 1 0 auto;
	}

	footer {
		display: flex;
		flex-direction: row;
		gap: 1rem;
		align-items: center;
		flex-wrap: wrap;
		justify-content: space-between;
		width: 100%;
	}
</style>
