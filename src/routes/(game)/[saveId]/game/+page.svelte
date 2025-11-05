<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Card from '$lib/components/Card.svelte';
	import Switch from '$lib/components/Switch.svelte';
	import Button from '$lib/components/Button.svelte';
	import { language, cash, selectedLanguage } from '$lib/ts/stores/Stores';
	import { estimateFeatureRequirements, isFeatureResearched, type Feature } from '$lib/ts/classes/Feature';
	import imageOrangeII from '$lib/assets/images/image_platform_orange_II.jpg';
	import imagePET from '$lib/assets/images/image_platform_pet.jpg';
	import imageDRH80 from '$lib/assets/images/image_platform_drh_80.jpg';
	import imageAtari2600 from '$lib/assets/images/image_platform_ataru_2600.jpg';
	import imageIntelivision from '$lib/assets/images/image_platform_intelivision.jpg';
	import imageColecoVision from '$lib/assets/images/image_platform_coneco_vision.jpg';
	import imageOdessi2 from '$lib/assets/images/image_platform_odessi_2.jpg';
	import imageYES from '$lib/assets/images/image_platform_yes.jpg';
	import imageAtari5200 from '$lib/assets/images/image_platform_ataru_5200.jpg';
	import imageAtari7800 from '$lib/assets/images/image_platform_ataru_7800.jpg';
	import imageAtariXEGS from '$lib/assets/images/image_platform_ataru_xe.jpg';
	import imageSEGEMS from '$lib/assets/images/image_platform_sage_ms.jpg';
	import imageindev from '$lib/assets/images/image_platform_indev.jpg';

	import { goto } from '$app/navigation';
	import floppyIcon from '$lib/assets/icons/icon_floppy.svg';
	import memoryIcon from '$lib/assets/icons/icon_memory.svg';
	import processorIcon from '$lib/assets/icons/icon_processor.svg';
	import backIcon from '$lib/assets/icons/icon_back.svg';
	import { Utility } from '$lib/ts/namespaces/Utility';

	import { gameProjects, teams, gameFeatures } from '$lib/ts/stores/Stores';
	import Cardcheck from '$lib/components/CardCheck.svelte';
	import type { LayoutData } from '../$types';
	import { generateGameName } from '$lib/ts/classes/Generator';
	import { platforms } from '$lib/ts/stores/Stores';
	import { genres, type Genre } from '$lib/ts/types/Genre';
	import { base } from '$app/paths';
	import AlertMessage from '$lib/components/AlertMessage.svelte';
	import themesData from '$lib/assets/data/data_themes.json';
	import themesDescriptionData from '$lib/assets/data/data_theme_description.json';
	import { create } from '$lib/ts/classes/Game';
	import { getSystemSpecs } from '$lib/ts/classes/Platform';

	export let data: LayoutData;

	$: cashFormatter = new Intl.NumberFormat($selectedLanguage, {
		style: 'currency',
		currency: 'USD',
		notation: 'compact',
		minimumFractionDigits: 2
	});

	$: noOfGames = $gameProjects.filter((x) => x.developerId === 'MYCOMPANY').length + 1;

	let selectedName = '';
	let gamesize = 1;

	const allPlatforms = $platforms.filter((platform) => platform.isReleased);

	const platformImages = {
		ORANGE_II: imageOrangeII,
		PET: imagePET,
		DRH_80: imageDRH80,
		ATARU_2600: imageAtari2600,
		ATARU_5200: imageAtari5200,
		ATARU_7800: imageAtari7800,
		INTELIVISION: imageIntelivision,
		CONECO_VISION: imageColecoVision,
		ODESSI_2: imageOdessi2,
		YES: imageYES,
		ATARU_XE: imageAtariXEGS,
		SAGE_MS: imageSEGEMS,
		IN_DEV: imageindev
	};

	$: ids = new Set<string>();
	$: enabledPlatforms = allPlatforms.filter((platform) => ids.has(platform.id));

	$: allGenres = genres.map((genreName: Genre, i: number) => {
		return { id: i, set: false, text: genreName };
	});

	$: themes = themesData;

	$: allThemes = themes.map((themeName: string, i: number) => {
		return { id: i, set: false, text: themeName };
	});

	$: themeCombo = themesDescriptionData;

	$: setThemes = allThemes.filter((t) => t.set).map((t) => t.text);

	$: description = themeCombo.find((item) => item.themes.every((theme) => setThemes.includes(theme)))?.description;

	$: isCreateGameDisabled =
		selectedName.length < 1 ||
		ids.size < 1 ||
		allGenres.filter((t) => t.set).length < 1 ||
		!isMandatoryFeaturesAreEnabled ||
		isGameNameUsed ||
		!isEnabledFeaturesWorkOnSystemSpecs;

	$: enabledFeatureIds = new Set<IDBValidKey>();
	$: enabledFeature = features.filter((f) => enabledFeatureIds.has(f.id));

	$: enabledFeatureSystemRequirements = {
		graphics: enabledFeature.reduce(
			(sum, f) =>
				(sum +=
					f.category === 'FEATURE_CATEGORY_GRAPHICS'
						? estimateFeatureRequirements(f, graphicsFidelitySlider).graphics
						: f.requirements.graphics),
			0
		),
		processing: enabledFeature.reduce(
			(sum, f) =>
				(sum +=
					f.category === 'FEATURE_CATEGORY_GRAPHICS'
						? estimateFeatureRequirements(f, graphicsFidelitySlider).processing
						: f.requirements.processing),
			0
		),
		memory: enabledFeature.reduce(
			(sum, f) =>
				(sum +=
					f.category === 'FEATURE_CATEGORY_GRAPHICS'
						? estimateFeatureRequirements(f, graphicsFidelitySlider).memory
						: f.requirements.memory),
			0
		),
		storage: enabledFeature.reduce(
			(sum, f) =>
				(sum +=
					f.category === 'FEATURE_CATEGORY_GRAPHICS'
						? estimateFeatureRequirements(f, graphicsFidelitySlider).storage
						: f.requirements.storage),
			0
		)
	};

	$: isEnabledFeaturesWorkOnSystemSpecs =
		((enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]).graphics : 0) >
			enabledFeatureSystemRequirements.graphics &&
			(enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]).processing : 0) >
				enabledFeatureSystemRequirements.processing &&
			(enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]).memory : 0) >
				enabledFeatureSystemRequirements.memory &&
			(enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]).storage : 0) >
				enabledFeatureSystemRequirements.storage) ||
		false;

	$: features = $gameFeatures;

	const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
		arr.reduce(
			(groups, item) => {
				(groups[key(item)] ||= []).push(item);
				return groups;
			},
			{} as Record<K, T[]>
		);

	$: filteredFeatures = features.filter((feature) => isFeatureResearched(feature));
	$: featureGroups = groupBy(filteredFeatures, (x) => x.category);

	$: requiredSkillsForFeatures = Array.from(enabledFeatureIds).reduce((p, v) => {
		const f = features.find((x) => x.id == v);

		for (const skill of f.requiredSkill) {
			if (!p.includes(skill)) p.push(skill);
		}
		return p;
	}, []);

	$: skillInTeam =
		$teams[0]?.employees.reduce((p, v) => {
			if (!p.includes(v.jobTitle)) p.push(v.jobTitle);
			return p;
		}, []) || [];
	$: skillNotInTeam = requiredSkillsForFeatures.filter((item) => !skillInTeam.includes(item));

	let listOfMandatoryFeaturesTags = ['TEXT_BASED', '2D', '3D'];

	$: isMandatoryFeaturesAreEnabled = listOfMandatoryFeaturesTags.some((featureTag) =>
		enabledFeature.find((f) => f.tag === featureTag)
	);

	$: isGameNameUsed = $gameProjects.filter((x) => x.developerId === 'MYCOMPANY').find((x) => x.name == selectedName)
		? true
		: false;

	$: disjunctionListFormatter = new Intl.ListFormat($selectedLanguage, {
		style: 'short',
		type: 'disjunction'
	});

	$: conjunctionListFormatter = new Intl.ListFormat($selectedLanguage, {
		style: 'short',
		type: 'conjunction'
	});

	$: numberFormatter = new Intl.NumberFormat($selectedLanguage, {
		notation: 'compact',
		maximumFractionDigits: 2,
		maximumSignificantDigits: 2
	});

	let graphicsFidelitySlider = 0.5;
</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
</header>

<main>
	<div>
		<div class="label" style="margin-bottom: 0.5rem;">
			{$language.GAME_NAME}
		</div>

		{#if isGameNameUsed}
			<div style="display: flex; gap: 1rem; align-items:center">
				<span style="color: #FFAB25"><Icon src={import("$assets/icons/icon_warning.svg?raw")} /></span>
				<span>{$language.THIS_NAME_IS_ALREADY_TAKEN_PLEASE_ENTER_A_DIFFERENT_NAME}</span>
			</div>
		{/if}

		<div class="input-group">
			<input bind:value={selectedName} placeholder="{$language.GAME} #{noOfGames}" type="text" autocomplete="off" />

			<button class="dice" on:click={() => (selectedName = generateGameName())}>
				<Icon src={import("$assets/icons/icon_dice.svg?raw")} />
			</button>
		</div>
	</div>

	{#if description}
		<div>
			{description}
		</div>
	{/if}

	<div style=" gap: 2rem;display: flex;flex-direction: column;align-items: flex-start;">
		<div style="display: flex;flex-direction: column;gap: 1rem;">
			<div class="label">{$language.GENRE}</div>
			<div>
				{#each allGenres as genre (genre.id)}
					<button class="multiselect" class:selected={genre.set === true} on:click={() => (genre.set = !genre.set)}
						>{genre.text}</button>
				{/each}
			</div>
		</div>

		<div style="display: flex;flex-direction: column;gap: 1rem;">
			<div class="label">{$language.THEME}</div>
			<div>
				{#each allThemes as theme}
					<button class="multiselect" class:selected={theme.set === true} on:click={() => (theme.set = !theme.set)}
						>{theme.text}</button>
				{/each}
			</div>
		</div>
	</div>

	<div style="gap: 0.5rem;display: flex;flex-direction: column;align-items: flex-start;">
		<div style="width:100%">
			<div>
				<div class="label">
					{$language.GAME_SCALE}
					{#if gamesize === 1}
						{$language.GAME_SCALE_TINY}
					{:else if gamesize === 2}
						{$language.GAME_SCALE_SMALL}
					{:else if gamesize === 3}
						{$language.GAME_SCALE_MEDIUM}
					{:else if gamesize === 4}
						{$language.GAME_SCALE_LARGE}
					{:else if gamesize === 5}
						{$language.GAME_SCALE_AA}
					{:else if gamesize === 6}
						{$language.GAME_SCALE_AAA}
					{/if}
				</div>
				<input type="range" step="1" bind:value={gamesize} min="1" max="6" />
			</div>
		</div>
	</div>

	<div style="gap: 1rem;display: flex;flex-direction: column;align-items: flex-start;">
		<div class="label">{$language.PLATFORM}</div>

		<div
			style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(240px, 100%), 1fr)); gap: 0.5rem;background: var(--primary-background-color) ;border-radius: 1rem;">
			{#each $platforms.filter((platform) => platform.isReleased) as platform}
				<Cardcheck
					on:enable={() => {
						ids.add(platform.id);
						ids = new Set([...ids]);
					}}
					on:disable={() => {
						ids.delete(platform.id);
						ids = new Set([...ids]);
					}}
					disabled={(!ids.has(platform.id) && ids.size > 0) || !platform.license.bought}>
					<div class="stack" style="justify-items: center; align-items: center; width: 100%">
						<img src={platformImages[platform.imagesrc]} alt={platform.name} class="card-image" />

						{#if ids.size === 0 || ids.has(platform.id)}
							{#if !platform.license.bought}
								<button
									disabled={$cash < platform.license.costPerYear}
									on:click={() => {
										platform.buyLicense();
									}}
									style="max-height: 3rem;max-width: fit-content; margin: 0.5rem;"
									>{$language.BUY_LICENSE_FOR}
									{cashFormatter.format(platform.license.costPerYear)}
									{$language.A_YEAR}</button>
							{:else}
								<div style="display: grid;gap: 0.25rem;justify-self: baseline;padding: 0.5rem; place-self: start;">
									<div
										style="width: 100%"
										class="chip"
										title="{$language.GRAPHICS_POWER}: {getSystemSpecs(platform).graphics.toString()}">
										<img src={processorIcon} alt="" />
										<span>{numberFormatter.format(getSystemSpecs(platform).graphics)} GP</span>
									</div>

									<div
										style="width: 100%"
										class="chip"
										title="{$language.PROCESSING_POWER}: {getSystemSpecs(platform).processing.toString()}">
										<img src={processorIcon} alt="" />
										<span>{numberFormatter.format(getSystemSpecs(platform).processing)} PP</span>
									</div>

									<div style="width: 100%" class="chip" title={$language.MEMORY}>
										<img src={memoryIcon} alt="" />
										<span>{Utility.formatBytes(getSystemSpecs(platform).memory)}</span>
									</div>

									<div style="width: 100%" class="chip" title={$language.STORAGE_MEDIA}>
										<img src={floppyIcon} alt="" />
										<span>{Utility.formatBytes(getSystemSpecs(platform).storage)}</span>
									</div>
								</div>
							{/if}

							<div style="place-self: baseline end; padding: 0.5rem">
								{#if platform.generation === 0}
									<span class="chip">PC</span>
								{:else}
									<span class="chip">Gen {platform.generation}</span>
								{/if}
							</div>
						{/if}
					</div>

					<div
						style="display: flex;gap: 0.5rem;flex-direction: row;padding: 0.5rem;width: 100%;justify-content: space-between;">
						<span class="single-line-text">{platform.name}</span>
					</div>
				</Cardcheck>
			{/each}
		</div>
	</div>

	<div style="gap: 1rem;display: flex;flex-direction: column;align-items: flex-start;">
		<div class="label">{$language.FEATURES}</div>

		<div style="display: flex; gap: 0.5rem; flex-direction: row; flex-wrap: wrap;">
			<div
				class="chip"
				class:warning={enabledFeatureSystemRequirements.graphics >
					(enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]).graphics : 0)}
				title="{$language.GRAPHICS_POWER}: {enabledFeatureSystemRequirements.graphics}">
				<img src={processorIcon} alt="" />
				<span>{numberFormatter.format(enabledFeatureSystemRequirements.graphics)} GP</span>

				{#if enabledPlatforms[0]}
					/ <span
						>{numberFormatter.format(enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]).graphics : 0)} GP</span>
				{/if}
			</div>

			<div
				class="chip"
				class:warning={enabledFeatureSystemRequirements.processing >
					(enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]) : 0).processing}
				title="{$language.PROCESSING_POWER}: {enabledFeatureSystemRequirements.processing}">
				<img src={processorIcon} alt="" />
				<span>{numberFormatter.format(enabledFeatureSystemRequirements.processing)} PP</span>

				{#if enabledPlatforms[0]}
					/ <span
						>{numberFormatter.format(enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]).processing : 0)} PP</span>
				{/if}
			</div>

			<div
				class="chip"
				class:warning={enabledFeatureSystemRequirements.memory >
					(enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]).memory : 0)}
				title={$language.MEMORY}>
				<img src={memoryIcon} alt="" />
				<span>{Utility.formatBytes(enabledFeatureSystemRequirements.memory)}</span>

				{#if enabledPlatforms[0]}
					/ <span>{Utility.formatBytes(enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]).memory : 0)}</span>
				{/if}
			</div>

			<div
				class="chip"
				class:warning={enabledFeatureSystemRequirements.storage >
					(enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]).storage : 0)}
				title={$language.STORAGE_MEDIA}>
				<img src={floppyIcon} alt="" />
				<span>{Utility.formatBytes(enabledFeatureSystemRequirements.storage)}</span>

				{#if enabledPlatforms[0]}
					/ <span>{Utility.formatBytes(enabledPlatforms[0] ? getSystemSpecs(enabledPlatforms[0]).storage : 0)}</span>
				{/if}
			</div>
		</div>

		<div id="alert-messages" class="alert-messages">
			{#if !isMandatoryFeaturesAreEnabled}
				<AlertMessage>
					{$language.TO_CREATE_A_GAME_YOU_NEED_TO_ENABLE_ONE_THESE_FEATURES}: {disjunctionListFormatter.format(
						features
							.filter((feature) => listOfMandatoryFeaturesTags.includes(feature.tag))
							.map((x) => $language[x.name])
					)}
				</AlertMessage>
			{/if}

			{#if enabledPlatforms.length > 0 && !isEnabledFeaturesWorkOnSystemSpecs}
				<AlertMessage>
					{$language.THE_CURRENT_LIST_OF_FEATURES_IS_NOT_COMPATIBLE_WITH_THE_PLATFORM_SPECIFICATIONS}
				</AlertMessage>
			{/if}

			{#if skillNotInTeam.length > 0}
				<AlertMessage>
					{$language.LACK_OF_NECESSARY_SKILLS_IN_THE_TEAM_CAN_SIGNIFICANTLY_SLOW_DOWN_PROJECT_DEVELOPMENT}
					{$language.MISSING_TEAM_SKILLS}: {conjunctionListFormatter.format(
						requiredSkillsForFeatures.filter((skill) => skillNotInTeam.includes(skill))
					)}
				</AlertMessage>
			{/if}
		</div>

		<div style="display: flex; flex-direction: column; width: 100%">
			{#each Object.entries(featureGroups) as [keyAsCategory, featurelist]}
				<details name="feature-categories">
					<summary
						><b>{$language[keyAsCategory]}</b>
						<div style="margin-inline: 1rem;">
							{conjunctionListFormatter.format(
								featurelist.filter((f) => enabledFeatureIds.has(f.id)).map((f) => $language[f.name])
							)}
						</div>

						{#if keyAsCategory === 'FEATURE_CATEGORY_GRAPHICS'}
							<div style="margin-inline: 1rem;">
								<small>{$language.PERFORMANCE}</small>
								<input type="range" bind:value={graphicsFidelitySlider} step="0.01" min="0.01" max="1" />
								<small>{$language.FIDELITY}</small>
							</div>
						{/if}
					</summary>

					<div
						style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(400px, 100%), 1fr)); gap: 0.5rem;">
						{#each featurelist as feature}
							{@const requirements =
								keyAsCategory === 'Graphics'
									? estimateFeatureRequirements(feature, graphicsFidelitySlider)
									: feature.requirements}
							<Card name={$language[feature.name]} title={$language[feature.description]}>
								<div slot="action" style="margin:0; margin-left:auto; ">
									<Switch
										on:enable={() => {
											enabledFeatureIds.add(feature.id);
											enabledFeatureIds = new Set([...enabledFeatureIds]);
										}}
										on:disable={() => {
											enabledFeatureIds.delete(feature.id);
											enabledFeatureIds = new Set([...enabledFeatureIds]);
										}} />
								</div>

								<div style="display: grid; gap: 0.5rem; ">
									<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
										{#if requirements.graphics > 0}
											<div class="chip" title="{$language.GRAPHICS_POWER}: {requirements.graphics}">
												<img src={processorIcon} alt="" />
												<span>{numberFormatter.format(requirements.graphics)} GP</span>
											</div>
										{/if}

										{#if requirements.processing > 0}
											<div class="chip" title="{$language.PROCESSING_POWER}: {requirements.processing}">
												<img src={processorIcon} alt="" />
												<span>{numberFormatter.format(requirements.processing)} PP</span>
											</div>
										{/if}

										{#if requirements.memory > 0}
											<div class="chip" title={$language.MEMORY}>
												<img src={memoryIcon} alt="" />
												<span>{Utility.formatBytes(requirements.memory)}</span>
											</div>
										{/if}

										{#if requirements.storage > 0}
											<div class="chip" title={$language.STORAGE_MEDIA}>
												<img src={floppyIcon} alt="" />
												<span>{Utility.formatBytes(requirements.storage)}</span>
											</div>
										{/if}
									</div>
								</div>
							</Card>
						{/each}
					</div>
				</details>
			{/each}
		</div>
	</div>

	<div style="display: flex; gap: 0.5rem;">
		{#if isCreateGameDisabled}
			<AlertMessage />
		{/if}
		<Button
			variant="primary"
			grow
			on:click={() => {
				const team = $teams[0];

				if (team === undefined) throw new Error('team is not set');

				const name = selectedName;
				const platformIds = ids;
				const genre = allGenres.filter((t) => t.set).map((x) => x.text);

				const game = create(name, [...platformIds], genre, team.id, undefined, Array.from(enabledFeatureIds));
				game.gamesize = gamesize;

				gameProjects.add(game);

				selectedName = '';
				allGenres = allGenres.map((x) => {
					x.set = false;
					return x;
				});
				gamesize = 1;
				enabledFeatureIds.clear();

				goto(`${base}/${data.saveId}/`);
			}}
			disabled={isCreateGameDisabled}>{$language.CREATE_GAME}</Button>
	</div>
</main>

<style>
	button.multiselect {
		margin: 0.2rem;
		border-radius: 8px;
		border: 2px solid transparent;
		background-color: var(--secondary-background-color);
	}

	button.multiselect:hover {
		border-color: var(--tertiary-background-color);
		background-color: var(--tertiary-background-color);
	}

	button.multiselect.selected {
		background-color: var(--button-color-background-primary-alpha);
		color: var(--button-color-background-primary);
		border: 2px solid var(--button-color-background-primary);
	}
	button.multiselect:disabled {
		cursor: not-allowed;
	}

	div.label {
		font-size: large;
		font-weight: bold;
		color: var(--primary-foreground-color);
	}

	.card-image {
		object-fit: cover;
		height: 100%;
		width: 100%;
		aspect-ratio: 3/2;
	}

	.alert-messages {
		display: flex;
		gap: 0.5rem;
		flex-direction: column;
		width: 100%;
	}

	.chip.warning {
		background-color: var(--error-background-color);
	}

	details {
		width: 100%;
		border: 2px solid transparent;
		border-radius: 0.75rem;
		padding: 0.25rem;
	}

	summary {
		padding: 0.5rem;
		background-color: var(--secondary-background-color);
		border-radius: 0.5rem;
	}

	details[open] {
		border-color: var(--button-color-background-primary);
	}
	details[open] summary {
		margin-block-end: 0.5rem;
	}
</style>
