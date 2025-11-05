<script lang="ts">
	export let name: string = '';
	export let title: string = '';
</script>

<div class="card" {title}>
	<div style="display: flex;gap: 0.5rem;align-items: center;">
		<slot name="icon" />
		{#if name !== ''}
			<span style="font-weight: 600; margin: 0">{name}</span>
		{/if}
		<slot name="action" />
	</div>

	<slot />

	<slot name="footer" />
</div>

<style>
	.card {
		border: 1px solid var(--border-color-default);
		background-color: var(--secondary-background-color);
		border-radius: 8px;
		display: flex;
		gap: 0.5rem;
		flex-direction: column;
		padding: 1rem 1.5rem;
	}
</style>
