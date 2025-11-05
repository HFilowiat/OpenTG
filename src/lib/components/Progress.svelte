<script lang="ts">
	export let value: number;
	export let max: number = 100;
	export let height: number = 1;

	$: t = value / max > 1 ? 1 : value / max < 0 ? 0 : value / max;

	$: percentage = t * 100;
</script>

<div class="box" style="--height:{height}rem">
	<div style="--value:{percentage}%;" class="progress" />
</div>

<style>
	.box {
		width: 100%;
		height: var(--height);
		border-radius: 2px;
		background-color: var(--tertiary-background-color);
		overflow: hidden;
	}

	.progress {
		width: var(--value);
		height: 100%;
		background-color: #59b2dc;
	}
</style>
