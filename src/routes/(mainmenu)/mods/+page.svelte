<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { language, selectedLanguage } from '$lib/ts/stores/Stores';
	import { Mod } from '$lib/ts/classes/Mod';
	import { mods } from '$lib/ts/stores/Stores';
	import { base } from '$app/paths';
	import backIcon from '$lib/assets/icons/icon_back.svg';

	let selectedMod: Mod | undefined = undefined;

	function enableMod(mod: Mod) {
		mod.enabled = true;
		mods.refresh();
		selectedMod = undefined;
	}

	function disableMod(mod: Mod) {
		mod.enabled = false;
		mods.refresh();
		selectedMod = undefined;
	}

	function removeMod(mod: Mod) {
		mods.delete(mod);
		selectedMod = undefined;
	}

	function updateMod(mod: Mod) {
		mod.checkForUpdates();
		mods.refresh();
		selectedMod = undefined;
	}

	let modRepositoryLink: string = '';

	$: isLinkCorrect = modRepositoryLink.startsWith('https://');

	$: errorMessage = <undefined | any>undefined;

	function addRepository() {
		Mod.addModRepository(modRepositoryLink).then(({ error, value }) => {
			if (error) {
				errorMessage = error.message;
			}
		});
	}

	$: conjunctionListFormatter = new Intl.ListFormat($selectedLanguage, {
		style: 'short',
		type: 'conjunction'
	});
</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
	<h1>{$language.MODS}</h1>
</header>

<main>
	<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
		<div class="input-group" style="flex: 1; min-width: min(20ch, 100%);">
			<input
				type="url"
				placeholder="https://example.com/repository.json"
				bind:value={modRepositoryLink}
				pattern="https://.*" />
		</div>

		<Button on:click={addRepository} disabled={!isLinkCorrect}
			>{$language.ADD_MOD_REPOSITORY}</Button>
	</div>

	{#if errorMessage}
		<div
			style="border-radius: 0.5rem; padding: 0.5rem; background: var(--error-background-color);display:flex; flex-direction: column; ">
			<div style="display: flex;justify-content: space-between;align-items: flex-start;">
				<div style="font-weight: bold;">Error</div>
				<button on:click={() => (errorMessage = undefined)}>{$language.CLOSE}</button>
			</div>
			<span>{errorMessage}</span>
		</div>
	{/if}

	<div
		style="width: 100%;display: flex;flex-direction: row;gap: 1rem;justify-content: space-between; flex-wrap: wrap;">
		{#if selectedMod !== undefined}
			<Button
				grow
				variant="primary"
				on:click={() => enableMod(selectedMod)}
				disabled={selectedMod.enabled === true}>{$language.ENABLE}</Button>
			<Button
				variant="secondary"
				on:click={() => disableMod(selectedMod)}
				disabled={selectedMod.enabled === false}>{$language.DISABLE}</Button>
			<Button variant="secondary" on:click={() => updateMod(selectedMod)}
				>{$language.UPDATE}</Button>
			<Button variant="secondary" on:click={() => removeMod(selectedMod)}
				>{$language.REMOVE}</Button>
		{/if}
	</div>

	{#if $mods.length === 0}
		<h2>{$language.NO_MODS_FOUND}</h2>
	{/if}

	<div style="display: flex; width: 100%; flex-direction: column; gap: 0.5rem">
		{#each $mods as mod, i}
			<button
				style="display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-start; width: 100%; flex-grow: 1; text-align: start;"
				on:click={() => (selectedMod = mod)}>
				<div style="display: flex; gap: 0.5rem;">
					{#if mod.manifest?.iconURL}
						<div>
							<img src={mod.manifest?.iconURL} alt="" style="border-radius: 0.5rem;" />
						</div>
					{/if}
					<div>
						<div>{mod.manifest?.name}</div>

						<small>
							{$language.AUTHOR_BY.replace(
								'{NAMES}',
								conjunctionListFormatter.format(mod.manifest?.authors.map((x) => x.name))
							)}
						</small>
					</div>
				</div>

				<div>
					{mod.manifest?.description}
				</div>

				<div style="display: flex; gap: 0.5rem; width: 100%; flex-wrap: wrap;">
					<div class="chip">{mod.manifest?.category.join(', ')}</div>

					<div class="chip">
						v{mod.manifest?.version}
					</div>

					<div class="chip">
						{mod.enabled ? $language.ENABLED : $language.DISABLED}
					</div>
				</div>
			</button>

		{/each}
	</div>
</main>
