<script lang="ts">
	import GraphNew from '$lib/components/Graph.svelte';
	import { SoftwareReleaseLifeCycle } from '$lib/ts/enums/SoftwareReleaseLifeCycle';
	import { cash, language, selectedLanguage } from '$lib/ts/stores/Stores';
	import Button from '$lib/components/Button.svelte';
	import type { Publisher } from '$lib/ts/interfaces/Publisher';
	import StepProgress from '$lib/components/StepProgress.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import Card from '$lib/components/Card.svelte';
	import { Random } from '$lib/ts/namespaces/Random';
	import { gameProjects, publishers } from '$lib/ts/stores/Stores';
	import { goto } from '$app/navigation';
	import type { Advertising } from '$lib/ts/interfaces/Advertising';
	import { get } from 'svelte/store';
	import { platforms } from '$lib/ts/stores/Stores';
	import type { LayoutData } from './$types';
	import backIcon from '$lib/assets/icons/icon_back.svg';
	import { base } from '$app/paths';
	import { addAdvertising, discontinueGame, getGameFeatureProgress, getTotalSaleLast30Days, getTotalSale } from '$lib/ts/classes/Game';

	export let data: LayoutData;

	$: game = $gameProjects.find((game) => game.id === data.gameId);
	$: graphCount = 12;

	const options: any = {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	};

	$: dateTimeFormatter = new Intl.DateTimeFormat($selectedLanguage, options);

	$: allPlatforms = get(platforms).filter((p) => game.platformIds.includes(p.id));
	const publisherlist: Publisher[] = get(publishers);

	let reachType: 'local' | 'national' | 'international' = 'local';

	const reachToScaleMap = <Record<'local' | 'national' | 'international', number>>{
		local: 1,
		national: 10,
		international: 100
	};

	$: reachScale = reachToScaleMap[reachType];

	let slots: number = 1;

	$: advertisingCampaignList = <Advertising[]>[
		{
			type: $language.ADVERTISING_TV_Commercials,
			costPerSlot: Random.RangeInt(1000, 10000) * reachScale
		},
		{
			type: $language.ADVERTISING_Magazine_Ads,
			costPerSlot: Random.RangeInt(500, 1000) * reachScale
		},
		{
			type: $language.ADVERTISING_Newspapers_Ads,
			costPerSlot: Random.RangeInt(100, 2000) * reachScale
		},
		{
			type: $language.ADVERTISING_In_Store_Demos,
			costPerSlot: Random.RangeInt(100, 10000) * reachScale
		},
		{
			type: $language.ADVERTISING_Billboards,
			costPerSlot: Random.RangeInt(100, 1000) * reachScale
		},
		{
			type: $language.ADVERTISING_Bus_Ads,
			costPerSlot: Random.RangeInt(80, 2000) * reachScale
		}
	];

</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
</header>

{#if game}
	<main>
		<h1>{game.name}</h1>

		{#if game.phase === SoftwareReleaseLifeCycle.Release}
			<div style="margin: 0.5rem 0px;display: flex;gap: 1rem;padding: 1rem 0;align-items: center;">
				<Button
					variant="warning"
					on:click={() => {
						discontinueGame(game);
						goto(`${base}/${data.saveId}/`);
					}}
					disabled={game.distributionMethod === 'Publisher'}>{$language.DISCONTINUE}</Button>

				{#if game.distributionMethod === 'Publisher'}
					<span
						>{$language.DUE_TO_CONTRACT_AGREEMENT_WITH_THE_PUBLISHER_YOU_CANT_DISCONTINUE_THE_GAME_ONLY_THE_PUBLISHER_CAN}</span>
				{/if}
			</div>
		{/if}

		{#if game.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue}
			<div style="margin: 0.5rem 0px;display: flex;gap: 1rem;padding: 1rem 0;align-items: center;">
				{#if game.distributionMethod === 'Publisher'}
					<span>{$language.THIS_GAME_WILL_BE_SOON_DISCONTINUED_DUE_TO_LOW_SALE_FIGURES}</span>
				{/if}
			</div>
		{/if}

		<div style="display: flex;gap: 3rem; flex-wrap: wrap;">
			<div style="margin: 0.5rem 0;">
				<label style="margin-bottom: 0.5rem;" for="">{$language.PROJECT_STATE}</label>

				{#if game.phase === SoftwareReleaseLifeCycle.Alpha || game.phase === SoftwareReleaseLifeCycle.Beta || game.phase === SoftwareReleaseLifeCycle.PreAlpha}
					<p>{$language.PROJECT_STATE_IN_DEVELOPMENT}</p>
				{:else if game.phase === SoftwareReleaseLifeCycle.Release}
					<p>{$language.PROJECT_STATE_RELEASED_TO_MARKET}</p>
				{:else if game.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue}
					<p>{$language.PROJECT_STATE_SCHEDULED_TO_BE_DISCONTINUED}</p>
				{:else if game.phase === SoftwareReleaseLifeCycle.Discontinue}
					<p>{$language.PROJECT_STATE_DISCONTINUED}</p>
				{/if}
			</div>

			<div style="margin: 0.5rem 0;">
				<label style="margin-bottom: 0.5rem;" for="">{$language.PLATFORM}</label>
				<p>{allPlatforms.map((x) => x.name).join(',')}</p>
			</div>

			<div style="margin: 0.5rem 0;">
				<label style="margin-bottom: 0.5rem;" for="">{$language.GENRE}</label>
				<p>{game.genres.join(',')}</p>
			</div>

			{#if game.phase === SoftwareReleaseLifeCycle.Release || game.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue || game.phase === SoftwareReleaseLifeCycle.Discontinue}
				<div style="margin: 0.5rem 0;">
					<label style="margin-bottom: 0.5rem;" for="">{$language.RELEASE_DATE}</label>
					<p>{dateTimeFormatter.format(game.releaseDate)}</p>
				</div>

				<div style="margin: 0.5rem 0;">
					<label for="">{$language.GAME_COST_PER_UNIT}</label>
					<p>${game.unitcost} ({game.distributionMedia})</p>
				</div>

				<div style="margin: 0.5rem 0;">
					<label for="">{$language.PUBLISHER}</label>

					{#if game.distributionMethod === 'Publisher'}
						<p>
							{publisherlist.find((x) => x.id === game.publisherId).name}
						</p>
						<p>
							{$language.PUBLISHERS_ROYALTIES}: ({(game.publisherRoyalies * 100).toFixed(1)}%)
						</p>
					{:else}
						<p>{$language.SELF_PUBLISHED}</p>
					{/if}
				</div>

				<div style="margin: 0.5rem 0;">
					<label style="margin-bottom: 0.5rem;" for="">{$language.GAME_PRICE} ($)</label>
					<input
						type="number"
						bind:value={game.price}
						min={game.unitcost}
						step="1"
						disabled={game.distributionMethod === 'Publisher'} />
					{#if game.distributionMethod === 'Publisher'}
						<p>{$language.PUBLISHER_CONTROLS_THE_PRICE}</p>
					{/if}
				</div>
			{/if}
		</div>

		{#if game.phase === SoftwareReleaseLifeCycle.Alpha || game.phase === SoftwareReleaseLifeCycle.Beta || game.phase === SoftwareReleaseLifeCycle.PreAlpha}
			<div style="margin: 0.5rem 0;">
				<div style="display:flex; gap: 0.5rem; flex-direction: column">
					{#if !(game.progress >= 1)}
						<div style="display: flex;flex-direction: column;gap: 0.5rem;">
							<small>{$language.PROJECT_PHASE}: {SoftwareReleaseLifeCycle[game.phase]} </small>

							<div style="display: flex;align-items: center;gap: 1rem;">
								<StepProgress progress={game.progress * 100} steps={3} />
							</div>
						</div>
					{/if}

					{#if game.progress >= 1}
						<Button
							variant="primary"
							grow={true}
							on:click={() => {
								goto(`${base}/${data.saveId}/game/${data.gameId}/distribution`);
							}}>{$language.RELEASE_GAME}</Button>
					{/if}

					<div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
						<div
							style="border-radius: 5px; background: var(--tertiary-background-color); display:flex; flex-direction: row">
							<div style="width: 1.5rem; height:1.5rem; border-radius: 5px; background: #666">
								<Icon src={import("$assets/icons/icon_bugs.svg?raw")} />
							</div>
							<div style="padding: 0 0.5rem; text-align:center; min-width: 6ch;">
								{game.bugs}
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
									<div
										style="width: 100%; height:100%; background: {level > 3
											? '#eee'
											: 'transparent'}" />
									<div
										style="width: 100%; height:100%; background: {level > 2
											? '#eee'
											: 'transparent'}" />
									<div
										style="width: 100%; height:100%; background: {level > 1
											? '#eee'
											: 'transparent'}" />
									<div
										style="width: 100%; height:100%; background: {level > 0
											? '#eee'
											: 'transparent'}" />
								</div>
								<div style="padding: 0 0.5rem; text-align:center; min-width: 6ch;">
									{points.toFixed(0)}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		<div style="display: flex; gap: 1rem; flex-direction: column">
			{#if game.phase !== SoftwareReleaseLifeCycle.PreAlpha && game.phase !== SoftwareReleaseLifeCycle.Discontinue}
				<h2>{$language.ADVERTISING_CAMPAIGN}</h2>
				<div style="display: flex; justify-content: space-between;">
					<select bind:value={reachType}>
						<option value="local">{$language.LOCAL}</option>
						<option value="national">{$language.NATIONAL}</option>
						<option value="international">{$language.INTERNATIONAL}</option>
					</select>

					<div
						style="display: flex; gap: 0rem; background: var(--tertiary-background-color); border-radius: 5px; margin-left: auto;">
						<div
							style="display: flex;gap: 0rem;align-items: center; flex-direction: row; align-items:center; padding: 0 0.5rem;">
							<span
								>{$language.HYPE}: {new Intl.NumberFormat($selectedLanguage, {
									notation: 'compact'
								}).format(game.hype)}</span>
						</div>
					</div>
				</div>

				{#if game.ads.length > 0}
					<h3>{$language.ACTIVE_CAMPAIGN}</h3>
					<div
						style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 1rem;">
						{#each game.ads as ad}
							<Card name={ad.type}>
								<div>
									<div>{$language.NUMBER_OF_SLOTS}: {ad.slots}</div>

									<StepProgress progress={1 * 100} steps={ad.slots} />
								</div>
							</Card>
						{/each}
					</div>
				{/if}

				<span>{$language.NUMBER_OF_ADVERTISING_SLOTS_TO_BUY}: {slots}</span>
				<input type="range" min={1} max={30} bind:value={slots} />

				<div
					style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 1rem;">
					{#each advertisingCampaignList as ad}
						<Card name={ad.type}>
							<div slot="action" style="margin:0; margin-left:auto; ">
								<Button
									variant="primary"
									on:click={() => {
										if (game) {
											addAdvertising(game, ad, slots);
											gameProjects.refresh();
										}
									}}
									disabled={ad.costPerSlot * slots > $cash}>{$language.BUY}</Button>
							</div>

							<div>
								<div>
									{$language.COST_OF_AD}:
									<b
										>{new Intl.NumberFormat($selectedLanguage, {
											style: 'currency',
											currency: 'USD',
											notation: 'compact'
										}).format(ad.costPerSlot * slots)}</b>
								</div>
							</div>
						</Card>
					{/each}
				</div>
			{/if}
		</div>

		{#if game.phase === SoftwareReleaseLifeCycle.Release || game.phase === SoftwareReleaseLifeCycle.ScheduleToDiscontinue || game.phase === SoftwareReleaseLifeCycle.Discontinue}
			<div style="margin: 0.5rem 0;">
				<h2 style="margin-bottom: 0.5rem;">{$language.GAME_SALES}</h2>

				<div
					style="padding: 0.5rem 1rem; display: flex; gap: 1rem; flex-direction: row; justify-content: space-between; flex-grow: 1;">
					<div style="display: flex; gap: 2rem">
						<div style="font-weight: 600;display: flex;flex-direction: column;">
							<span style="color: var(--text-color-normal);"
								>{new Intl.NumberFormat($selectedLanguage, {
									style: 'currency',
									currency: 'USD',
									notation: 'compact',
									minimumFractionDigits: 2
								}).format(getTotalSale(game))}</span>
							<span style="color: var(--primary-foreground-color); font-size:smaller;"
								>{$language.REVENUE}</span>
						</div>

						<div style="font-weight: 600;display: flex;flex-direction: column;">
							<span style="color: var(--text-color-normal);"
								>{new Intl.NumberFormat($selectedLanguage, {
									notation: 'compact'
								}).format(game.totalUnitsSold)}</span>
							<span style="color: var(--primary-foreground-color); font-size:smaller;"
								>{$language.UNITS}</span>
						</div>
					</div>

					<select bind:value={graphCount}>
						<option value={12} selected>{$language.LAST_YEAR}</option>
						<option value={12 * 5}>{$language.LAST_5_YEAR}</option>
						<option value={12 * 10}>{$language.LAST_10_YEAR}</option>
						<option value={0}>{$language.ALL_TIME}</option>
					</select>

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
									<svg
										width="11"
										height="11"
										viewBox="0 0 11 11"
										fill="none"
										xmlns="http://www.w3.org/2000/svg">
										<path
											d="M1 10L10 1M10 1V7.75M10 1H3.25"
											stroke="#44CA96"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round" />
									</svg>
								{:else if sales.value < 0}
									<svg
										width="11"
										height="11"
										viewBox="0 0 11 11"
										fill="none"
										xmlns="http://www.w3.org/2000/svg">
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

				<div style="overflow:hidden; padding: 0; margin: 0">
					<GraphNew detailed data={game.salesData} countvalue={graphCount} />
				</div>
			</div>
		{/if}
	</main>
{/if}
