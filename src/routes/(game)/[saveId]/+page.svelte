<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { cash, speed, time, language, gameFeatures, STARTING_DATE, selectedLanguage } from '$lib/ts/stores/Stores';
	import {
		calculateGenreFactorMatrix,
		generateRandomGame,
		getGameFeatureProgress,
		runHypeStep,
		runStep,
		getTotalSaleLast30Days,
		getTotalSale
	} from '$lib/ts/classes/Game';
	import { SoftwareReleaseLifeCycle } from '$lib/ts/enums/SoftwareReleaseLifeCycle';
	import { get } from 'svelte/store';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import { Random } from '$lib/ts/namespaces/Random';
	import { AudioMixer } from '$lib/ts/namespaces/AudioMixer';
	import { goto } from '$app/navigation';

	import moreIcon from '$lib/assets/icons/icon_more.svg';
	import gameIcon from '$lib/assets/icons/icon_game.svg';
	import teamIcon from '$lib/assets/icons/icon_team.svg';
	import marketIcon from '$lib/assets/icons/icon_market.svg';
	import companyIcon from '$lib/assets/icons/icon_company.svg';
	import researchIcon from '$lib/assets/icons/icon_research.svg';
	import exitIcon from '$lib/assets/icons/icon_exit.svg';

	import { buildings, gameProjects, hardwareProjects, newslist, platforms, saves, teams } from '$lib/ts/stores/Stores';
	import Card from '$lib/components/Card.svelte';
	import StepProgress from '$lib/components/StepProgress.svelte';
	import GraphNew from '$lib/components/Graph.svelte';
	import type { Team } from '$lib/ts/classes/Team';
	import { Hardware } from '$lib/ts/classes/Hardware';
	import Progress from '$lib/components/Progress.svelte';

	import type { LayoutData } from './$types';
	import { base } from '$app/paths';
	import { platformRunStep, platformRunStepYearly } from '$lib/ts/classes/Platform';
	import { featureRunStep } from '$lib/ts/classes/Feature';
	import { buildingRunStep } from '$lib/ts/classes/Building';

	export let data: LayoutData;

	AudioMixer.playTrack(AudioMixer.filenames[1]);

	$: {
		// run initial step, for new game so platforms are, released to the market at starting date

		if ($time === STARTING_DATE) {
			$platforms.map((p) => platformRunStep(p, $time));
			platforms.refresh();
		}
	}

	time.registerCallback(
		1,
		'yearly',
		(currentDate: Date) => {
			get(platforms).map((p) => platformRunStepYearly(p));
			platforms.refresh();
		},
		true
	);

	time.registerCallback(
		2,
		'daily',
		(currentDate: Date) => {
			calculateGenreFactorMatrix();

			get(platforms).map((p) => platformRunStep(p, currentDate));
			platforms.refresh();

			get(gameProjects).map((g) => runHypeStep(g, currentDate));
			gameProjects.refresh();

			get(teams).map((t: Team) => {
				t.employees.map((e) => {
					e.energy = e.maxenergy;
				});
			});

			if (Random.Random01() < 0.1) {
				gameProjects.add(generateRandomGame());
			}
		},
		true
	);

	time.registerCallback(
		3,
		'monthly',
		(currentDate: Date) => {
			$teams.map((team) => {
				for (const employee of team.employees) {
					const salary = employee.salary;
					const name = employee.fullName;

					cash.add(name, -salary);
				}
			});

			get(buildings).map((b) => buildingRunStep(b, currentDate));
			buildings.refresh();
		},
		true
	);

	time.registerCallback(
		4,
		'hourly',
		(currentDate: Date) => {
			checkBankruptcy();

			get(gameProjects).map((g) => runStep(g, currentDate));
			gameProjects.refresh();

			$hardwareProjects.map((h) => Hardware.runStep(h));
			hardwareProjects.refresh();

			get(gameFeatures).map((f) => featureRunStep(f, currentDate));
			gameFeatures.refresh();
		},
		true
	);

	function checkBankruptcy() {
		const c = get(cash);

		if (c < 0) {
			goto(`${base}/${data.saveId}/bankrupt`);
		}
	}

	$: projectsInDev = $gameProjects.filter(
		(x) => x.phase < SoftwareReleaseLifeCycle.Release && x.developerId === 'MYCOMPANY'
	);

	$: projectUnderWork = $gameProjects.filter(
		(x) => x.phase <= SoftwareReleaseLifeCycle.Release && x.developerId === 'MYCOMPANY'
	);

	$: projectOnSale = $gameProjects.filter(
		(x) =>
			(x.phase === SoftwareReleaseLifeCycle.Release || x.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue) &&
			x.developerId === 'MYCOMPANY'
	);

	$: projectDiscontinued = $gameProjects.filter(
		(x) => x.phase == SoftwareReleaseLifeCycle.Discontinue && x.developerId === 'MYCOMPANY'
	);

	$: allProjectsOnSaleSortedByUnitSoldRank = $gameProjects
		.filter(
			(x) => x.phase === SoftwareReleaseLifeCycle.Release || x.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue
		)
		.sort((a, b) => b.totalUnitsSold - a.totalUnitsSold);

	$: hardwareProjectsInDev = $hardwareProjects.filter((x) => x.developerId === 'MYCOMPANY');

	$: numberFormatter = new Intl.NumberFormat($selectedLanguage, {
		notation: 'compact'
	});

	$: cashFormatter = new Intl.NumberFormat($selectedLanguage, {
		style: 'currency',
		currency: 'USD',
		notation: 'compact',
		minimumFractionDigits: 2
	});

	$: cashFormatterLong = new Intl.NumberFormat($selectedLanguage, {
		style: 'currency',
		currency: 'USD',
		notation: 'standard',
		minimumFractionDigits: 2
	});

	$: timeFormatter = new Intl.DateTimeFormat($selectedLanguage, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		hour12: true
	});

	$: timeFormatter2x = new Intl.DateTimeFormat($selectedLanguage, {
		year: 'numeric',
		month: 'short',
		day: '2-digit'
	});

	$: isThereNewNews = $newslist.filter((obj) => !obj.hasOwnProperty('seen')).length > 0;

	$: featuresBeingResearched = $gameFeatures.filter((feature) => feature.isBeingResearched);

	function exitToMainMenu() {
		goto(`${base}/`);
		saves.select(undefined);
	}
</script>

<header>
	<div
		style="display: flex;gap: 7pt;border-bottom: 1px solid var(--border-color-default);padding: 0.5rem; align-items: flex-start;">
		<Dropdown>
			<button style="width: 3rem;height: 3rem; background-color: var(--secondary-background-color)" slot="button">
				<img src={moreIcon} alt="" />
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={() => goto(`${base}/${data.saveId}/game`)}>
				<img src={gameIcon} alt="" />
				<div>{$language.CREATE_GAME}</div>
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={() => goto(`${base}/${data.saveId}/employee`)}>
				<img src={teamIcon} alt="" />
				<div>{$language.TEAM_MANAGMENT}</div>
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={() => goto(`${base}/${data.saveId}/company`)}>
				<img src={companyIcon} alt="" />
				<div>{$language.COMPANY}</div>
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={() => goto(`${base}/${data.saveId}/market`)}>
				<img src={marketIcon} alt="" />
				<div>{$language.MARKET}</div>
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={() => goto(`${base}/${data.saveId}/research`)}>
				<img src={researchIcon} alt="" />
				<div>{$language.RESEARCH}</div>
			</button>

			<button style="justify-content: flex-start;gap: 1rem;" on:click={exitToMainMenu}>
				<img src={exitIcon} alt="" />
				<div>{$language.EXIT_TO_MAIN_MENU}</div>
			</button>
		</Dropdown>

		<nav>
			<slot name="pre" />

			<div class="timecontrol">
				<button class:selected-yellow={$speed === 0} on:click={() => speed.pause()}>
					<Icon src={import("$assets/icons/icon_pause.svg?raw")} />
				</button>
				<button class:selected={$speed === 1} on:click={() => speed.play()}>
					<Icon src={import("$assets/icons/icon_play.svg?raw")} />
				</button>
				<button class:selected={$speed === 2} on:click={() => speed.fastForward()}>
					<Icon src={import("$assets/icons/icon_play2x.svg?raw")} />
				</button>
			</div>

			<div class="timecontrol-small">
				{#if $speed === 1}
					<button class:selected={true} on:click={() => speed.fastForward()}>
						<Icon src={import("$assets/icons/icon_play.svg?raw")} />
					</button>
				{:else if $speed === 2}
					<button class:selected={true} on:click={() => speed.pause()}>
						<Icon src={import("$assets/icons/icon_play2x.svg?raw")} />
					</button>
				{:else}
					<button class:selected-yellow={true} on:click={() => speed.play()}>
						<Icon src={import("$assets/icons/icon_pause.svg?raw")} />
					</button>
				{/if}
			</div>

			<button class:time disabled>
				{#if $speed === 1}
					{timeFormatter.format($time)}
				{:else if $speed === 2}
					{timeFormatter2x.format($time)}
				{:else}
					{timeFormatter.format($time)}
				{/if}
			</button>

			<button class:cash disabled title={cashFormatterLong.format($cash)}>{cashFormatter.format($cash)}</button>

			<button class={'news'} class:blink={isThereNewNews} on:click={() => goto(`${base}/${data.saveId}/news`)}>
				<Icon src={import("$assets/icons/icon_news.svg?raw")} />
			</button>

			<slot />
		</nav>
	</div>
</header>

<main style="overflow: auto;background-color: var(--primary-background-color); padding:1rem">
	{#if projectUnderWork.length === 0}
		<div
			style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 1rem;background: var(--primary-background-color) ;border-radius: 1rem;">
			<Card name="">
				<button
					class="blink"
					on:click={() => {
						goto(`${base}/${data.saveId}/game`);
					}}
					style="border: 0px;background: transparent;gap: 1rem;">
					<Icon src={import("$assets/icons/icon_game.svg?raw")} />

					<div>{$language.CREATE_A_NEW_GAME}</div>
				</button>
			</Card>
		</div>
	{/if}

	{#if featuresBeingResearched.length > 0}
		<div
			style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 1rem; background: var(--primary-background-color); border-radius: 1rem;">
			{#each featuresBeingResearched as feature}
				<a href="{base}/{data.saveId}/research" class="cardlike">
					<span class="single-line-text">{$language[feature.name]}</span>

					<div class="chip">
						<img src={researchIcon} alt="" />
						<span
							>{numberFormatter.format(feature.requiredPointsResearched)} / {numberFormatter.format(
								feature.requiredPointsToUnlock
							)}</span>
					</div>

					<Progress max={feature.requiredPointsToUnlock} value={feature.requiredPointsResearched} height={1} />
				</a>
			{/each}
		</div>
	{/if}

	{#if projectsInDev.length > 0 || hardwareProjectsInDev.length > 0}
		<div
			style="background: var(--button-color-background-hover);padding: 0.8rem;border-radius: 5px;display: inline-block; ">
			{$language.PROJECT_STATE_IN_DEVELOPMENT}:
			<span style="font-weight:600">{projectsInDev.length + hardwareProjectsInDev.length}</span>
		</div>

		<div
			style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 1rem;background: var(--primary-background-color) ;border-radius: 1rem;">
			{#each projectsInDev as game}
				<button
					class="cardlike"
					on:click={() => {
						goto(`${base}/${data.saveId}/game/${game.id}`);
					}}>
					<div style="display: flex;gap: 0.5rem;align-items: center;">
						<div
							style="display: grid;place-content: center; gap: 1ch; width: 3rem; height: 3rem; border-radius: 5px 0; color: var(--primary-foreground-color); background:var(--tertiary-background-color)">
							<div style="max-width: 2rem; max-height: 2rem;">
								<Icon src={import("$assets/icons/icon_game.svg?raw")} />
							</div>
						</div>
						<span class="single-line-text" style="font-weight: 600; margin: 0">{game.name}</span>

						{#if game.phase !== SoftwareReleaseLifeCycle.PreAlpha && game.phase !== SoftwareReleaseLifeCycle.Discontinue && game.phase !== SoftwareReleaseLifeCycle.ScheduleToDiscontinue}
							<div
								style="display: flex;gap: 0rem; background:var(--tertiary-background-color); border-radius: 0 5px; margin-left: auto;">
								<div
									style="display: flex;gap: 0rem;align-items: center; flex-direction: column; align-items:center; padding: 0 0.5rem;">
									<span>{$language.HYPE}</span>
									<span style="color: var(--text-color-normal);"
										>{new Intl.NumberFormat($selectedLanguage, {
											notation: 'compact'
										}).format(game.hype)}</span>
								</div>
								<div
									style="display: grid;place-content: center; gap: 1ch; width: 3rem; height: 3rem; border-radius: 0 5px; color: var(--primary-foreground-color); background:#252525">
									<div style="max-width: 2rem; max-height: 2rem;">
										<Icon src={import("$assets/icons/icon_megaphone.svg?raw")} />
									</div>
								</div>
							</div>
						{/if}
					</div>

					<div style="padding: 0.5rem; display:flex; gap: 0.5rem; flex-direction: column">
						{#if game.phase !== SoftwareReleaseLifeCycle.Discontinue && !(game.progress >= 1)}
							<div style="display: flex;flex-direction: column;gap: 0.5rem;">
								<small>{$language.PROJECT_PHASE}: {SoftwareReleaseLifeCycle[game.phase]} </small>

								<div style="display: flex;align-items: center;gap: 1rem;">
									<StepProgress progress={game.progress * 100} steps={3} />
								</div>
							</div>
						{/if}

						{#if game.progress >= 1}
							<div
								class="blink"
								style="
								background-color: var(--tertiary-background-color);
								border: 1px solid var(--secondary-background-color);
								border-radius: 0.25rem;
								padding: 0.5rem;
								text-align: center;
								text-decoration: none;
								color: inherit;
								">
								{$language.RELEASE_GAME}
							</div>
						{/if}

						<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
							<div
								style="border-radius: 5px; background: var(--tertiary-background-color); display:flex; flex-direction: row">
								<div style="width: 1.5rem; height:1.5rem; border-radius: 5px; background: #666">
									<Icon src={import("$assets/icons/icon_bugs.svg?raw")} />
								</div>
								<div style="padding: 0 0.5rem; text-align:center; min-width: 6ch;">
									{numberFormatter.format(game.bugs)}
								</div>
							</div>

							{#each getGameFeatureProgress(game) as [category, { level, points }]}
								<div
									style="border-radius: 5px; background: var(--tertiary-background-color); display:flex; flex-direction: row; position:relative; isolation:isolate">
									<div
										style="width: 1.5rem; height:1.5rem; border-radius: 5px; background: #666; z-index: 1; padding: 0.2rem;">
										<Icon name={category} />
									</div>
									<div
										style="width: 1.6rem;height: 1.5rem;background: rgb(102, 102, 102);display: flex;gap: 0px;flex-direction: column;position: absolute;left: 1px;border-radius: 5px;overflow: hidden;">
										<div style="width: 100%; height:100%; background: {level > 3 ? '#eee' : 'transparent'}" />
										<div style="width: 100%; height:100%; background: {level > 2 ? '#eee' : 'transparent'}" />
										<div style="width: 100%; height:100%; background: {level > 1 ? '#eee' : 'transparent'}" />
										<div style="width: 100%; height:100%; background: {level > 0 ? '#eee' : 'transparent'}" />
									</div>
									<div style="padding: 0 0.5rem; text-align:center; min-width: 6ch;">
										{numberFormatter.format(points)}
									</div>
								</div>
							{/each}
						</div>
					</div>
				</button>
			{/each}
		</div>
	{/if}

	{#if projectOnSale.length > 0}
		<div
			style="background: var(--button-color-background-hover);padding: 0.8rem;border-radius: 5px;display: inline-block;">
			{$language.ON_SALE}: <span style="font-weight:600">{projectOnSale.length} </span>
		</div>

		<div
			style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 1rem;background: var(--primary-background-color) ;;border-radius: 1rem;">
			{#each projectOnSale as game}
				<button
					class="cardlike"
					class:blink={game.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue}
					on:click={() => {
						goto(`${base}/${data.saveId}/game/${game.id}`);
					}}>
					<div style="display: flex;gap: 0.5rem;align-items: center;">
						<div style="display: flex;gap: 0rem; background:var(--tertiary-background-color); border-radius: 5px 0;">
							<div
								style="display: grid;place-content: center; gap: 1ch; width: 3rem; height: 3rem; border-radius: 5px 0; color: var(--primary-foreground-color); background:#252525">
								<div style="max-width: 2rem; max-height: 2rem;">
									<Icon src={import("$assets/icons/icon_game.svg?raw")} />
								</div>
							</div>
							{#if allProjectsOnSaleSortedByUnitSoldRank.findIndex((x) => x.name === game.name) + 1 <= 10}
								<div
									style="display: grid;place-content: center; gap: 1ch; width: 2rem; height: 3rem; border-radius: 5px 0; color: var(--primary-foreground-color); ">
									<div style="display: flex;gap: 0rem;align-items: center; flex-direction: column; align-items:center">
										<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path
												d="M7.04255 0.415554C7.23013 -0.138518 8.04687 -0.138518 8.23445 0.415554L9.60807 4.473C9.69196 4.72079 9.93255 4.88855 10.204 4.88855H14.6492C15.2562 4.88855 15.5086 5.63405 15.0175 5.97649L11.4213 8.48412C11.2017 8.63727 11.1098 8.90872 11.1937 9.15651L12.5673 13.2139C12.7549 13.768 12.0941 14.2288 11.603 13.8863L8.00681 11.3787C7.78719 11.2255 7.4898 11.2255 7.27018 11.3787L3.67398 13.8863C3.18289 14.2288 2.52213 13.768 2.70971 13.2139L4.08334 9.15651C4.16723 8.90872 4.07533 8.63727 3.85571 8.48412L0.259502 5.97649C-0.231586 5.63405 0.0207993 4.88855 0.627817 4.88855H5.07297C5.34444 4.88855 5.58503 4.72079 5.66892 4.473L7.04255 0.415554Z"
												fill="white" />
										</svg>

										<span style="color: var(--text-color-normal);"
											>{allProjectsOnSaleSortedByUnitSoldRank.findIndex((x) => x.name === game.name) + 1}</span>
									</div>
								</div>
							{/if}
						</div>

						<span class="single-line-text" style="font-weight: 600; margin: 0">{game.name}</span>

						{#if game.phase !== SoftwareReleaseLifeCycle.PreAlpha && game.phase !== SoftwareReleaseLifeCycle.Discontinue && game.phase !== SoftwareReleaseLifeCycle.ScheduleToDiscontinue}
							<div
								style="display: flex;gap: 0rem; background:var(--tertiary-background-color); border-radius: 0 5px; margin-left: auto;">
								<div
									style="display: flex;gap: 0rem;align-items: center; flex-direction: column; align-items:center; padding: 0 0.5rem;">
									<span>{$language.HYPE}</span>
									<span style="color: var(--text-color-normal);"
										>{new Intl.NumberFormat($selectedLanguage, {
											notation: 'compact'
										}).format(game.hype)}</span>
								</div>
								<div
									style="display: grid;place-content: center; gap: 1ch; width: 3rem; height: 3rem; border-radius: 0 5px; color: var(--primary-foreground-color); background:#252525">
									<div style="max-width: 2rem; max-height: 2rem;">
										<Icon src={import("$assets/icons/icon_megaphone.svg?raw")} />
									</div>
								</div>
							</div>
						{/if}
					</div>

					<div
						style="padding: 0.5rem 1rem; display: flex; gap: 1rem; flex-direction: row; justify-content: space-between;">
						<div style="display: flex; gap: 2rem">
							<div style="font-weight: 600;display: flex;flex-direction: column;">
								<span style="color: var(--text-color-normal);"
									>{new Intl.NumberFormat($selectedLanguage, {
										style: 'currency',
										currency: 'USD',
										notation: 'compact',
										minimumFractionDigits: 2
									}).format(getTotalSale(game))}</span>
								<span style="color: var(--primary-foreground-color); font-size:smaller;">{$language.REVENUE}</span>
							</div>

							<div style="font-weight: 600;display: flex;flex-direction: column;">
								<span style="color: var(--text-color-normal);"
									>{new Intl.NumberFormat($selectedLanguage, {
										notation: 'compact'
									}).format(game.totalUnitsSold)}</span>
								<span style="color: var(--primary-foreground-color); font-size:smaller;">{$language.UNITS}</span>
							</div>
						</div>

						{#if getTotalSaleLast30Days(game).range !== 1}
							{@const sales = getTotalSaleLast30Days(game)}

							<div style="font-weight: 600;display: flex;flex-direction: column;">
								<span
									style="color: {sales.value === 0
										? 'var(--text-color-normal)'
										: sales.value > 0
											? '#44CA96'
											: '#ff5f5f'}; text-align: right">
									{#if sales.value > 0}
										<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path
												d="M1 10L10 1M10 1V7.75M10 1H3.25"
												stroke="#44CA96"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round" />
										</svg>
									{:else if sales.value < 0}
										<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
											<path
												d="M1 1L10 10M10 10V3.25M10 10H3.25"
												stroke="#ff5f5f"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round" />
										</svg>
									{/if}

									{new Intl.NumberFormat($selectedLanguage, {
										style: 'percent',
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
										signDisplay: 'always'
									}).format(sales.value / 100)}</span>

								{#if sales.range === 7}
									<span style="color: var(--primary-foreground-color); font-size:smaller; "
										>{$language.VS_LAST_WEEK}</span>
								{:else if sales.range === 30}
									<span style="color: var(--primary-foreground-color); font-size:smaller; "
										>{$language.VS_LAST_30_DAYS}</span>
								{/if}
							</div>
						{/if}
					</div>

					<GraphNew data={game.salesData} />
				</button>
			{/each}
		</div>
	{/if}

	{#if projectDiscontinued.length > 0}
		<div
			style="background: var(--button-color-background-hover);padding: 0.8rem;border-radius: 5px;display: inline-block;">
			{$language.DISCONTINUED}: <span style="font-weight:600">{projectDiscontinued.length}</span>
		</div>

		<div
			style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 1rem;background: var(--primary-background-color) ;;border-radius: 1rem;">
			{#each projectDiscontinued as game}
				<button
					class="cardlike"
					on:click={() => {
						goto(`${base}/${data.saveId}/game/${game.id}`);
					}}>
					<div style="display: flex;gap: 0.5rem;align-items: center;">
						<div style="display: flex;gap: 0rem; background:var(--tertiary-background-color); border-radius: 5px 0;">
							<div
								style="display: grid;place-content: center; gap: 1ch; width: 3rem; height: 3rem; border-radius: 5px 0; color: var(--primary-foreground-color); background:#252525">
								<div style="max-width: 2rem; max-height: 2rem;">
									<Icon src={import("$assets/icons/icon_game.svg?raw")} />
								</div>
							</div>
						</div>

						<span class="single-line-text" style="font-weight: 600; margin: 0">{game.name}</span>

						{#if game.distributionMethod === 'Publisher'}
							<span style="margin-left: auto; margin-right: 1rem;"
								>{$language.DISCONTINUED_DUE_TO_LOW_SALE_FIGURES}</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{/if}
</main>

<style>
	nav div {
		display: flex;
		gap: 7pt;
		border-radius: 0.5rem;
		border: 1px solid var(--border-color-default);
	}

	nav .news {
		height: 3rem;
		width: 3rem;
		margin: 0;
		white-space: nowrap;
	}

	nav button.time {
		height: 3rem;
		margin: 0;
		white-space: nowrap;
		min-width: 24ch;
	}

	nav div > button {
		margin: 0;
		padding: 0.8em;
		border: 0;
		width: 3rem;
		height: 3rem;
		background-color: transparent;
	}
	nav .selected {
		background-color: #cbe4f4;
		color: #2e95d3;
	}

	nav .selected-yellow {
		background-color: #fceacd;
		color: #f4ac36;
	}

	nav {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 0.5rem;
		border-radius: 3px;
		background-color: var(--primary-background-color);
		flex-wrap: wrap;
	}

	nav > * {
		background-color: var(--secondary-background-color);
	}

	nav button.cash {
		height: 3rem;
	}

	nav .timecontrol-small {
		display: none;
	}
	
	@media screen and (max-width: 600px) {
		nav .timecontrol {
			display: none;
		}
		nav .timecontrol-small {
			display: flex;
		}
	}
</style>
