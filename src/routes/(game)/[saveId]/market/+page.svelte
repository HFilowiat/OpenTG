<script lang="ts">
	import { SoftwareReleaseLifeCycle } from '$lib/ts/enums/SoftwareReleaseLifeCycle';
	import Icon from '$lib/components/Icon.svelte';
	import { language, selectedLanguage, time } from '$lib/ts/stores/Stores';
	import { gameProjects, publishers } from '$lib/ts/stores/Stores';
	import type { Game } from '$lib/ts/classes/Game';
	import { companies } from '$lib/ts/stores/Stores';
	import { type Platform } from '$lib/ts/classes/Platform';
	import { platforms } from '$lib/ts/stores/Stores';
	import { get } from 'svelte/store';
	import { arc, pie, scaleOrdinal, quantize, map } from 'd3';
	import backIcon from '$lib/assets/icons/icon_back.svg';

	$: allProjectsOnSaleSortedByUnitSoldRank = $gameProjects
		.filter((x) => x.phase === SoftwareReleaseLifeCycle.Release)
		.sort((a, b) => b.totalUnitsSold - a.totalUnitsSold)
		.slice(0, 10);

	const allplatforms = get(platforms).filter((p) => p.releaseDate < $time);
	$: allplatformsSortedByUnitSoldRank = allplatforms.sort((a, b) => b.unitsold - a.unitsold);

	function getPlatforms(game: Game) {
		const allplatforms = get(platforms);

		return allplatforms.reduce((list, p: Platform) => {
			if (game.platformIds.includes(p.id)) {
				list.push(p);
			}

			return list;
		}, []);
	}

	function getPublisher(game: Game) {
		return get(publishers).filter((x) => x.id === game.publisherId)[0];
	}

	$: dateTimeFormatter = new Intl.DateTimeFormat($selectedLanguage, {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});

	$: numberFormatter = new Intl.NumberFormat($selectedLanguage, {
		notation: 'compact'
	});

	$: playerCompany = $companies.find((company) => company.owner === 'player');

	let element;
	$: width = 300;
	let height = 300;

	$: genreUnitSoldMap = $gameProjects
		.filter((x) => x.phase === SoftwareReleaseLifeCycle.Release)
		.reduce((map, game) => {
			const genre = game.genres[0];

			if (map.get(genre)) {
				map.set(genre, map.get(genre) + game.totalUnitsSold);
			} else {
				map.set(genre, game.totalUnitsSold);
			}

			return map;
		}, new Map());

	$: totalUnitSold = [...genreUnitSoldMap.values()].reduce((sum, value) => (sum += value));

	$: myData = [...genreUnitSoldMap.entries()].map(([genre, units]) => ({
		type: genre,
		value: units / totalUnitSold
	}));

	$: bestGenre = myData.sort((a, b) => b.value - a.value)[0];

	function customColor(t: number): string {
		if (t <= 0.1) {
			return '#C6B0E7';
		}

		if (t <= 0.2) {
			return '#F382A4';
		}

		if (t <= 0.3) {
			return '#BFD28B';
		}

		if (t <= 0.4) {
			return '#F4A677';
		}

		if (t <= 0.5) {
			return '#FAE072';
		}

		if (t <= 0.6) {
			return '#BACDDC';
		}

		return '#fff';
	}

	$: colorScale = scaleOrdinal().range(quantize((t) => customColor(t), myData.length));

	const pieGenerator = pie().value((d) => d.value);

	$: pieData = pieGenerator(myData);

	$: arcGenerator = arc()
		.innerRadius(Math.min(width, height) * 0.45)
		.outerRadius(Math.min(width, height) * 0.39)
		.padAngle(0.03)
		.cornerRadius(4);

	let buttons = [];
	let pies = [];
</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
</header>

<main>
	<h2>{$language.BEST_SELLING_GAME_GENRES}</h2>

	<div style="display: flex;gap: 1rem; flex-wrap: wrap; align-items: flex-start;">
		<div style="display: grid;grid-template-columns: 1fr 1fr;gap: 0.25rem; align-content: center;">
			{#each myData as d, i}
				<button
					style="border: 0px;align-items: center;justify-content: start;padding: 0.5rem; gap: 0.5rem;"
					bind:this={buttons[i]}
					on:mouseenter={pies[i]?.classList.add('highlight')}
					on:mouseleave={pies[i]?.classList.remove('highlight')}>
					<div class="strip" style="background-color: {colorScale(d.type)};"></div>
					<div style="display: flex;flex-direction: column;align-items: flex-start;">
						<span class="label">{d.type}</span>
						<div>
							{(d.value * 100).toFixed(2)}%
						</div>
					</div>
				</button>
			{/each}
		</div>

		<div class="chart-container" bind:clientWidth={width}>
			{#if width}
				<svg {width} {height}>
					<g bind:this={element} transform="translate({width / 2} {height / 2})">
						{#each pieData as d, i (d.data.type)}
							<path
								on:mouseenter={buttons[i]?.classList.add('highlight')}
								on:mouseleave={buttons[i]?.classList.remove('highlight')}
								bind:this={pies[i]}
								class={i}
								pointer-events="all"
								cursor="pointer"
								d={arcGenerator(d)}
								fill={colorScale(d.data.type)}
								stroke={colorScale(d.data.type)} />
						{/each}
					</g>
					<!-- chart title -->
					<g transform="translate({width / 2} {height / 2})">
						<text x="0" y="-1.0em" font-weight="bold" text-anchor="middle" font-size="1.5em" class="fill-text"
							>{bestGenre?.type}</text>

						<text x="0" y="0.5em" font-weight="bold" text-anchor="middle" font-size="2em" class="fill-text"
							>{(bestGenre?.value * 100).toFixed(2)}%</text>

						<text x="0" y="3.0em" font-weight="bold" text-anchor="middle" font-size="1em" class="fill-text"
							>{$language.MARKET_SHARE}</text>
					</g>
				</svg>
			{/if}
		</div>
	</div>

	<h2>{$language.BEST_SELLING_GAMES_OF_ALL_TIME_INCLUDES_ALL_PLATFORMS}</h2>

	<div
		style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 1rem;background: var(--primary-background-color) ;border-radius: 1rem;">
		{#each allProjectsOnSaleSortedByUnitSoldRank as game, i}
			<button class="cardlike" style="flex-direction:row">
				<div style="display: flex;gap: 0.5rem; justify-content: space-between; flex-direction:column">
					<div
						style="display: grid;place-content: center;gap: 1ch;width: 3rem;height: 3rem;border-radius: 5px 0px;color: var(--primary-foreground-color);font-size: 1.5rem;font-weight: 700;">
						{i + 1}
					</div>

					{#if game.developerId === 'MYCOMPANY'}
						<div
							style="display: grid;place-content: center; gap: 1ch; width: 2.5rem; height: 2.5rem; border-radius: 0px 5px; color: var(--primary-foreground-color); background:var(--tertiary-background-color)">
							<div style="width: 1rem; height: 1rem;">
								<Icon src={import('$assets/icons/icon_inhouse.svg?raw')} />
							</div>
						</div>
					{/if}
				</div>

				<div
					style="display: flex;width: 100%;justify-content: space-between;flex-direction: column;padding: 0.75rem;gap: 0.25rem;">
					<div style="display: flex;gap: 0.5rem;align-items: center;width: 100%;justify-content: space-between;">
						<span style="font-weight: 600; margin: 0">{game.name}</span>
						<span style="font-weight: 600; margin: 0"
							>{numberFormatter.format(game.totalUnitsSold)} {$language.UNITS}</span>
					</div>

					<div style="display: flex;gap: 0.5rem;align-items: center;">
						<small style="font-weight: 600; margin: 0"
							>{game.developerId === 'MYCOMPANY' ? playerCompany.name : game.developerId}</small>
					</div>

					<div style="display: flex;gap: 0.5rem;align-items: center;">
						<small style="font-weight: 600; margin: 0">{game.genres.join(',')}</small>
					</div>

					<div style="display: flex;gap: 0.5rem;align-items: center;">
						<div style="display: flex;gap: 0.5rem;align-items: center;width: 100%;justify-content: space-between;">
							<small style="font-weight: 600; margin: 0"
								>{getPlatforms(game)
									.map((p) => p.name)
									.join(', ')}, {game.publisherId === 'SELF'
									? game.developerId === 'MYCOMPANY'
										? playerCompany?.name
										: game.developerId
									: getPublisher(game).name}</small>
							<small style="font-weight: 600; margin: 0">{dateTimeFormatter.format(game.releaseDate)}</small>
						</div>
					</div>
				</div>
			</button>
		{/each}
	</div>

	<h2>{$language.TOP_PLATFORMS}</h2>
	<div
		style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 1rem;background: var(--primary-background-color) ;border-radius: 1rem;">
		{#each allplatformsSortedByUnitSoldRank as platform, i}
			<button class="cardlike" style="flex-direction:row">
				<div style="display: flex;gap: 0.5rem; justify-content: space-between; flex-direction:column">
					<div
						style="display: grid;place-content: center;gap: 1ch;width: 3rem;height: 3rem;border-radius: 5px 0px;color: var(--primary-foreground-color);font-size: 1.5rem;font-weight: 700;">
						{i + 1}
					</div>
				</div>

				<div
					style="display: flex;width: 100%;justify-content: space-between;flex-direction: column;padding: 0.75rem;gap: 0.25rem;">
					<div style="display: flex;gap: 0.5rem;align-items: center;width: 100%;justify-content: space-between;">
						<span style="font-weight: 600; margin: 0">{platform.name}</span>
						<span style="font-weight: 600; margin: 0"
							>{numberFormatter.format(platform.unitsold)}
							{$language.UNITS}</span>
					</div>

					<div style="display: flex;gap: 0.5rem;align-items: center;">
						<div style="display: flex;gap: 0.5rem;align-items: center;width: 100%;justify-content: end;">
							<small style="font-weight: 600; margin: 0">{dateTimeFormatter.format(platform.releaseDate)}</small>
						</div>
					</div>
				</div>
			</button>
		{/each}
	</div>
</main>

<style>
	span.label {
		color: var(--primary-foreground-color);
		font-size: small;
	}

	.fill-text {
		fill: #fff;
	}

	:not(path).highlight {
		outline: 4px solid #fff;
	}

	path.highlight {
		stroke-width: 6px;
	}

	.strip {
		width: 0.5rem;
		height: 100%;
		border-radius: 0.5rem;
	}

	.chart-container {
		display: flex;
		width: min(100%, 400px);
	}
</style>
