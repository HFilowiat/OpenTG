<script lang="ts">
	import { language, selectedLanguage, settings } from '$lib/ts/stores/Stores';
	import backIcon from '$lib/assets/icons/icon_back.svg';

</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
	<h1>{$language.SETTINGS}</h1>
</header>

<main>
	<div style="text-align: start; padding: 1rem">
		<label for="sound">{$language.SOUND}</label>
		<input id="sound" type="range" step="0.01" min="0" max="1" bind:value={$settings.sound} />
	</div>
</main>

<style>
</style>
