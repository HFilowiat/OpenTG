<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import type { HardwareProject } from '$lib/ts/classes/HardwareProject';
	import { generateChipName } from '$lib/ts/classes/Generator';
	import Button from '$lib/components/Button.svelte';
	import { JobTitles } from '$lib/ts/enums/JobTitles';
	import type { Currency } from '$lib/ts/interfaces/Currency';
	import type { Feature } from '$lib/ts/classes/Feature';
	import Card from '$lib/components/Card.svelte';
	import Switch from '$lib/components/Switch.svelte';
	import { goto } from '$app/navigation';
	import {
		hardwareFeatures,
		hardwareProjects,
		language,
		teams
	} from '$lib/ts/stores/Stores';
	import type { PageData } from './$types';
	import { get } from 'svelte/store';
	import { time } from '$lib/ts/stores/Stores';
	import { base } from '$app/paths';

	export let data: PageData;

	$: noOfProject = $hardwareProjects.filter((x) => x.developerId === 'MYCOMPANY').length + 1;

	let productName = '';
	let clockSpeed = { min: 0, max: 100 };

	$: {
		clockSpeed.min = clockSpeed.min > clockSpeed.max ? clockSpeed.max : clockSpeed.min;
		clockSpeed.max = clockSpeed.max < clockSpeed.min ? clockSpeed.min : clockSpeed.max;
	}

	$: isCreateButtonDisabled =
		productName.length < 1 || skillNotInTeam.length > 0 || !isMandatoryFeaturesAreEnabled;

	$: requiredSkills = ['HardwareEngineer'];
	$: skillInTeam =
		$teams[0]?.employees.reduce((p, v) => {
			if (!p.includes(v.jobTitle)) p.push(v.jobTitle);
			return p;
		}, []) || [];
	$: skillNotInTeam = requiredSkills.filter((item) => !skillInTeam.includes(item));

	$: enabledFeaures = new Set<string>();
	$: isMandatoryFeaturesAreEnabled = enabledFeaures.has('0000');

	const features: Feature[] = get(hardwareFeatures);

	$: minInstructionNo = enabledFeaures
		? features.filter((x) => enabledFeaures.has(x.tag)).length * 3
		: 0;

	const groupBy = <T, K extends keyof any>(arr: T[], key: (i: T) => K) =>
		arr.reduce(
			(groups, item) => {
				(groups[key(item)] ||= []).push(item);
				return groups;
			},
			{} as Record<K, T[]>
		);

	$: filteredFeatures = features.filter((f) => f.releaseDate <= $time);
	$: featureGroups = groupBy(filteredFeatures, (x) => x.category);

	let hardwareType = 'cpu';
	// gpu: "GPU", ram: "RAM", hdd: "HDD"
	let hardwareTypes = { cpu: 'CPU' }; 

	let numberOfCores = 1;

	interface CPUData {
		manufacturer: string;
		lauchDate: string;
		name: string;

		core: number;
		// performance
		clockspeed: { min: number; max: number };
		// physical specifications
		package: 'DIP40' | 'DIP32' | 'DIP 28' | 'DIP24' | 'DIP16';
		transistors: number;
		dieSizeMillimetersSquared: number;
		processNodeMicrometer: number;
		// architecture
		instructionSet: string;
		numberOfInsturction: number;
		design: 'CISC' | 'RISC' | 'VLIW' | 'EPIC' | 'MISC';

		price: Currency;
		cost: Currency;
	}

	let list: CPUData[] = [
		{
			manufacturer: 'Momo',
			lauchDate: '1974-01-01',
			name: 'Momo MC68',
			core: 1,

			clockspeed: { min: 1000000, max: 2000000 },

			transistors: 4100,
			package: 'DIP40',
			dieSizeMillimetersSquared: 29.0,
			processNodeMicrometer: null,

			instructionSet: '68K',
			numberOfInsturction: 72,
			design: 'CISC',

			price: { currency: 'USD', value: 360 },
			cost: { currency: 'USD', value: 100 }
		},

		{
			manufacturer: 'MTech',
			lauchDate: '1975-01-01',
			name: 'MTech 02',
			core: 1,

			clockspeed: { min: 1000000, max: 3000000 },

			transistors: 3510,
			package: 'DIP40',
			dieSizeMillimetersSquared: 16.6,
			processNodeMicrometer: 8,

			instructionSet: '68K',
			numberOfInsturction: 56,
			design: 'CISC',

			price: { currency: 'USD', value: 25 },
			cost: { currency: 'USD', value: 4 }
		}
	];

	let waferDiameterMilimeter = 76;

	let DiePerWafer = (d: number, S: number) =>
		(Math.PI * (d * d)) / (4 * S) - (0.58 * (Math.PI * d)) / Math.sqrt(S);


	let yieldPercent = 0.2; 

	$: numberOfInsturction = 30 + minInstructionNo;
	let transistorCount = 40;
	let isaComplexity = 50;
	let cost = 0;
	// extraploated from 29 mm^2 / 4100 transistor
	let transistorSizeMilimeterSquared = 0.007;
	let averageInstructionPerCycle = 0;
	let dieSize = 0;
	let powerbudget = 10;
	let stability = 0;
	let tdp = 0;

	$: {
		isaComplexity = numberOfInsturction;
		transistorCount = numberOfInsturction * 20 + numberOfInsturction * isaComplexity;
		averageInstructionPerCycle =
			enabledFeaures && enabledFeaures.size > 0
				? features
						.filter((x) => enabledFeaures.has(x.id))
						.map((x) => x.instructionPerCycle)
						.reduce((c, p) => c + p) / enabledFeaures.size
				: 0;

		dieSize = transistorCount * transistorSizeMilimeterSquared * 1.25;
		// extrapolated from 28 die per wafer * $100 per chip price
		let waferCost = 2800; 
		cost = (waferCost / DiePerWafer(waferDiameterMilimeter, dieSize)) * yieldPercent;

		tdp = dieSize;
		stability = (powerbudget * 1) / clockSpeed.max;
	}

	function createProject(): void {
		const team = $teams[0];
		const name = productName;

		let hardware: HardwareProject = {
			name,
			teamId: team.id,
			progress: 0,
			developerId: 'MYCOMPANY',
			phase: 'Design',
			featuresIds: Array.from(enabledFeaures),
			clockSpeed,
			manufactorerId: ''
		};

		hardwareProjects.add(hardware);

		productName = '';

		goto(`${base}/${data.saveId}/`);
	}

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

</script>

<div style="display: flex; gap: 1em; padding: 0.5em; flex-direction:column">
	<div>
		<div class="label" style="margin-bottom: 0.5rem;">Name</div>
		<div class="input-group">
			<input
				bind:value={productName}
				placeholder="Project #{noOfProject}"
				type="text"
				autocomplete="off" />

			<button class="dice" on:click={() => (productName = generateChipName())}>
				<Icon src={import("$assets/icons/icon_dice.svg?raw")} />
			</button>
		</div>
	</div>

	<div>
		<div class="label" style="margin-bottom: 0.5rem;">Hardware Type</div>
		<select bind:value={hardwareType}>
			{#each Object.entries(hardwareTypes) as [type, name]}
				<option value={type}>{name}</option>
			{/each}
		</select>
	</div>

	<div style="gap: 0.5rem;display: flex;flex-direction: column;align-items: flex-start;">
		<span>Number of Instructions: {numberOfInsturction}</span>
	</div>

	<div
		style="width:{waferDiameterMilimeter}px; height:{waferDiameterMilimeter}px; gap: {Math.sqrt(dieSize) * 0.02 +
			1}%; background: var(--border-color-default);border: 1px solid rgb(238, 238, 238);border-radius: 50%;display: flex;flex-wrap: wrap;overflow: hidden;">
		{#each { length: Math.floor(DiePerWafer(waferDiameterMilimeter, dieSize)) } as _, i}
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

	<div style="display: flex;gap: 0.5em;flex-direction: row;flex-wrap: wrap;">

		<div style="gap: 0.5rem;display: flex;flex-direction: column;align-items: flex-start;">
			<div class="label" style="margin-bottom: 0.5rem;">Clock Speed</div>
			<input type="range" bind:value={clockSpeed.max} min="100000" max="1000000" />
			<span>{formatFrequency(clockSpeed.max)}</span>
		</div>

		<div style="gap: 0.5rem;display: flex;flex-direction: column;align-items: flex-start;">
			<div class="label" style="margin-bottom: 0.5rem;">Stability</div>
			<span>{stability.toFixed(3)} %</span>
		</div>

		<div style="gap: 0.5rem;display: flex;flex-direction: column;align-items: flex-start;">
			<div class="label" style="margin-bottom: 0.5rem;">Average Instructions Per Cycle</div>
			<span>{averageInstructionPerCycle}</span>
		</div>

		<div style="gap: 0.5rem;display: flex;flex-direction: column;align-items: flex-start;">
			<div class="label" style="margin-bottom: 0.5rem;">Instruction Per Second</div>
			<span>{formatNumber(clockSpeed.max * averageInstructionPerCycle)}</span>
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

	</div>

	<div class="label" style="margin-bottom: 0.5rem;">Features</div>

	{#if !isMandatoryFeaturesAreEnabled}
		<span>To create a CPU, you need to enable Integer Arithmetic feature.</span>
	{/if}

	{#each Object.entries(featureGroups) as [keyAsCategory, featurelist]}
		<span>{keyAsCategory}</span>

		<div
			style="width: 100%; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr)); gap: 1rem;">
			{#each featurelist as { id, name, category, description, points, pointScale, requiredSkill, instructionPerCycle }}
				<Card {name}>
					<div slot="action" style="margin:0; margin-left:auto; ">
						<Switch
							on:enable={() => {
								enabledFeaures.add(id);
								enabledFeaures = new Set([...enabledFeaures]);
							}}
							on:disable={() => {
								enabledFeaures.delete(id);
								enabledFeaures = new Set([...enabledFeaures]);
							}} />
					</div>

					<span>{description}</span>

					<div style="display: flex;flex-direction: column;padding: 0.5em 0;gap: 0.5em;">

						<span>Instruction Per Cycle</span>
						<span title="{1 / instructionPerCycle} Cycles for each instruction"
							>{instructionPerCycle}</span>

						<span>Required Skills</span>

						<div style="display: flex; gap:0.3em; flex-direction: row; flex-wrap: wrap;">
							{#each requiredSkill as skill}
								<span
									style="background: var(--button-color-background-hover); border-radius: 3px;display: flex; font-size:small">
									<span style="padding: 0.3em;">{[JobTitles[skill]]}</span>
								</span>
							{/each}
						</div>
					</div>
				</Card>
			{/each}
		</div>
	{/each}

	{#if skillNotInTeam.length > 0}
		<div>
			The current team is not capable of developing this project. Please ensure that the team has
			the required employees with the necessary skills.
		</div>
	{/if}

	<div style="display: flex; flex-direction:row; gap: 0.5em">
		{#if requiredSkills.length > 0}
			<span>Required Team Members: </span>
			{#each requiredSkills as skill}
				{#if skillNotInTeam.includes(skill)}
					<span
						style="background: #f004;border: 1px solid #f007; border-radius: 3px;display: flex; font-size:small">
						<span style="padding: 0.3em;">{skill}</span>
					</span>
				{:else}
					<span
						style="background: var(--button-color-background-hover); border-radius: 3px;display: flex; font-size:small">
						<span style="padding: 0.3em;">{skill}</span>
					</span>
				{/if}
			{/each}
		{/if}
	</div>

	<div style="display: flex; gap: 0.5rem;">
		<Button variant="primary" grow on:click={createProject} disabled={isCreateButtonDisabled}
			>{$language.DESIGN_HARDWARE}</Button>
		<Button variant="primary" grow on:click={createProject} disabled={isCreateButtonDisabled}
			>{$language.DESIGN_HARDWARE}</Button>
	</div>
</div>

<style>
	div.label {
		font-size: large;
		font-weight: bold;
		color: var(--primary-foreground-color);
	}
</style>
