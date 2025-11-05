<script lang="ts">
	export let steps: number = 3;
	export let progress: number = 0;

	$: steplength = 100 / steps;
	$: progressClamped = progress < 0 ? 0 : progress > 100 ? 100 : progress;
</script>

<div class="box">
	{#each Array(steps) as _, i}
		<div
			class:set={progressClamped >= steplength * i}
			style="x: {progressClamped}; y: {steplength * (1 + i)}">
			{#if progressClamped >= steplength * (1 + i)}
				<div style="width:100%; height: 100%; border-radius: 2px;" class="progress" />
			{:else}
				<div
					style="width:{(progressClamped % steplength) * steps}%; height: 100%; border-radius: 2px;"
					class="progress" />
			{/if}
		</div>
	{/each}
</div>

<style>
	.box > div {
		background-color: var(--tertiary-background-color);
		border: 0;
		border-radius: 2px;
		width: 100%;
		height: 2px;
	}

	div.set {
		height: 100%;
	}

	div.set > div {
		background-color: #44ca96;
	}

	.box {
		width: 100%;
		height: 14px;
		border-radius: 2px;
		display: flex;
		gap: 2px;
		align-items: center;
	}
</style>
