<script lang="ts">
	import * as d3 from 'd3';
	import * as versor from '$lib/ts/thirdparty/Versor';
	import * as topojson from 'topojson-client';
	import * as world_atlas from '$lib/assets/data/data_countries_110m.json';
	import { onMount } from 'svelte';

	let world: any = world_atlas;
	let countries = topojson.feature(world, world.objects.countries).features;
	let land = topojson.feature(world, world.objects.land);
	let borders = topojson.mesh(world, world.objects.countries, (a: any, b: any) => a !== b);

	let width = 500;
	let height = 0;
	const sensitivity = 75;

	const projection = d3.geoOrthographic().precision(0.1);
	const initialScale = projection.scale();
	let rotation: [number, number, number] = [100, -30, 0];
	projection.rotate(rotation);

	let path = d3.geoPath(projection);
	const graticule = d3.geoGraticule10();
	const outline = { type: 'Sphere' };

	const [[x0, y0], [x1, y1]] = d3.geoPath(projection.fitWidth(width, outline)).bounds(outline);
	const dy = Math.ceil(y1 - y0),
		l = Math.min(Math.ceil(x1 - x0), dy);
	projection.scale((projection.scale() * (l - 1)) / l).precision(0.2);
	height = dy;

	let svgElement: Element;

	onMount(() => {
		const svg = d3.select(svgElement);

		const drag = d3.drag().on('drag', dragged).on('end', dragEnd);
		const zoom = d3.zoom().on('start', zoomStarted).on('zoom', zoomed);

		let v0;
		let r0;
		let q0;

		let dx = 0;
		let dy = 0;

		function dragEnd(event) {

			if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
				const rotate = projection.rotate();
				const k = (10 * sensitivity) / projection.scale();

				const r0 = [rotate[0], rotate[1], 0];
				const r1 = [rotate[0] + dx * k, rotate[1] - dy * k, 0];

				if (r1[1] > 90) r1[1] = 90;
				if (r1[1] < -90) r1[1] = -90;

				dx = 0;
				dy = 0;

				const iv = versor.interpolate(r0, r1);

				projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);

				d3.transition()
					.duration(2000)
					.ease(d3.easeCubicOut)
					.tween('render', () => (t) => {
						projection.rotate(iv(t));
						path = d3.geoPath().projection(projection);
					});
			}
		}

		function dragged(event) {

			const rotate = projection.rotate();
			const k = sensitivity / projection.scale();

			const r1 = [rotate[0] + event.dx * k, rotate[1] - event.dy * k];

			if (r1[1] > 90) r1[1] = 90;
			if (r1[1] < -90) r1[1] = -90;

			projection.rotate(r1);

			dx = event.dx;
			dy = event.dy;

			path = d3.geoPath().projection(projection);
		}

		function zoomStarted(event) {
			const pointer = d3.pointers(event, svgElement);

			if (pointer[0]) {
				v0 = versor.cartesian(projection.invert(pointer[0]));
				r0 = projection.rotate();
				q0 = versor(r0);
			}
		}

		function zoomed(event) {
			if (event.transform.k > 0.3) {
				projection.scale(initialScale * event.transform.k);

				const pointer = d3.pointers(event, svgElement);

				if (pointer[0]) {
					const v1 = versor.cartesian(projection.rotate(r0).invert(pointer[0]));
					const q1 = versor.multiply(q0, versor.delta(v0, v1));
					const rotation = versor.rotation(q1);

					const northUp = true;
					if (northUp) {
						// don't rotate on Z axis
						rotation[2] = 0; 
					}

					projection.rotate(rotation);
				}

				path = d3.geoPath().projection(projection);
			} else {
				event.transform.k = 0.3;
			}
		}

		svg.call(drag).call(zoom);
	});
</script>

<svg bind:this={svgElement} viewBox="0 0 {width} {height}" width="100%" {height}>
	<path id="outline" d={path(outline)} fill="#555" />
	<path d={path(graticule)} stroke="#4e4e4e" fill="none"></path>

	{#each countries as country, i}
		{#if country.id === '840'}
			<path class="country-active" d={path(country)} id={country.id} name={country.properties.name} />

			<!-- california coordinate -->
			{@const coordinates = [-122.048452, 37.3783961]}
			<path d={path.pointRadius(10)({ type: 'Point', coordinates })} stroke-width="10" class="point-1"></path>
			<path d={path.pointRadius(3)({ type: 'Point', coordinates })} stroke-width="3" class="point-2"></path>
			<path d={path.pointRadius(2)({ type: 'Point', coordinates })} stroke-width="2" class="point-3"></path>
		{:else}
			<path class="country" d={path(country)} id={country.id} name={country.properties.name}></path>
		{/if}
	{/each}

	<path d={path(borders)} stroke="#4e4e4e" stroke-width="0.5" fill="none"></path>
</svg>

<style>
	svg {
		display: block;
		pointer-events: all;
	}
	.country:hover {
		fill: #aaa;
	}

	.country {
		fill: #888;
	}

	.country-active {
		fill: var(--button-color-background-primary);
	}

	.point-1 {
		fill: #00000066;
	}

	.point-2 {
		fill: #fff;
	}

	.point-3 {
		fill: #000000;
	}
</style>
