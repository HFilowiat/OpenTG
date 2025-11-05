<script lang="ts">
	import { selectedLanguage } from '$lib/ts/stores/Stores';
	import { onMount } from 'svelte/internal';

	export let detailed: boolean = false;
	export let countvalue: number = 18;
	$: count = detailed ? countvalue : 4;

	export let data: [number, number][];

	function greatestClosestNumberDivisibleBy(a, b) {
		return a + b - (a % b);
	}

	$: LastNData = data
		.reduce((arr, c, i) => {
			if (i === 0) {
				arr.push([null, 0]);
			}
			arr.push(c);
			return arr;
		}, [])
		.slice(-count);

	$: largestData = LastNData.length > 0 ? [...LastNData].sort((a, b) => b[1] - a[1])[0][1] : 0;

	$: {
		largestData = greatestClosestNumberDivisibleBy(largestData, 3);
	}

	const axisExtrusion = 5;

	$: width = 600;
	$: height = 16 * 4;

	$: marginHorizontal = 5 * 16;
	$: axisMarginLeft = marginHorizontal / 2;

	const PREVENT_DIV_BY_ZERO = Number.MIN_VALUE;

	$: yaxis = height;

	$: points = LastNData?.map((x, i) => {
		const [dateTimestamp, value] = x;
		const step = axisMarginLeft + i * ((width - marginHorizontal) / (LastNData.length - 1));

		const inversePercent = 1 - value / (Math.abs(largestData) + PREVENT_DIV_BY_ZERO);

		const amplitude = inversePercent * height;

		return [
			[step, amplitude],
			[dateTimestamp, value]
		];
	});

	$: currencyFormatter = new Intl.NumberFormat($selectedLanguage, {
		style: 'currency',
		currency: 'USD',
		notation: 'compact'
	});

	$: dateTimeFormatter = new Intl.DateTimeFormat($selectedLanguage, {
		year: 'numeric',
		month: 'short'
	});

	let svg: SVGElement = null;
	let strokeOffset = 5 * 16;

	onMount(() => {
		const calculateDimensions = () => {
			const rect = svg.getBoundingClientRect();
			width = rect.width;
			height = rect.height;
		};

		calculateDimensions();

		window.addEventListener('resize', calculateDimensions);

		return () => {
			window.removeEventListener('resize', calculateDimensions);
		};
	});

	$: path = points
		.map((x) => x[0])
		.reduce((value, [x, y], i, array) => {
			// start from second point
			if (i === 0) {
				value += `M ${x - strokeOffset},${yaxis + strokeOffset} L${x - strokeOffset},${y} L${x}, ${y}`;
			} else if (array[i]) {
				value += `L${x},${y} `;
			}

			if (i === array.length - 1) {
				value += `L${x + strokeOffset},${y} L${x + strokeOffset},${yaxis + strokeOffset}z`;
			}

			return value;
		}, '');

	$: gridy = [yaxis - height * 1];

	$: textaxis = [
		{ x: 0, y: height * 0 - (height - yaxis), value: currencyFormatter.format(largestData) },
		{
			x: 0,
			y: height * (1 / 3) - (height - yaxis),
			value: currencyFormatter.format(largestData * (2 / 3))
		},
		{
			x: 0,
			y: height * (2 / 3) - (height - yaxis),
			value: currencyFormatter.format(largestData * (1 / 3))
		},
		{ x: 0, y: height * 1 - (height - yaxis), value: currencyFormatter.format(0) }
	];

	$: labels = points.length < 6 ? points : points.filter((x, i, arr) => i % (arr.length / 6) === 0);

	$: xaxisExtrusion = [
		{ x: 0 - axisExtrusion, y: height * 0 - (height - yaxis) },
		{ x: 0 - axisExtrusion, y: height * (1 / 3) - (height - yaxis) },
		{ x: 0 - axisExtrusion, y: height * (2 / 3) - (height - yaxis) },
		{ x: 0 - axisExtrusion, y: height * 1 - (height - yaxis) }
	];
</script>

<svg bind:this={svg} viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" version="1.1">
	{#each gridy as y}
		{#if y >= 0 && y <= height}
			<line class="grid" x1={0} x2={width} y1={y} y2={y} />
		{/if}
	{/each}

	{#each labels as [[x, y], [dateTimestamp, value]], i}
		<line class="grid" x1={x} x2={x} y1={-10} y2={height} />

		<foreignObject {x} y={-30} width="180" height="80">
			<div xmlns="http://www.w3.org/1999/xhtml" class="date-label-box">
				{#if i === 0 || new Date(labels.at(i)[1][0]).getFullYear() !== new Date(labels.at(i - 1)[1][0]).getFullYear()}
					{new Date(dateTimestamp).toLocaleString('en-US', { month: 'short', year: 'numeric' })}
				{:else}
					{new Date(dateTimestamp).toLocaleString('en-US', { month: 'short' })}
				{/if}
			</div>
		</foreignObject>
	{/each}

	<path stroke="#44CA96" fill="#44CA961f" d={path} />

	{#each points as [[x, y], [dateTimestamp, value]]}
		{#if dateTimestamp !== null}
			<circle class:zero={value === 0} class:positive={value > 0} cx={x} cy={y} r={6}>
				<title>{dateTimeFormatter.format(new Date(dateTimestamp))}, {currencyFormatter.format(value)}</title>
			</circle>
		{/if}
	{/each}

	{#if detailed}
		{#each textaxis as { x, y, value }}
			{#if y >= 0 && y <= height}
				<text {x} {y}>{value}</text>
			{/if}
		{/each}

		{#each xaxisExtrusion as { x, y }}
			{#if y >= 0 && y <= height}
				<line x1={x} x2={x + axisExtrusion} y1={y} y2={y} />
			{/if}
		{/each}
	{/if}
</svg>

<style>
	svg {
		position: relative;
		pointer-events: all;
		border: 10px;
		overflow: visible;
		margin: 2rem 0 0 0;
	}

	circle {
		stroke: none;
		fill-opacity: 0;
	}

	circle.positive {
		fill: #45caa1;
	}

	circle.zero {
		fill: #ccc;
	}

	svg circle:hover {
		fill-opacity: 1;
	}

	line {
		stroke: #ccc;
		stroke-dasharray: 0;
		stroke-width: 1;
	}

	line.grid {
		stroke: var(--border-color-default);
	}

	path {
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	text {
		font-size: 14px;
		fill: var(--primary-foreground-color);
	}

	div.date-label-box {
		font-size: small;
		background-color: var(--tertiary-background-color);
		border-radius: 5px 5px 5px 0;
		width: -moz-fit-content;
		width: fit-content;
		padding: 0.1rem 0.2rem;
	}
</style>
