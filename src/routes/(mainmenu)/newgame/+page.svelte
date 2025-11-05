<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { language, selectedLanguage, STARTING_DATE, time } from '$lib/ts/stores/Stores';
	import Icon from '$lib/components/Icon.svelte';
	import { generateTwoWord } from '$lib/ts/classes/Generator';

	import { base } from '$app/paths';
	import backIcon from '$lib/assets/icons/icon_back.svg';
	import locationIcon from '$lib/assets/icons/icon_location.svg';
	import capitalIcon from '$lib/assets/icons/icon_captical.svg';
	import calendarIcon from '$lib/assets/icons/icon_calendar.svg';

	import GlobeMap from '$lib/components/GlobeMap.svelte';

	import forwardIcon from '$lib/assets/icons/icon_forward.svg';
	import Portrait from '$lib/components/Portrait.svelte';
	import type { PortraitOptions } from '$lib/ts/interfaces/PortraitOptions';
	import { generateFullName, generatePortrait } from '$lib/ts/classes/Generator';
	import {
		companies,
		hardwareFeatures,
		gameProjects,
		platforms,
		saves,
		teams,
		gameFeatures,
		buildings
	} from '$lib/ts/stores/Stores';
	import { Employee } from '$lib/ts/classes/Employee';
	import { JobTitles } from '$lib/ts/enums/JobTitles';
	import { constructorTeam } from '$lib/ts/classes/Team';
	import { Random } from '$lib/ts/namespaces/Random';
	import { generateCompetitorGames } from '$lib/ts/classes/Game';
	import { Sex } from '$lib/ts/enums/Sex';
	import buildingsJsonData from '$lib/assets/data/data_buildings.json';
	import publisherJsonData from '$lib/assets/data/data_publishers.json';
	import { publishers } from '$lib/ts/stores/Stores';
	import platformsJsonData from '$lib/assets/data/data_platforms.json';
	import FeaturesJsonData from '$lib/assets/data/data_features.json';
	import hardwareFeaturesJsonData from '$lib/assets/data/data_hardware_features.json';
	import type { EmployeeData } from '$lib/ts/interfaces/EmployeeData';
	import { createCompany } from '$lib/ts/classes/Company';
	import { reviveDateObject } from '$lib/ts/helper/JsonHelper';
	import { get } from 'svelte/store';
	import { platformRunStep } from '$lib/ts/classes/Platform';
	import { createPublisher } from '$lib/ts/interfaces/Publisher';

	let newgame = {
		companyName: '',
		playerName: '',
		sex: Sex.Male
	};

	const corporateTaxRates = {
		'1970': [
			{ from: 0, to: 25000, rate: 22.55 },
			{ from: 25000, to: Infinity, rate: 49.2 }
		]
	};

	const year = '1970';
	const companyIncome = 40000;

	const corpTax: number =
		corporateTaxRates[year].find((x) => x.from < companyIncome && x.to > companyIncome)?.rate || 0;

	$: currencyFormatter = new Intl.NumberFormat($selectedLanguage, {
		style: 'currency',
		currency: 'usd',
		minimumFractionDigits: 0,
		maximumFractionDigits: 2
	});

	$: scenarioList = [
		{
			name: $language.SCENARIO_1_TITLE,
			description: $language.SCENARIO_1_DESCRIPTION?.replaceAll('{COMPANY1}', 'Ataru')
				?.replaceAll('{COMPANY2}', 'Activesion')
				?.replaceAll('{COMPANY3}', 'Techno Ventures')
				?.replaceAll('{FUNDING}', currencyFormatter.format(500_000)),
			funding: 500_000
		}
	];

	let index = 0;
	$: scenraio =
		scenarioList[((index % scenarioList.length) + scenarioList.length) % scenarioList.length];

	let portraitValues: PortraitOptions = generatePortrait();

	const styleOptions = [
		{
			name: 'Skin color',
			type: 'color',
			options: ['#f2c29d', '#fadcbd', '#f59877', '#f3a663', '#b64f29', '#81241d', '#4c160f']
		},
		{
			name: 'Clothing',
			options: ['Suit', 'Shirt', 'Jacket', 'Shirt Long'],
			colors: [
				{
					id: '--Clothing-Color-A',
					defaultColor: '#000000',
					suggestions: ['#000000', '#87bef2', '#b25757', '#ffffff', '#f4dd6b'],
					worksWithOption: 'all'
				},

				{
					id: '--Clothing-Color-B',
					defaultColor: '#ffffff',
					suggestions: ['#ffffff', '#87bef2', '#bbbbbb', '#f4dd6b'],
					worksWithOption: ['Suit', 'Jacket', 'Shirt Long']
				},

				{
					id: '--Clothing-Color-C',
					defaultColor: '#000000',
					suggestions: ['#000000'],
					worksWithOption: ['Suit']
				}
			]
		},

		{
			name: 'Hair Style',
			options: [
				'Variant6',
				'Variant7',
				'Variant8',
				'Variant9',
				'Variant10',
				'Long',
				'Short',
				'Bun',
				'Bob',
				'Bald'
			],
			colors: [
				{
					id: '--HairStyle-Color-A',
					defaultColor: '#23252a',
					suggestions: ['#23252a', '#ffed75', '#ff9b29', '#76563d'],
					worksWithOption: 'all'
				},

				{
					id: '--HairStyle-Color-B',
					defaultColor: '#fe5c66',
					suggestions: ['#fe5c66'],
					worksWithOption: ['Bun']
				}
			]
		},

		{ name: 'Nose', options: ['Straight', 'Round', 'Pointy'] },
		{
			name: 'Eyebrow',
			options: ['Straight', 'Raised', 'Angled'],
			colors: [
				{
					id: '--Eyebrow-Color-A',
					defaultColor: '#23252a',
					suggestions: ['#23252a', '#ffed75', '#ff9b29', '#76563d'],
					worksWithOption: 'all'
				}
			]
		},

		{
			name: 'Eye',
			options: ['Normal', 'Open', 'Tired', 'Focused', 'Squint', 'RIP', 'Star', 'Heart'],
			colors: [
				{
					id: '--Eye-Color-A',
					defaultColor: '#76563d',
					suggestions: ['#76563d', '#64a55f', '#6993ba', '#cccccc'],
					worksWithOption: 'all'
				}
			]
		},
		{ name: 'Mouth', options: ['Smilling', 'Sick', 'O', 'Straight', 'Frown', 'Smilly Teeth'] }
	];

	let typeofJobTitle: keyof typeof JobTitles = 'Programmer';

	// skillNames are dupplicate, fix it
	$: skillNames = <Record<any, string>>{
		Artist: $language.ART,
		AudioEngineer: $language.AUDIO_ENGINEERING,
		Designer: $language.DESIGN,
		Director: $language.DIRECTING,
		Producer: $language.PRODUCING,
		Programmer: $language.PROGRAMMING,
		Writer: $language.WRITING
	};

	function newGame() {
		let employee = Employee.create(
			typeofJobTitle,
			true,
			newgame.playerName,
			newgame.sex,
			0,
			portraitValues
		);

		Random.Seed(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16));

		saves.createNew(500_000).then(async (slot) => {
			const company = createCompany();
			company.name = newgame.companyName;
			company.owner = 'player';

			const companyId = companies.add(company);

			let otherEmployee1: EmployeeData = Employee.create(JobTitles.Artist);
			let otherEmployee2: EmployeeData = Employee.create(JobTitles.Designer);
			let otherEmployee3: EmployeeData = Employee.create(JobTitles.Programmer);

			const team = constructorTeam('Team #1', [employee, otherEmployee1, otherEmployee2, otherEmployee3]);
			team.companyId = companyId;

			teams.add(team);

			JSON.parse(JSON.stringify(buildingsJsonData), reviveDateObject).forEach((jsonObj) => {
				buildings.add(jsonObj);
			});

			JSON.parse(JSON.stringify(publisherJsonData), reviveDateObject).forEach((jsonObj) => {
				publishers.add(createPublisher(jsonObj));
			});

			JSON.parse(JSON.stringify(FeaturesJsonData), reviveDateObject).forEach((jsonObj) => {
				gameFeatures.add(jsonObj);
			});

			JSON.parse(JSON.stringify(hardwareFeaturesJsonData), reviveDateObject).forEach((jsonObj) => {
				hardwareFeatures.add(jsonObj);
			});

			const promises: Promise<IDBValidKey>[] = JSON.parse(JSON.stringify(platformsJsonData), reviveDateObject)
				.map((jsonObj) => {
					return platforms.add(jsonObj);
				})

			Promise.all(promises)
				.then((platformIds) => {
					get(platforms).map(p => platformRunStep(p, $time));
					return generateCompetitorGames();
				})
				.then((games) => {
					games?.map((game) => gameProjects.add(game));

					goto(`${base}/${slot}`);
				})
		});
	}
</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
	<h1>{$language.NEW_GAME}</h1>
</header>

<main>
	<div style="display: flex;flex-wrap: wrap;align-items: center;justify-content: center;gap: 1rem;">
		<div class="card">
			<h2
				style="border: 0; border-radius: 30px; flex: 1; display: flex;align-items: center;justify-content: center;">
				{scenraio.name}
			</h2>

			<div style="display: flex;gap: 1rem;align-items: center;">
				<div style="display: flex; flex-direction:column; gap: 1rem;">
					{#each scenraio.description?.split('\n') || [] as paragraph}
						<p>{paragraph}</p>
					{/each}
				</div>
			</div>

			<div class="card2">
				<div>
					<img src={locationIcon} alt="" class="icon" />
					<span>Sunnyvale, California, USA</span>
				</div>
				<div>
					<img src={capitalIcon} alt="" class="icon" />
					<span>{$language.CAPITAL}: {currencyFormatter.format(scenraio?.funding)}</span>
				</div>

				<div>
					<img src={calendarIcon} alt="" class="icon" />
					<span
						>{$language.DATE}: {new Intl.DateTimeFormat($selectedLanguage).format(
							STARTING_DATE
						)}</span>
				</div>
			</div>
		</div>

		<div style="max-width: 40vh; width: 100%">
			<GlobeMap />
		</div>
	</div>

	<div class="card">
		<label for="company-name" style="margin-bottom: 0.5rem;">{$language.COMPANY_NAME}</label>
		<div class="input-group">
			<input
				id="company-name"
				bind:value={newgame.companyName}
				placeholder={$language.ENTER_COMPANY_NAME} />

			<button
				class="dice"
				on:click={() => {
					newgame.companyName = generateTwoWord();
				}}>
				<Icon src={import("$assets/icons/icon_dice.svg?raw")} />
			</button>
		</div>
	</div>

	<div class="card">
		<div style="display: flex; gap: 1rem; flex-direction:column;">
			<div>
				<label for="sex" style="margin-bottom: 0.5rem;">{$language.SEX}</label>

				<div style="display: flex; gap:0.5rem; flex-wrap: wrap">
					<button
						class:selected={newgame.sex === Sex.Male}
						on:click={() => {
							newgame.sex = Sex.Male;
							newgame.playerName = generateFullName(newgame.sex);
						}}>{$language.MALE}</button>

					<button
						class:selected={newgame.sex === Sex.Female}
						on:click={() => {
							newgame.sex = Sex.Female;
							newgame.playerName = generateFullName(newgame.sex);
						}}>{$language.FEMALE}</button>

					<button
						class:selected={newgame.sex === Sex.NoneBinary}
						on:click={() => {
							newgame.sex = Sex.NoneBinary;
							newgame.playerName = generateFullName(newgame.sex);
						}}>{$language.NON_BINARY}</button>
				</div>
			</div>

			<div>
				<label for="player-name" style="margin-bottom: 0.5rem;">{$language.PLAYER_NAME}</label>
				<div class="input-group">
					<input
						id="player-name"
						bind:value={newgame.playerName}
						placeholder={$language.ENTER_PLAYER_NAME} />

					<button
						class="dice"
						on:click={() => {
							newgame.playerName = generateFullName(newgame.sex);
						}}>
						<Icon src={import("$assets/icons/icon_dice.svg?raw")} />
					</button>
				</div>
			</div>

			<div>
				<label for="jobtitle" style="margin-bottom: 0.5rem;">{$language.MAIN_SKILL}</label>

				<select id="jobtitle" bind:value={typeofJobTitle}>
					{#each Object.entries(JobTitles) as [key, job]}
						<option value={key}>{skillNames[key]}</option>
					{/each}
				</select>
			</div>
		</div>

		<div
			style="height: 400px; max-height: 30vh; border-radius: 1rem; overflow: hidden; background: var(--tertiary-background-color)">
			<Portrait {portraitValues} />
		</div>

		<div class="input-group" style="justify-content: center; gap: 1rem; place-self: center;">
			<span style="padding: 0 1rem; align-self: center;"
				>{$language.RANDOMIZE_CHARACTER_APPEARANCE}</span>
			<button
				class="dice"
				on:click={() => {
					portraitValues = generatePortrait();
				}}>
				<Icon src={import("$assets/icons/icon_dice.svg?raw")} />
			</button>
		</div>

		<div style="display:flex; gap: 0.5rem; flex-direction: column;">
			<details>
				<summary
					style="padding: 0px 1.5rem;display: flex;justify-content: center;align-items: center; gap: 1rem; ">
					<span style="text-decoration: underline;"
						>{$language.CUSTOMIZE_CHARACTER_APPEARANCE}</span>
				</summary>

				<div
					style="display: flex;gap: 1rem;align-items: flex-start;flex-wrap: wrap; flex-direction: column;">
					{#each styleOptions as { name, type, options, colors }, index}
						<h3 style="margin-bottom: 0.5rem;">
							{$language[name.toUpperCase().replace(' ', '_')]}
						</h3>
						<div style="display: flex; gap:0.5rem; flex-wrap: wrap">
							{#if type === 'color'}
								{#each options as opt}
									<button
										style="background-color: {opt}; border: 1px solid #444; width: 3rem; height: 3rem; border-radius: 0.5rem"
										on:click={() => (portraitValues['Skin Color'].variant = opt)}></button>
								{/each}
							{:else}
								<select bind:value={portraitValues[name].variant}>
									{#each options as option, i}
										<option value={option} selected={portraitValues[name].variant === option}
											>{option}</option>
									{/each}
								</select>

								{#if colors}
									{#each Object.values(colors) as { id, defaultColor, suggestions, worksWithOption }}
										{#if worksWithOption === 'all' || worksWithOption.includes(portraitValues[name]?.variant)}
											<input type="color" bind:value={portraitValues[name].colors[id]} />
										{/if}
									{/each}
								{/if}
							{/if}
						</div>
					{/each}
				</div>
			</details>
		</div>

		<Button
			variant="primary"
			grow
			disabled={newgame.playerName.length < 1 || newgame.companyName.length < 1}
			on:click={newGame}>{$language.START_GAME}</Button>
	</div>
</main>

<style>
	.card {
		background-color: #232425;
		border-radius: 1rem;
		padding: 1rem;
		display: flex;
		gap: 1rem;
		flex-direction: column;
	}

	.card p {
		margin: 0;
	}

	.card2 {
		background-color: #323335;
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		gap: 1rem;
		flex-direction: column;
	}

	.card2 > div {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	img.icon {
		filter: invert(1);
		pointer-events: none;
	}

	img.icon {
		filter: invert(1);
		pointer-events: none;
	}

	.card {
		background-color: #232425;
		border-radius: 1rem;
		padding: 1rem;
		display: flex;
		gap: 1rem;
		flex-direction: column;
		width: 100%;
	}

	input[type='color'] {
		width: 3rem;
		height: 3rem;
	}

	input[type='color']::-webkit-color-swatch-wrapper {
		padding: 0;
	}
	input[type='color']::-webkit-color-swatch {
		border: none;
		border-radius: 0.5rem;
	}
</style>
