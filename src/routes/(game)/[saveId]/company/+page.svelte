<script lang="ts">
	import jobIcon from '$lib/assets/icons/icon_job.svg';
	import backIcon from '$lib/assets/icons/icon_back.svg';
	import { companies, buildings, teams, STARTING_DATE, language, selectedLanguage } from '$lib/ts/stores/Stores';
	import type { LayoutData } from '../$types';
	import { base } from '$app/paths';
	import {
		buyOrLeaseBuilding,
		buildingEndLease,
		getBuildingOfficeSpacePeople,
		getBuildingRentableSquareMeters
	} from '$lib/ts/classes/Building';

	export let data: LayoutData;

	$: playerCompanies = $companies.filter((c) => c.owner === 'player');
	$: occupiedBuildings = $buildings.filter((b) => b.isBought || b.isLeased);
	$: notOccupiedBuildings = $buildings.filter((b) => !b.isBought && !b.isLeased);

	$: currencyFormatter = new Intl.NumberFormat($selectedLanguage, {
		style: 'currency',
		currency: 'USD',
		notation: 'compact'
	});

	$: allTeams = $teams;
	$: playerCharacterTeam = allTeams.find((t) => t.employees.find((e) => e.isPlayer));
	$: playerCharacter = playerCharacterTeam?.employees.find((e) => e.isPlayer);

	$: dateTimeFormatter = new Intl.DateTimeFormat($selectedLanguage, {
		year: 'numeric',
		month: 'short'
	});
</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
</header>

<div class="container">
	<h1>{$language.COMPANIES}</h1>
	{#each playerCompanies as company}
		<div class="card">
			<div>{company.name}</div>
			<p>
				{$language.COMPANY_DESCRIPTION?.replaceAll('{FOUNDING_DATE}', dateTimeFormatter.format(STARTING_DATE))
					?.replaceAll('{CHARACTER_NAME}', playerCharacter?.fullName)
					?.replaceAll('{COMPANY_NAME}', company.name)
					?.replaceAll('{LOCATION}', company.location)}
			</p>

			<a href="{base}/{data.saveId}/employee/">{$language.MANAGE_STAFF}</a>
			<div style="display: flex; align-items: center; gap: 0.5rem">
				<span>{$language[company.type]}</span>
				<img style="filter: invert(1);" src={jobIcon} alt="" />
			</div>
		</div>
	{/each}
</div>

<div class="container">
	{#if occupiedBuildings.length > 0}
		<h1>{$language.CURRENT_PROPERTIES}</h1>
	{/if}

	{#each occupiedBuildings as building}
		<div class="card">
			{#if building.propertyState === 'Lease'}
				<div style="display: flex;gap: 0.5rem;width: 100%;justify-content: space-between;">
					<div style="display: flex;gap: 0.5rem;flex-direction: column;">
						<div>{$language.PROPERTY} {building.propertyState}</div>
						<div>
							{$language.LEASING_PRICE}: {currencyFormatter.format(building.leasingCost)}
							{$language.PER_MONTH}
						</div>
						<div>
							{$language.SIZE}: {getBuildingRentableSquareMeters(building)}
							{$language.RENTABLE_SQUARE_METER}
						</div>
						<div>{$language.OFFICE_SPACE}: {getBuildingOfficeSpacePeople(building)} {$language.PERSON}</div>

						{#if occupiedBuildings.length > 1}
							<button on:click={() => buildingEndLease(building)}>{$language.END_LEASE}</button>
						{/if}
					</div>
				</div>
			{:else if building.propertyState === 'Buy'}
				<div style="display: flex;gap: 0.5rem;width: 100%;justify-content: space-between;">
					<div style="display: flex;gap: 0.5rem;flex-direction: column;">
						<div>{$language.PROPERTY} {building.propertyState}</div>
						<div>{$language.BUYING_PRICE}: {currencyFormatter.format(building.buyingCost)}</div>
						<div>{$language.SIZE}: {getBuildingRentableSquareMeters(building)} RSM</div>
						<div>{$language.OFFICE_SPACE}: {getBuildingOfficeSpacePeople(building)} Person</div>
					</div>
				</div>
			{/if}
		</div>
	{/each}

	{#if notOccupiedBuildings.length > 0}
		<h1>{$language.AVAILABLE_PROPERTIES}</h1>
	{/if}

	{#each notOccupiedBuildings as building}
		<div class="card">
			{#if building.propertyState === 'Lease'}
				<div style="display: flex;gap: 0.5rem;width: 100%;justify-content: space-between;">
					<div style="display: flex;gap: 0.5rem;flex-direction: column;">
						<div>{$language.PROPERTY} {building.propertyState}</div>
						<div>
							{$language.LEASING_PRICE}: {currencyFormatter.format(building.leasingCost)}
							{$language.PER_MONTH}
						</div>
						<div>
							{$language.SIZE}: {getBuildingRentableSquareMeters(building)}
							{$language.RENTABLE_SQUARE_METER}
						</div>
						<div>{$language.OFFICE_SPACE}: {getBuildingOfficeSpacePeople(building)} {$language.PERSON}</div>

						<button on:click={() => buyOrLeaseBuilding(building)}>{$language.LEASE_OFFICE}</button>
					</div>
				</div>
			{:else if building.propertyState === 'Buy'}
				<div style="display: flex;gap: 0.5rem;width: 100%;justify-content: space-between;">
					<div style="display: flex;gap: 0.5rem;flex-direction: column;">
						<div>{$language.PROPERTY} {building.propertyState}</div>
						<div>{$language.BUYING_PRICE}: {currencyFormatter.format(building.buyingCost)}</div>
						<div>
							{$language.SIZE}: {getBuildingRentableSquareMeters(building)}
							{$language.RENTABLE_SQUARE_METER}
						</div>
						<div>{$language.OFFICE_SPACE}: {getBuildingOfficeSpacePeople(building)} {$language.PERSON}</div>
						<button on:click={() => buyOrLeaseBuilding(building)}>{$language.BUY_OFFICE}</button>
					</div>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.container {
		padding: 1rem;
		display: flex;
		gap: 1rem;
		flex-direction: column;
	}

	.card {
		background-color: var(--secondary-background-color);
		padding: 1rem;
		border-radius: 0.5rem;
		display: flex;
		gap: 0.5rem;
		flex-direction: column;
		align-items: flex-start;
	}
</style>
