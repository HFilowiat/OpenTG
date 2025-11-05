<script lang="ts">
	import { language, selectedLanguage } from '$lib/ts/stores/Stores';
	import Card from '$lib/components/Card.svelte';
	import type { Feature } from '$lib/ts/classes/Feature';
	import { generateChipName } from '$lib/ts/classes/Generator';
	import Icon from '$lib/components/Icon.svelte';
	import { gameFeatures, hardwareFeatures, hardwareProjects } from '$lib/ts/stores/Stores';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import { get } from 'svelte/store';
	import { base } from '$app/paths';

	export let data: PageData;

	$: project = $hardwareProjects.find((hardware) => hardware.id === data.hardwareId);

	let packageType = 'dip';
	let packageTypes = { dip: 'DIP 24' };

	let currentManufactorerId = null;

	function produceProject() {
		project.manufactorerId = currentManufactorerId;

		goto(`${base}/${data.saveId}/`);
	}

	const features: Feature[] = get(gameFeatures);

	$: minInstructionNo = project.featuresIds ? features.filter((x) => project.featuresIds.includes(x.id)).length * 3 : 0;

	$: numberOfInsturction = 30 + minInstructionNo;
	let transistorCount = 40;
	let isaComplexity = 50;
	let cost = 0;
	// extraploated from 29 mm^2 / 4100 transistor
	let transistorSizeMillimeterSquared = 0.007;
	let averageInstructionPerCycle = 0;
	let dieSize = 0;
	let powerbudget = 10;
	let stability = 0;
	let tdp = 0;
	let getDiePerWafer = (d: number, S: number) => (Math.PI * (d * d)) / (4 * S) - (0.58 * (Math.PI * d)) / Math.sqrt(S);
	let yieldPercent = 0.2; 
	let waferDiameterMilimeter = 76; 

	$: {
		isaComplexity = numberOfInsturction;
		transistorCount = numberOfInsturction * 20 + numberOfInsturction * isaComplexity;
		averageInstructionPerCycle =
			project.featuresIds && project.featuresIds.length > 0
				? features
						.filter((x) => project.featuresIds.includes(x.id))
						.map((x) => x.instructionPerCycle)
						.reduce((c, p) => c + p) / project.featuresIds.length
				: 0;

		dieSize = transistorCount * transistorSizeMillimeterSquared * 1.25; // + 25 %
		// extraplated from 28 die per wafer * $100 per chip price 
		let waferCost = 2800; 
		cost = (waferCost / getDiePerWafer(waferDiameterMilimeter, dieSize)) * yieldPercent;

		tdp = dieSize;
		stability = (powerbudget * 1) / project.clockSpeed.max;
	}

	let hardwareManufactorers = [
		{ id: '000', name: 'Sentrek', productionPricePerUnit: 500, relation: 0, leadTimeInDays: 21 }
	];

	function formatFrequency(frequency) {
		if (frequency >= 1e9) {
			return (frequency / 1e9).toFixed(2) + ' GHz';
		} else if (frequency >= 1e6) {
			return (frequency / 1e6).toFixed(2) + ' MHz';
		} else if (frequency >= 1e3) {
			return (frequency / 1e3).toFixed(2) + ' kHz';
		} else {
			return frequency + ' Hz';
		}
	}

	function formatNumber(num: number, decimals: number = 2) {
		if (num === 0) return '0';

		const k = 1000;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ['', 'K', 'M', 'B', 'T'];

		const i = Math.floor(Math.log(num) / Math.log(k));

		return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

	let quantityofManufactoring = 100;

	$: currencyFormatter = new Intl.NumberFormat($selectedLanguage, {
		style: 'currency',
		currency: 'USD',
		notation: 'compact'
	});
</script>

<div class="label" style="margin-bottom: 0.5rem;">Name</div>
<div class="input-group">
	<input bind:value={project.name} placeholder={project.name} type="text" autocomplete="off" />

	<button class="dice" on:click={() => (project.name = generateChipName())}>
		<Icon src={import('$assets/icons/icon_dice.svg?raw')} />
	</button>
</div>

<div
	style="width:{waferDiameterMilimeter}px; height:{waferDiameterMilimeter}px; gap: {Math.sqrt(dieSize) * 0.02 +
		1}%; background: var(--border-color-default);border: 1px solid rgb(238, 238, 238);border-radius: 50%;display: flex;flex-wrap: wrap;overflow: hidden;">
	{#each { length: Math.floor(getDiePerWafer(waferDiameterMilimeter, dieSize)) } as _, i}
		<div
			style="margin: 0; width:{Math.sqrt(dieSize)}px; height:{Math.sqrt(
				dieSize
			)}px; background: var(--button-color-background-primary);" />
	{/each}
</div>
<div>
	<div class="label" style="margin-bottom: 0.5rem;">Die Size</div>
	<span>{dieSize.toFixed(2)}mm<sup>2</sup></span>
</div>

<div>
	<div class="label" style="margin-bottom: 0.5rem;">Wafer Size</div>
	<span>{waferDiameterMilimeter.toFixed(2)}mm</span>
</div>

<div>
	<div class="label" style="margin-bottom: 0.5rem;">Package Type</div>
	<select bind:value={packageType}>
		{#each Object.entries(packageTypes) as [type, name]}
			<option value={type}>{name}</option>
		{/each}
	</select>
</div>

<div>
	<div class="label" style="margin-bottom: 0.5rem;">Transistor Count</div>
	<div style="display: flex; gap: 0.5em; ">
		<p>~{transistorCount}</p>
	</div>
</div>

<div style="gap: 0.5rem;display: flex;flex-direction: column;align-items: flex-start;">
	<div class="label" style="margin-bottom: 0.5rem;">Estimated Production Cost / Unit</div>
	<span>{cost.toFixed(2)} USD</span>
</div>

<div>
	<div class="label" style="margin-bottom: 0.5rem;">Manufacturing Quanitity</div>
	<input type="number" bind:value={quantityofManufactoring} />
</div>

<div class="label" style="margin-bottom: 0.5rem;">Manufactureres</div>

<div
	style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr)); gap: 1rem;">
	{#each hardwareManufactorers as { id, name, productionPricePerUnit, leadTimeInDays }}
		<Card {name}>
			<div slot="action" style="margin:0; margin-left:auto; ">
				<Button
					variant="primary"
					on:click={() => {
						currentManufactorerId = id;
					}}
					disabled={currentManufactorerId === id}>{'Sign a Contract'}</Button>
			</div>

			<div>
				<div>
					Price: <b
						>{currencyFormatter.format(
							quantityofManufactoring *
								Math.min(productionPricePerUnit, Math.floor(4000 / Math.sqrt(quantityofManufactoring)))
						)}</b>
				</div>
				<div>Lead Time: <b>{leadTimeInDays} days</b></div>
			</div>
		</Card>
	{/each}
</div>

<div>
	<Button variant="primary" grow on:click={produceProject} disabled={!currentManufactorerId}
		>{$language.PRODUCE_HARDWARE}</Button>
	<Button variant="primary" grow on:click={produceProject} disabled={!currentManufactorerId}
		>{$language.PRODUCE_HARDWARE}</Button>
</div>

<style>
	div {
		margin-bottom: 1rem;
	}
</style>
