<script lang="ts">
	import { Utility } from '$lib/ts/namespaces/Utility';
	import backIcon from '$lib/assets/icons/icon_back.svg';
	import researchIcon from '$lib/assets/icons/icon_research.svg';
	import floppyIcon from '$lib/assets/icons/icon_floppy.svg';
	import memoryIcon from '$lib/assets/icons/icon_memory.svg';
	import processorIcon from '$lib/assets/icons/icon_processor.svg';
	import { gameFeatures, language, selectedLanguage } from '$lib/ts/stores/Stores';
	import { isFeatureResearched, isFeatureRevealed, type Feature } from '$lib/ts/classes/Feature';
	import Progress from '$lib/components/Progress.svelte';
	import * as d3 from 'd3';
	import { onMount } from 'svelte';

	$: aboluteList = $gameFeatures.map((item) => {
		const padding = 0;
		const vGap = 20;
		const hGap = 120;
		const minWidth = 500;
		const minHeight = 220;
		const x = padding + item.gridX * minWidth + item.gridX * hGap;
		const y = padding + item.gridY * minHeight + item.gridY * vGap;
		const width = minWidth;
		const height = minHeight;

		return { x, y, width, height, feature: item };
	});

	$: lastItemX = aboluteList.sort((a, b) => b.x - a.x)[0];
	$: lastItemY = aboluteList.sort((a, b) => b.y - a.y)[0];

	$: padding = 160;
	$: contraintHeight = (lastItemY?.y + lastItemY?.height + padding) | +Infinity;
	$: constraintWidth = (lastItemX?.x + lastItemX?.width + padding) | +Infinity;

	function toggleResearchFeature(feature: Feature) {
		feature.isBeingResearched = !feature.isBeingResearched;
		gameFeatures.refresh();
	}

	$: numberFormatter = new Intl.NumberFormat($selectedLanguage, {
		notation: 'compact'
	});

	let svgElement;
	let group;

	$: width = 100;
	$: height = 100;

	onMount(() => {
		const zoom = d3
			.zoom()
			.scaleExtent([0.25, 1])
			.translateExtent([
				[-160, -360],
				[constraintWidth, contraintHeight]
			])
			.on('zoom', zoomed);

		function zoomed({ transform }) {
			d3.select(group).attr('transform', transform);
		}

		const svg = d3
			.select(svgElement)
			.attr('width', width)
			.attr('height', height)
			.attr('viewBox', [0, 0, width, height]);

		svg.call(zoom).call(zoom.transform, d3.zoomIdentity);
		zoom.translateBy(svg, 40, 100);
		zoom.scaleTo(svg, 0.5);
	});

	$: {
		d3.select(svgElement).attr('width', width).attr('height', height).attr('viewBox', [0, 0, width, height]);
	}

	function disablePinchZoom(event) {
		const { ctrlKey } = event;
		if (ctrlKey) {
			event.preventDefault();
			return;
		}
	}
</script>

<header class="back">
	<a href="javascript:history.back()" class="back">
		<img src={backIcon} alt="" />
		<span>{$language.BACK}</span>
	</a>
</header>

<svelte:window bind:innerWidth={width} bind:innerHeight={height} on:wheel|nonpassive={disablePinchZoom} />

<svg bind:this={svgElement} xmlns="http://www.w3.org/2000/svg" style="pointer-events: all;">
	<g bind:this={group}>
		<marker
			id="link-marker"
			viewBox="0 0 24 24"
			refX="12"
			refY="12"
			markerUnits="strokeWidth"
			markerWidth="3"
			markerHeight="3"
			orient="auto">
			<circle class="marker" cx={12} cy={12} r="12" />
		</marker>

		<marker
			id="link-marker-highlight"
			viewBox="0 0 24 24"
			refX="12"
			refY="12"
			markerUnits="strokeWidth"
			markerWidth="3"
			markerHeight="3"
			orient="auto">
			<circle class="marker highlight" cx={12} cy={12} r="12" />
		</marker>

		{#each aboluteList as item, i}
			{@const column = i === 1 ? 2 : 1}

			<foreignObject x={item.x} y={item.y} width={item.width} height={item.height}>
				{#if isFeatureRevealed(item.feature)}
					<button
						on:mouseenter={() => (item.hover = true)}
						on:mouseleave={() => (item.hover = false)}
						class="node"
						on:click={() => toggleResearchFeature(item.feature)}
						disabled={isFeatureResearched(item.feature)}
						class:beingResearched={item.feature.isBeingResearched}>
						<div style="font-size: small;">{$language[item.feature.name]}</div>
						<div>{$language[item.feature.description]}</div>

						{#if isFeatureResearched(item.feature) === false}
							<div class="chip">
								<img src={researchIcon} alt="" />
								<span
									>{numberFormatter.format(item.feature.requiredPointsResearched)} / {numberFormatter.format(
										item.feature.requiredPointsToUnlock
									)}</span>
							</div>

							{#if item.feature.isBeingResearched && item.feature.requiredPointsResearched > 0}
								<Progress
									max={item.feature.requiredPointsToUnlock}
									value={item.feature.requiredPointsResearched}
									height={1} />
							{/if}
						{:else}
							<div style="display: flex; gap: 0.5rem">
								<div class="chip">
									<img src={processorIcon} alt="" />
									<span>{item.feature.requirements.graphics} GP</span>
								</div>

								<div class="chip">
									<img src={processorIcon} alt="" />
									<span>{item.feature.requirements.processing} PP</span>
								</div>

								<div class="chip">
									<img src={memoryIcon} alt="" />
									<span>{Utility.formatBytes(item.feature.requirements.memory)}</span>
								</div>

								<div class="chip">
									<img src={floppyIcon} alt="" />
									<span>{Utility.formatBytes(item.feature.requirements.storage)}</span>
								</div>
							</div>
						{/if}
					</button>
				{:else}
					<button class="node" on:click={() => toggleResearchFeature(item.feature)} disabled={true}>
						<div style="font-size: small;">{'???'}</div>
					</button>
				{/if}
			</foreignObject>
		{/each}

		{#each aboluteList as item, i}
			{#if item.feature.dependency.length > 0 && item}
				{@const dependents = aboluteList.filter((f) => item.feature.dependency.includes(f.feature.tag))}

				{#each dependents as dependent}
					{@const rectA = dependent}
					{@const rectB = item}

					{@const padding = 20}
					{@const a = { x: rectA.x + rectA.width, y: rectA.y + padding }}
					{@const b = { x: rectB.x, y: rectB.y + padding }}
					{@const mid = { x: Math.floor((b.x + a.x) / 2), y: Math.floor((b.y + a.y) / 2) }}
					{@const markerId = rectA.hover || rectB.hover ? '#link-marker-highlight' : '#link-marker'}
					<path
						class="link"
						class:highlight={rectA.hover || rectB.hover}
						d="M{a.x} {a.y} Q{Utility.lerp(a.x, b.x, 0.3)} {a.y} {mid.x},{mid.y} Q{Utility.lerp(
							a.x,
							b.x,
							0.7
						)} {b.y} {b.x},{b.y}"
						marker-start="url({markerId})"
						marker-end="url({markerId})" />
				{/each}
			{/if}
		{/each}
	</g>
</svg>

<style>
	.marker {
		fill: var(--tertiary-background-color);
	}

	.marker.highlight {
		fill: var(--primary-foreground-color);
	}

	.node {
		border: 3px solid var(--tertiary-background-color);
		background: var(--secondary-background-color);
		border-radius: 0.5rem;
		padding: 0.5rem;
		display: flex;
		flex-direction: column;
		min-width: 200px;
		padding: 1rem;
		gap: 0.5rem;
		align-items: flex-start;
		text-align: start;
		width: 100%;
	}

	.beingResearched {
		border: 3px solid rgb(68, 143, 255);
	}

	.node:not(:disabled):hover {
		border: 3px solid var(--tertiary-foreground-color);
	}

	.link {
		stroke: var(--tertiary-background-color);
		fill: none;
		stroke-width: 3;
	}

	.link.highlight {
		stroke: var(--primary-foreground-color);
	}

	header {
		position: fixed;
		width: 100%;
		border-bottom: 1px solid var(--tertiary-background-color);
	}
</style>
